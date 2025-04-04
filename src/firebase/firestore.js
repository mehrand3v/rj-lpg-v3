// src/firebase/firestore.js
import { 
    collection, 
    doc, 
    addDoc, 
    setDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    startAfter,
    runTransaction,
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from './config';
  import { COLLECTIONS } from './schema';
  
  // Generic CRUD operations
  
  // Create a new document with auto-generated ID
  export const createDocument = async (collectionName, data) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  };
  
  // Create a document with a specific ID
  export const createDocumentWithId = async (collectionName, docId, data) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docId;
    } catch (error) {
      console.error(`Error creating document with ID in ${collectionName}:`, error);
      throw error;
    }
  };
  
  // Get a document by ID
  export const getDocument = async (collectionName, docId) => {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  };
  
  // Update a document
  export const updateDocument = async (collectionName, docId, data) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  };
  
  // Delete a document
  export const deleteDocument = async (collectionName, docId) => {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      return true;
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  };
  
  // Get all documents from a collection with optional query constraints
  export const getDocuments = async (collectionName, queryConstraints = []) => {
    try {
      const q = query(collection(db, collectionName), ...queryConstraints);
      const querySnapshot = await getDocs(q);
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      return documents;
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      throw error;
    }
  };
  
  // Get the next transaction ID (Sales or Receipt)
  export const getNextTransactionId = async (type = 'sale') => {
    try {
      const field = type === 'sale' ? 'salesId' : 'receiptId';
      const prefix = type === 'sale' ? 'S' : 'R';
      
      const counterRef = doc(db, COLLECTIONS.COUNTERS, 'ids');
      
      // Use transaction to ensure atomic update of counter
      const nextId = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        if (!counterDoc.exists()) {
          throw new Error("Counter document does not exist!");
        }
        
        const currentValue = counterDoc.data()[field] || 0;
        const nextValue = currentValue + 1;
        
        transaction.update(counterRef, { 
          [field]: nextValue,
          updatedAt: serverTimestamp()
        });
        
        return nextValue;
      });
      
      return `${prefix}${nextId}`;
    } catch (error) {
      console.error("Error getting next transaction ID:", error);
      throw error;
    }
  };