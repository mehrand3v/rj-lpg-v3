// src/services/customerService.js
import { 
    createDocument, 
    getDocuments, 
    getDocument, 
    updateDocument, 
    deleteDocument,
    createDocumentWithId
  } from '../firebase/firestore';
  import { COLLECTIONS } from '../firebase/schema';
  import { where, orderBy, query, collection, getDocs } from 'firebase/firestore';
  import { db } from '@/firebase/config';
  
  // Create a new customer
  export const createCustomer = async (customerData) => {
    try {
      const customerId = await createDocument(COLLECTIONS.CUSTOMERS, customerData);
      return customerId;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  };
  
  // Get all customers
  export const getAllCustomers = async (includeInactive = false) => {
    try {
      const constraints = [orderBy('name')];
      
      if (!includeInactive) {
        constraints.unshift(where('status', '==', 'active'));
      }
      
      const customers = await getDocuments(COLLECTIONS.CUSTOMERS, constraints);
      return customers;
    } catch (error) {
      console.error('Error getting customers:', error);
      throw error;
    }
  };
  
  // Get a specific customer by ID
  export const getCustomerById = async (customerId) => {
    try {
      const customer = await getDocument(COLLECTIONS.CUSTOMERS, customerId);
      return customer;
    } catch (error) {
      console.error(`Error getting customer with ID ${customerId}:`, error);
      throw error;
    }
  };
  
  // Update a customer
  export const updateCustomer = async (customerId, customerData) => {
    try {
      await updateDocument(COLLECTIONS.CUSTOMERS, customerId, customerData);
      return true;
    } catch (error) {
      console.error(`Error updating customer with ID ${customerId}:`, error);
      throw error;
    }
  };
  
  // Delete a customer
  export const deleteCustomer = async (customerId) => {
    try {
      // Check for outstanding balance or cylinders before deletion
      const customer = await getCustomerById(customerId);
      
      if (customer.outstandingBalance > 0) {
        throw new Error('Cannot delete customer with outstanding balance');
      }
      
      // Check for outstanding cylinders
      const cylinderTracking = await getCylinderTrackingForCustomer(customerId);
      if (cylinderTracking && cylinderTracking.cylindersOutstanding > 0) {
        throw new Error('Cannot delete customer with outstanding cylinders');
      }
      
      await deleteDocument(COLLECTIONS.CUSTOMERS, customerId);
      return true;
    } catch (error) {
      console.error(`Error deleting customer with ID ${customerId}:`, error);
      throw error;
    }
  };
  
  // Search for customers
  export const searchCustomers = async (searchTerm) => {
    try {
      const customers = await getAllCustomers();
      
      // Filter customers based on search term
      // Note: This is a simple client-side search. For a larger dataset,
      // you might want to use Firestore's array-contains or implement 
      // a more sophisticated search solution.
      return customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  };
  
  // Get customer's cylinder tracking
  export const getCylinderTrackingForCustomer = async (customerId) => {
    try {
      return await getDocument(COLLECTIONS.CYLINDERS, customerId);
    } catch (error) {
      console.error(`Error getting cylinder tracking for customer ${customerId}:`, error);
      throw error;
    }
  };
  
  // Get all vehicles for a customer
  export const getVehiclesForCustomer = async (customerId) => {
    try {
      const vehicles = await getDocuments(COLLECTIONS.VEHICLES, [
        where('customerId', '==', customerId)
      ]);
      return vehicles;
    } catch (error) {
      console.error(`Error getting vehicles for customer ${customerId}:`, error);
      throw error;
    }
  };
  
  // Add a vehicle for a customer
  export const addVehicle = async (vehicleData) => {
    try {
      const vehicleId = await createDocument(COLLECTIONS.VEHICLES, vehicleData);
      return vehicleId;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  };
  
  // Update a vehicle
  export const updateVehicle = async (vehicleId, vehicleData) => {
    try {
      await updateDocument(COLLECTIONS.VEHICLES, vehicleId, vehicleData);
      return true;
    } catch (error) {
      console.error(`Error updating vehicle with ID ${vehicleId}:`, error);
      throw error;
    }
  };
  
  // Delete a vehicle
  export const deleteVehicle = async (vehicleId) => {
    try {
      // Check if vehicle is linked to any active sales before deleting
      const vehicleSales = await getDocuments(COLLECTIONS.SALES, [
        where('vehicleId', '==', vehicleId),
        where('status', '==', 'pending')
      ]);
      
      if (vehicleSales.length > 0) {
        throw new Error('Cannot delete vehicle with active sales');
      }
      
      await deleteDocument(COLLECTIONS.VEHICLES, vehicleId);
      return true;
    } catch (error) {
      console.error(`Error deleting vehicle with ID ${vehicleId}:`, error);
      throw error;
    }
  };