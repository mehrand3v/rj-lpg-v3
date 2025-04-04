// src/lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getCustomerById } from "@/services/customerService";

/**
 * Utility function for combining tailwind classes with clsx
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Validates if a value is a valid document ID for Firestore
 * @param {any} id - The value to check
 * @returns {boolean} - Whether the value is a valid ID
 */
export const isValidDocId = (id) => {
  // Must be a non-empty string
  return typeof id === 'string' && id.trim().length > 0;
};

/**
 * Safe wrapper for getCustomerById that handles potential invalid IDs
 * @param {any} customerId - The customer ID to retrieve
 * @returns {Promise<Object|null>} - The customer data or null if invalid ID
 */
export const safeGetCustomerById = async (customerId) => {
  if (!isValidDocId(customerId)) {
    console.warn(`Invalid customer ID provided: ${customerId}`);
    return null;
  }
  
  try {
    return await getCustomerById(customerId);
  } catch (error) {
    console.error(`Error fetching customer ${customerId}:`, error);
    return null;
  }
};

/**
 * Format a date from Firestore timestamp
 * @param {Object} timestamp - Firestore timestamp object
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatDate = (timestamp, options = {}) => {
  if (!timestamp || !timestamp.seconds) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Format currency value
 * @param {number} amount - The amount to format
 * @param {Object} options - Intl.NumberFormat options
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
  if (amount === undefined || amount === null) return '$0.00';
  
  const defaultOptions = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  };
  
  return new Intl.NumberFormat('en-US', { ...defaultOptions, ...options }).format(amount);
};

/**
 * Safe access to nested object properties
 * @param {Object} obj - The object to access
 * @param {string} path - The path to the property (e.g., 'user.address.city')
 * @param {any} defaultValue - Default value if property doesn't exist
 * @returns {any} - The property value or default value
 */
export const getNestedValue = (obj, path, defaultValue = null) => {
  if (!obj || !path) return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue;
};

/**
 * Truncate text with ellipsis if it exceeds maxLength
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Generate a random string ID (for temporary IDs, not database keys)
 * @param {number} length - Length of the ID to generate
 * @returns {string} - Random string ID
 */
export const generateTempId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};