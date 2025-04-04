// src/firebase/auth.js
import { 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserSessionPersistence
  } from 'firebase/auth';
  import { auth, db } from './config';
  import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
  
  // Sign in a user with email and password
  export const signIn = async (email, password) => {
    try {
      // Set persistence to session (cleared when window is closed)
      await setPersistence(auth, browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing in:", error.message);
      throw error;
    }
  };
  
  // Sign out the current user
  export const logOut = async () => {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error("Error signing out:", error.message);
      throw error;
    }
  };
  
  // Get the current user
  export const getCurrentUser = () => {
    return auth.currentUser;
  };
  
  // Listen for authentication state changes
  export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
  };
  
  // Get user profile from Firestore
  export const getUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting user profile:", error.message);
      throw error;
    }
  };
  
  // Create or update user profile in Firestore
  export const updateUserProfile = async (userId, userData) => {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error("Error updating user profile:", error.message);
      throw error;
    }
  };