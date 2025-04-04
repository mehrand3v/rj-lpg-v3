// src/services/cylinderService.js
import { 
    getDocument, 
    updateDocument, 
    getDocuments 
  } from '../firebase/firestore';
  import { COLLECTIONS } from '../firebase/schema';
  import { doc, runTransaction, increment, serverTimestamp } from 'firebase/firestore';
  import { db } from '../firebase/config';
  import { where, orderBy } from 'firebase/firestore';
  
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
        
        // Get current cylinder tracking data
        const cylinderDoc = await transaction.get(cylinderRef);
        
        if (!cylinderDoc.exists()) {
          throw new Error('No cylinder tracking found for this customer');
        }
        
        const cylinderData = cylinderDoc.data();
        
        // Check if trying to return more cylinders than outstanding
        if (cylindersReturned > cylinderData.cylindersOutstanding) {
          throw new Error(`Customer only has ${cylinderData.cylindersOutstanding} cylinders outstanding`);
        }
        
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
      // In a real application, you would likely store cylinder return events
      // in a separate collection. For simplicity, we're not implementing that here.
      return [];
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
        
        // Get current cylinder tracking data
        const cylinderDoc = await transaction.get(cylinderRef);
        
        if (!cylinderDoc.exists()) {
          throw new Error('No cylinder tracking found for this customer');
        }
        
        const cylinderData = cylinderDoc.data();
        
        // Check if all cylinders have been returned
        if (cylinderData.cylindersOutstanding > 0) {
          throw new Error(`Customer still has ${cylinderData.cylindersOutstanding} cylinders outstanding`);
        }
        
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