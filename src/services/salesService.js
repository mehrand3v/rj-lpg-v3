// src/services/salesService.js
import { 
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  getNextTransactionId
} from '../firebase/firestore';
import { COLLECTIONS } from '../firebase/schema';
import { doc, runTransaction, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { where, orderBy } from 'firebase/firestore';

// Create a new sale transaction
export const createSale = async (saleData) => {
  try {
    // Get next sale ID (e.g., S1, S2, etc.)
    const transactionId = await getNextTransactionId('sale');
    
    // Calculate the total amount
    const amount = calculateSaleAmount(saleData);
    
    // Prepare sale data
    const sale = {
      ...saleData,
      id: transactionId,
      amount,
      date: serverTimestamp(),
      status: saleData.paymentType === 'cash' ? 'completed' : 'pending',
    };
    
    // Use a transaction to update customer balance and cylinder tracking atomically
    await runTransaction(db, async (transaction) => {
      // Get customer reference
      const customerRef = doc(db, COLLECTIONS.CUSTOMERS, saleData.customerId);
      
      // IMPORTANT: First perform all reads
      // Read customer document (needed for transaction validation)
      await transaction.get(customerRef);
      
      // Prepare cylinder tracking reference if needed
      let cylinderRef = null;
      let cylinderDoc = null;
      
      // If this is a cylinder sale, we need to read the cylinder tracking document
      if (saleData.type === 'cylinder') {
        cylinderRef = doc(db, COLLECTIONS.CYLINDERS, saleData.customerId);
        cylinderDoc = await transaction.get(cylinderRef);
      }
      
      // After all reads are done, now perform writes
      
      // Update customer's outstanding balance if credit sale
      if (saleData.paymentType === 'credit') {
        transaction.update(customerRef, {
          outstandingBalance: increment(amount),
          updatedAt: serverTimestamp()
        });
      }
      
      // Update cylinder tracking if this is a cylinder sale
      if (saleData.type === 'cylinder') {
        if (cylinderDoc.exists()) {
          // Update existing cylinder tracking
          transaction.update(cylinderRef, {
            cylindersDelivered: increment(saleData.cylindersDelivered),
            cylindersOutstanding: increment(saleData.cylindersDelivered),
            lastUpdate: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } else {
          // Create new cylinder tracking
          transaction.set(cylinderRef, {
            customerId: saleData.customerId,
            cylindersDelivered: saleData.cylindersDelivered,
            cylindersReturned: 0,
            cylindersOutstanding: saleData.cylindersDelivered,
            lastUpdate: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        
        // Update customer with cylinder count
        transaction.update(customerRef, {
          cylindersOutstanding: increment(saleData.cylindersDelivered),
          updatedAt: serverTimestamp()
        });
      }
      
      // Create the sale document with the transaction ID
      const saleRef = doc(db, COLLECTIONS.SALES, transactionId);
      transaction.set(saleRef, {
        ...sale,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
    
    return transactionId;
  } catch (error) {
    console.error('Error creating sale:', error);
    throw error;
  }
};

// Calculate sale amount based on sale type
const calculateSaleAmount = (saleData) => {
  if (saleData.type === 'cylinder') {
    // Round to integer
    return Math.round(saleData.cylindersDelivered * saleData.rate);
  } else if (saleData.type === 'weight') {
    // Round to integer
    return Math.round(saleData.weight * saleData.rate);
  }
  return 0;
};

// Get all sales
export const getAllSales = async (constraints = []) => {
  try {
    const defaultConstraints = [orderBy('date', 'desc')];
    return await getDocuments(COLLECTIONS.SALES, [...constraints, ...defaultConstraints]);
  } catch (error) {
    console.error('Error getting sales:', error);
    throw error;
  }
};

// Get sales for a specific customer
export const getSalesForCustomer = async (customerId) => {
  try {
    return await getDocuments(COLLECTIONS.SALES, [
      where('customerId', '==', customerId),
      orderBy('date', 'desc')
    ]);
  } catch (error) {
    console.error(`Error getting sales for customer ${customerId}:`, error);
    throw error;
  }
};

// Get a specific sale by ID
export const getSaleById = async (saleId) => {
  try {
    return await getDocument(COLLECTIONS.SALES, saleId);
  } catch (error) {
    console.error(`Error getting sale with ID ${saleId}:`, error);
    throw error;
  }
};

// Update a sale
export const updateSale = async (saleId, saleData) => {
  try {
    // Get the original sale to compare changes
    const originalSale = await getSaleById(saleId);
    if (!originalSale) {
      throw new Error('Sale not found');
    }
    
    // Calculate old and new amounts
    const oldAmount = originalSale.amount;
    const newAmount = calculateSaleAmount(saleData);
    const amountDifference = newAmount - oldAmount;
    
    // Use a transaction to update everything atomically
    await runTransaction(db, async (transaction) => {
      // References
      const saleRef = doc(db, COLLECTIONS.SALES, saleId);
      const customerRef = doc(db, COLLECTIONS.CUSTOMERS, saleData.customerId);
      
      // First perform all reads
      await transaction.get(saleRef);
      await transaction.get(customerRef);
      
      let cylinderRef = null;
      let cylinderDoc = null;
      
      // If dealing with cylinder sales, prepare cylinder reference
      if (originalSale.type === 'cylinder' || saleData.type === 'cylinder') {
        cylinderRef = doc(db, COLLECTIONS.CYLINDERS, saleData.customerId);
        cylinderDoc = await transaction.get(cylinderRef);
      }
      
      // Now perform all writes
      
      // Update sale with new data
      transaction.update(saleRef, {
        ...saleData,
        amount: newAmount,
        updatedAt: serverTimestamp()
      });
      
      // If credit sale, update customer balance with the difference
      if (originalSale.paymentType === 'credit' && saleData.paymentType === 'credit') {
        // Update balance with the difference
        transaction.update(customerRef, {
          outstandingBalance: increment(amountDifference),
          updatedAt: serverTimestamp()
        });
      } 
      // If changing from cash to credit
      else if (originalSale.paymentType === 'cash' && saleData.paymentType === 'credit') {
        // Add full new amount to balance
        transaction.update(customerRef, {
          outstandingBalance: increment(newAmount),
          updatedAt: serverTimestamp()
        });
      } 
      // If changing from credit to cash
      else if (originalSale.paymentType === 'credit' && saleData.paymentType === 'cash') {
        // Subtract full old amount from balance
        transaction.update(customerRef, {
          outstandingBalance: increment(-oldAmount),
          updatedAt: serverTimestamp()
        });
      }
      
      // Handle cylinder count updates if this is a cylinder sale
      if (originalSale.type === 'cylinder' && saleData.type === 'cylinder') {
        const cylinderDifference = saleData.cylindersDelivered - originalSale.cylindersDelivered;
        
        if (cylinderDifference !== 0) {
          // Update cylinder tracking
          transaction.update(cylinderRef, {
            cylindersDelivered: increment(cylinderDifference),
            cylindersOutstanding: increment(cylinderDifference),
            lastUpdate: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          // Update customer cylinder count
          transaction.update(customerRef, {
            cylindersOutstanding: increment(cylinderDifference),
            updatedAt: serverTimestamp()
          });
        }
      }
      // If changing sale type from weight to cylinder
      else if (originalSale.type === 'weight' && saleData.type === 'cylinder') {
        if (cylinderDoc.exists()) {
          // Update existing cylinder tracking
          transaction.update(cylinderRef, {
            cylindersDelivered: increment(saleData.cylindersDelivered),
            cylindersOutstanding: increment(saleData.cylindersDelivered),
            lastUpdate: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } else {
          // Create new cylinder tracking
          transaction.set(cylinderRef, {
            customerId: saleData.customerId,
            cylindersDelivered: saleData.cylindersDelivered,
            cylindersReturned: 0,
            cylindersOutstanding: saleData.cylindersDelivered,
            lastUpdate: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        
        // Update customer cylinder count
        transaction.update(customerRef, {
          cylindersOutstanding: increment(saleData.cylindersDelivered),
          updatedAt: serverTimestamp()
        });
      }
      // If changing sale type from cylinder to weight
      else if (originalSale.type === 'cylinder' && saleData.type === 'weight') {
        // Update cylinder tracking
        transaction.update(cylinderRef, {
          cylindersDelivered: increment(-originalSale.cylindersDelivered),
          cylindersOutstanding: increment(-originalSale.cylindersDelivered),
          lastUpdate: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        // Update customer cylinder count
        transaction.update(customerRef, {
          cylindersOutstanding: increment(-originalSale.cylindersDelivered),
          updatedAt: serverTimestamp()
        });
      }
    });
    
    return true;
  } catch (error) {
    console.error(`Error updating sale with ID ${saleId}:`, error);
    throw error;
  }
};

// Delete a sale
export const deleteSale = async (saleId) => {
  try {
    // Get the sale to be deleted
    const sale = await getSaleById(saleId);
    if (!sale) {
      throw new Error('Sale not found');
    }
    
    // Use a transaction to revert all changes
    await runTransaction(db, async (transaction) => {
      const saleRef = doc(db, COLLECTIONS.SALES, saleId);
      const customerRef = doc(db, COLLECTIONS.CUSTOMERS, sale.customerId);
      
      // First perform all reads
      await transaction.get(saleRef);
      await transaction.get(customerRef);
      
      let cylinderRef = null;
      
      // If cylinder sale, prepare cylinder reference
      if (sale.type === 'cylinder') {
        cylinderRef = doc(db, COLLECTIONS.CYLINDERS, sale.customerId);
        await transaction.get(cylinderRef);
      }
      
      // Now perform all writes
      
      // If credit sale, reduce customer balance
      if (sale.paymentType === 'credit') {
        transaction.update(customerRef, {
          outstandingBalance: increment(-sale.amount),
          updatedAt: serverTimestamp()
        });
      }
      
      // If cylinder sale, update cylinder tracking
      if (sale.type === 'cylinder') {
        transaction.update(cylinderRef, {
          cylindersDelivered: increment(-sale.cylindersDelivered),
          cylindersOutstanding: increment(-sale.cylindersDelivered),
          lastUpdate: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        // Update customer cylinder count
        transaction.update(customerRef, {
          cylindersOutstanding: increment(-sale.cylindersDelivered),
          updatedAt: serverTimestamp()
        });
      }
      
      // Delete the sale
      transaction.delete(saleRef);
    });
    
    return true;
  } catch (error) {
    console.error(`Error deleting sale with ID ${saleId}:`, error);
    throw error;
  }
};

// Get recent sales for dashboard
export const getRecentSales = async (limit = 5) => {
  try {
    return await getDocuments(COLLECTIONS.SALES, [
      orderBy('date', 'desc'),
      where('limit', '==', limit)
    ]);
  } catch (error) {
    console.error('Error getting recent sales:', error);
    throw error;
  }
};