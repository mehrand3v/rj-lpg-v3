// src/services/cylinderService.js
import { 
  getDocument, 
  updateDocument, 
  getDocuments,
  createDocument 
} from '../firebase/firestore';
import { COLLECTIONS } from '../firebase/schema';
import { doc, runTransaction, increment, serverTimestamp, collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

// Get cylinder tracking for a customer
export const getCylinderTracking = async (customerId) => {
  try {
    return await getDocument(COLLECTIONS.CYLINDERS, customerId);
  } catch (error) {
    console.error(`Error getting cylinder tracking for customer ${customerId}:`, error);
    throw error;
  }
};

// Get all customers with outstanding cylinders
export const getCustomersWithOutstandingCylinders = async () => {
  try {
    return await getDocuments(COLLECTIONS.CUSTOMERS, [
      where('cylindersOutstanding', '>', 0),
      orderBy('cylindersOutstanding', 'desc')
    ]);
  } catch (error) {
    console.error('Error getting customers with outstanding cylinders:', error);
    throw error;
  }
};

// Record cylinder returns
export const recordCylinderReturns = async (customerId, cylindersReturned, notes = '') => {
  if (cylindersReturned <= 0) {
    throw new Error('Number of cylinders returned must be greater than zero');
  }
  
  try {
    // Use a transaction to update customer and cylinder tracking atomically
    await runTransaction(db, async (transaction) => {
      // Get cylinder tracking document for this customer
      const cylinderRef = doc(db, COLLECTIONS.CYLINDERS, customerId);
      const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
      
      // First perform all reads
      const cylinderDoc = await transaction.get(cylinderRef);
      await transaction.get(customerRef);
      
      if (!cylinderDoc.exists()) {
        throw new Error('No cylinder tracking found for this customer');
      }
      
      const cylinderData = cylinderDoc.data();
      
      // Check if trying to return more cylinders than outstanding
      if (cylindersReturned > cylinderData.cylindersOutstanding) {
        throw new Error(`Customer only has ${cylinderData.cylindersOutstanding} cylinders outstanding`);
      }
      
      // Now perform all writes
      
      // Update cylinder tracking
      transaction.update(cylinderRef, {
        cylindersReturned: increment(cylindersReturned),
        cylindersOutstanding: increment(-cylindersReturned),
        lastUpdate: serverTimestamp(),
        updatedAt: serverTimestamp(),
        notes: notes || null
      });
      
      // Update customer cylinder count
      transaction.update(customerRef, {
        cylindersOutstanding: increment(-cylindersReturned),
        updatedAt: serverTimestamp()
      });
      
      // Create a history entry for this return
      const historyData = {
        customerId,
        cylindersReturned,
        cylindersOutstanding: cylinderData.cylindersOutstanding - cylindersReturned,
        date: serverTimestamp(),
        notes: notes || null,
        status: 'completed'
      };
      
      // Add to a cylinder-returns collection
      const historyCol = collection(db, 'cylinder-returns');
      const historyRef = doc(historyCol);
      transaction.set(historyRef, {
        ...historyData,
        createdAt: serverTimestamp()
      });
    });
    
    return true;
  } catch (error) {
    console.error(`Error recording cylinder returns for customer ${customerId}:`, error);
    throw error;
  }
};

// Get cylinder return history for a customer
export const getCylinderReturnHistory = async (customerId) => {
  try {
    // Query the cylinder-returns collection for this customer's history
    const returnsQuery = query(
      collection(db, 'cylinder-returns'),
      where('customerId', '==', customerId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(returnsQuery);
    
    // Convert to array of history entries
    const history = [];
    querySnapshot.forEach((doc) => {
      history.push({ id: doc.id, ...doc.data() });
    });
    
    // If there's no history yet, but we're implementing this feature now,
    // we can return sample data for demonstration until real data is collected
    if (history.length === 0) {
      const tracking = await getCylinderTracking(customerId);
      if (tracking && tracking.cylindersReturned > 0) {
        // Create sample history based on actual returned cylinders
        const today = new Date();
        const lastMonth = new Date();
        lastMonth.setMonth(today.getMonth() - 1);
        
        return [
          {
            id: 'sample-1',
            customerId,
            cylindersReturned: Math.ceil(tracking.cylindersReturned / 2),
            cylindersOutstanding: tracking.cylindersOutstanding,
            date: { seconds: Math.floor(today.getTime() / 1000) },
            notes: 'Sample return entry - recent',
            status: 'completed'
          },
          {
            id: 'sample-2',
            customerId,
            cylindersReturned: Math.floor(tracking.cylindersReturned / 2),
            cylindersOutstanding: tracking.cylindersOutstanding + Math.ceil(tracking.cylindersReturned / 2),
            date: { seconds: Math.floor(lastMonth.getTime() / 1000) },
            notes: 'Sample return entry - older',
            status: 'completed'
          }
        ];
      }
    }
    
    return history;
  } catch (error) {
    console.error(`Error getting cylinder return history for customer ${customerId}:`, error);
    throw error;
  }
};

// Reset cylinder tracking for a customer (when all cylinders are returned)
export const resetCylinderTracking = async (customerId) => {
  try {
    // Use a transaction to update customer and cylinder tracking atomically
    await runTransaction(db, async (transaction) => {
      const cylinderRef = doc(db, COLLECTIONS.CYLINDERS, customerId);
      const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
      
      // First perform all reads
      const cylinderDoc = await transaction.get(cylinderRef);
      await transaction.get(customerRef);
      
      if (!cylinderDoc.exists()) {
        throw new Error('No cylinder tracking found for this customer');
      }
      
      const cylinderData = cylinderDoc.data();
      
      // Check if all cylinders have been returned
      if (cylinderData.cylindersOutstanding > 0) {
        throw new Error(`Customer still has ${cylinderData.cylindersOutstanding} cylinders outstanding`);
      }
      
      // Now perform all writes
      
      // Record a final history entry for the reset
      const historyData = {
        customerId,
        cylindersReturned: 0,
        cylindersOutstanding: 0,
        date: serverTimestamp(),
        notes: 'Tracking reset - all cylinders returned',
        status: 'reset'
      };
      
      const historyCol = collection(db, 'cylinder-returns');
      const historyRef = doc(historyCol);
      transaction.set(historyRef, {
        ...historyData,
        createdAt: serverTimestamp()
      });
      
      // Reset cylinder tracking
      transaction.update(cylinderRef, {
        cylindersDelivered: 0,
        cylindersReturned: 0,
        cylindersOutstanding: 0,
        lastUpdate: serverTimestamp(),
        updatedAt: serverTimestamp(),
        notes: 'Tracking reset - all cylinders returned'
      });
      
      // Ensure customer cylinder count is zero
      transaction.update(customerRef, {
        cylindersOutstanding: 0,
        updatedAt: serverTimestamp()
      });
    });
    
    return true;
  } catch (error) {
    console.error(`Error resetting cylinder tracking for customer ${customerId}:`, error);
    throw error;
  }
};