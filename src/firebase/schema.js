// src/firebase/schema.js
import { db } from './config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';

// Collection names
export const COLLECTIONS = {
  CUSTOMERS: 'customers',
  VEHICLES: 'vehicles',
  SALES: 'sales',
  PAYMENTS: 'payments',
  CYLINDERS: 'cylinders',
  COUNTERS: 'counters',
  USERS: 'users',
};

// Initialize transaction ID counters
export const initializeCounters = async () => {
  const countersRef = doc(db, COLLECTIONS.COUNTERS, 'ids');
  
  try {
    // Check if counters already exist
    const countersSnapshot = await getDocs(collection(db, COLLECTIONS.COUNTERS));
    if (countersSnapshot.empty) {
      // Create the initial counters
      await setDoc(countersRef, {
        salesId: 0,
        receiptId: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("Transaction ID counters initialized");
    }
  } catch (error) {
    console.error("Error initializing counters:", error);
    throw error;
  }
};

// Initialize the database schema
export const initializeDatabase = async () => {
  try {
    // Initialize counters for transaction IDs
    await initializeCounters();
    
    // Create any other required initial collections
    console.log("Database schema initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing database schema:", error);
    throw error;
  }
};

// Data models for reference

/*
Customer Model:
{
  id: string,
  name: string,
  address: string,
  phone: string,
  email: string,
  status: 'active' | 'inactive',
  createdAt: timestamp,
  updatedAt: timestamp
}

Vehicle Model:
{
  id: string,
  customerId: string, // Reference to parent customer
  registrationNumber: string,
  description: string,
  createdAt: timestamp,
  updatedAt: timestamp
}

Sale Model:
{
  id: string, // With prefix S1, S2, etc.
  customerId: string,
  type: 'cylinder' | 'weight',
  date: timestamp,
  // For cylinder sales
  cylindersDelivered: number,
  rate: number,
  // For weight sales
  weight: number,
  vehicleId: string,
  amount: number,
  paymentType: 'cash' | 'credit',
  status: 'completed' | 'pending',
  createdAt: timestamp,
  updatedAt: timestamp
}

Payment Model:
{
  id: string, // With prefix R1, R2, etc.
  customerId: string,
  saleId: string, // Optional, can be specific to a sale or general payment
  amount: number,
  date: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}

Cylinder Tracking:
{
  id: string,
  customerId: string,
  cylindersDelivered: number,
  cylindersReturned: number,
  cylindersOutstanding: number, // derived field (delivered - returned)
  lastUpdate: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
*/