// src/services/paymentService.js
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

// Create a new payment
export const createPayment = async (paymentData) => {
  try {
    // Get next receipt ID (e.g., R1, R2, etc.)
    const transactionId = await getNextTransactionId('receipt');
    
    // Prepare payment data
    const payment = {
      ...paymentData,
      id: transactionId,
      date: serverTimestamp(),
    };
    
    // Use a transaction to update customer balance atomically
    await runTransaction(db, async (transaction) => {
      // Get customer reference
      const customerRef = doc(db, COLLECTIONS.CUSTOMERS, paymentData.customerId);
      
      // First perform all reads
      await transaction.get(customerRef);
      
      // Now perform all writes
      
      // Update customer's outstanding balance
      transaction.update(customerRef, {
        outstandingBalance: increment(-paymentData.amount),
        updatedAt: serverTimestamp()
      });
      
      // Create the payment document
      const paymentRef = doc(db, COLLECTIONS.PAYMENTS, transactionId);
      transaction.set(paymentRef, {
        ...payment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
    
    return transactionId;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// Get payments for a customer
export const getPaymentsForCustomer = async (customerId) => {
  try {
    return await getDocuments(COLLECTIONS.PAYMENTS, [
      where('customerId', '==', customerId),
      orderBy('date', 'desc')
    ]);
  } catch (error) {
    console.error(`Error getting payments for customer ${customerId}:`, error);
    throw error;
  }
};

// Get a specific payment by ID
export const getPaymentById = async (paymentId) => {
  try {
    return await getDocument(COLLECTIONS.PAYMENTS, paymentId);
  } catch (error) {
    console.error(`Error getting payment with ID ${paymentId}:`, error);
    throw error;
  }
};

// Update a payment
export const updatePayment = async (paymentId, paymentData) => {
  try {
    // Get the original payment to calculate balance adjustment
    const originalPayment = await getPaymentById(paymentId);
    if (!originalPayment) {
      throw new Error('Payment not found');
    }
    
    // Calculate balance adjustment
    const amountDifference = paymentData.amount - originalPayment.amount;
    
    // Use a transaction to update everything atomically
    await runTransaction(db, async (transaction) => {
      const paymentRef = doc(db, COLLECTIONS.PAYMENTS, paymentId);
      const customerRef = doc(db, COLLECTIONS.CUSTOMERS, paymentData.customerId);
      
      // First perform all reads
      await transaction.get(paymentRef);
      await transaction.get(customerRef);
      
      // Now perform all writes
      
      // Update payment with new data
      transaction.update(paymentRef, {
        ...paymentData,
        updatedAt: serverTimestamp()
      });
      
      // Update customer balance with the difference
      transaction.update(customerRef, {
        outstandingBalance: increment(-amountDifference),
        updatedAt: serverTimestamp()
      });
    });
    
    return true;
  } catch (error) {
    console.error(`Error updating payment with ID ${paymentId}:`, error);
    throw error;
  }
};

// Delete a payment
export const deletePayment = async (paymentId) => {
  try {
    // Get the payment to be deleted
    const payment = await getPaymentById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    // Use a transaction to revert customer balance
    await runTransaction(db, async (transaction) => {
      const paymentRef = doc(db, COLLECTIONS.PAYMENTS, paymentId);
      const customerRef = doc(db, COLLECTIONS.CUSTOMERS, payment.customerId);
      
      // First perform all reads
      await transaction.get(paymentRef);
      await transaction.get(customerRef);
      
      // Now perform all writes
      
      // Revert customer balance
      transaction.update(customerRef, {
        outstandingBalance: increment(payment.amount),
        updatedAt: serverTimestamp()
      });
      
      // Delete the payment
      transaction.delete(paymentRef);
    });
    
    return true;
  } catch (error) {
    console.error(`Error deleting payment with ID ${paymentId}:`, error);
    throw error;
  }
};

// Get all payments
export const getAllPayments = async (constraints = []) => {
  try {
    const defaultConstraints = [orderBy('date', 'desc')];
    return await getDocuments(COLLECTIONS.PAYMENTS, [...constraints, ...defaultConstraints]);
  } catch (error) {
    console.error('Error getting payments:', error);
    throw error;
  }
};

// Get recent payments for dashboard
export const getRecentPayments = async (limit = 5) => {
  try {
    return await getDocuments(COLLECTIONS.PAYMENTS, [
      orderBy('date', 'desc'),
      limit(limit)  // Use Firebase limit() instead of where('limit')
    ]);
  } catch (error) {
    console.error('Error getting recent payments:', error);
    throw error;
  }
};