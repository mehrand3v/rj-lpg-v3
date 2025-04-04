// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { signIn, logOut, onAuthChange, getUserProfile } from '../firebase/auth';

// Create the context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle user login
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const user = await signIn(email, password);
      // User profile will be fetched in the useEffect
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Handle user logout
  const logout = async () => {
    try {
      setError(null);
      await logOut();
      setCurrentUser(null);
      setUserProfile(null);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Monitor authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setLoading(true);
      setCurrentUser(user);
      
      if (user) {
        try {
          // Fetch the user's profile from Firestore
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setError(err.message);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Context value
  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    login,
    logout,
    isAdmin: userProfile?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};