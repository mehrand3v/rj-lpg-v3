// src/models/FirestoreSchema.js
// This file defines the Firestore schema structure for the application

/*
Collection: customers
Description: Stores customer information with running totals
*/
const customerSchema = {
  id: "string", // Firestore document ID
  name: "string", // Customer's full name
  contactNumber: "string", // Customer's contact number
  email: "string", // Customer's email address
  address: "string", // Customer's address

  // Running totals - maintained to avoid recalculation
  totalAmountDue: "number", // Total outstanding amount
  totalPaid: "number", // Total amount paid to date
  currentBalance: "number", // Current balance (totalAmountDue - totalPaid)

  // Cylinder tracking
  totalCylindersBought: "number", // Total cylinders purchased
  totalCylindersReturned: "number", // Total cylinders returned
  currentCylindersHeld: "number", // Current cylinders with customer (bought - returned)

  createdAt: "timestamp",
  updatedAt: "timestamp",
  lastTransactionDate: "timestamp", // Date of last transaction

  // Optional metadata
  notes: "string", // Additional notes about the customer
  isActive: "boolean", // Whether the customer is active
  customerType: "string", // Type of customer (Regular, Business, etc.)
};

/*
Collection: transactions
Description: Records all sales transactions (both cylinder and weight-based)
*/
const transactionSchema = {
  id: "string", // Firestore document ID
  customerId: "string", // Reference to customer document
  customerName: "string", // Denormalized for quick access

  date: "timestamp", // Transaction date

  // Transaction type
  transactionType: "string", // 'cylinder' or 'weight'

  // For cylinder transactions
  cylindersSold: "number", // Number of cylinders sold
  cylinderRate: "number", // Rate per cylinder
  cylindersReturned: "number", // Number of cylinders returned
  totalCylindersOutstanding: "number", // Running total of cylinders due

  // For weight-based transactions
  vehicleRego: "string", // Vehicle registration number
  gasWeightSold: "number", // Weight of gas sold in kg
  gasWeightRate: "number", // Rate per kg

  // Financial details
  totalAmount: "number", // Total sale amount
  amountReceived: "number", // Amount paid for this transaction
  previousBalance: "number", // Previous balance before this transaction
  remainingBalance: "number", // New balance after this transaction

  paymentType: "string", // 'Cash' or 'Credit'
  paymentStatus: "string", // 'Paid', 'Partial', 'Unpaid'

  // Metadata
  notes: "string", // Additional notes
  createdAt: "timestamp",
  updatedAt: "timestamp",
  createdBy: "string", // User who created the transaction
};

/*
Collection: vehicles
Description: Stores information about regular vehicles that purchase gas
*/
const vehicleSchema = {
  id: "string", // Firestore document ID
  registrationNumber: "string", // Vehicle registration number
  customerId: "string", // Reference to customer document
  customerName: "string", // Denormalized for quick access

  vehicleType: "string", // Type of vehicle
  vehicleModel: "string", // Model of vehicle

  // Financial tracking
  totalAmountDue: "number", // Total outstanding amount
  totalPaid: "number", // Total amount paid to date
  currentBalance: "number", // Current balance

  // Last transaction details
  lastTransactionDate: "timestamp", // Date of last transaction
  lastTransactionId: "string", // Reference to last transaction

  // Metadata
  notes: "string", // Additional notes
  isActive: "boolean", // Whether the vehicle is active
  createdAt: "timestamp",
  updatedAt: "timestamp",
};

/*
Collection: monthlyStatements
Description: Monthly statements for regular vehicles
*/
const monthlyStatementSchema = {
  id: "string", // Firestore document ID
  customerId: "string", // Reference to customer document
  customerName: "string", // Denormalized for quick access
  vehicleId: "string", // Reference to vehicle document
  vehicleRego: "string", // Vehicle registration number

  month: "string", // YYYY-MM
  startDate: "timestamp", // Start date of the statement
  endDate: "timestamp", // End date of the statement

  // Financial summary
  totalGasSold: "number", // Total gas sold in kg
  totalAmount: "number", // Total amount for the month
  amountPaid: "number", // Amount paid against this statement
  remainingBalance: "number", // Remaining balance

  // Statement status
  status: "string", // 'Paid', 'Partial', 'Unpaid'
  dueDate: "timestamp", // Payment due date

  // List of transaction IDs included in this statement
  transactionIds: "array", // Array of transaction IDs

  // Metadata
  notes: "string", // Additional notes
  createdAt: "timestamp",
  updatedAt: "timestamp",
};

// Example of composite indexes that might be needed for querying
const compositeIndexes = [
  {
    collection: "transactions",
    fields: ["customerId", "date"],
    purpose: "Query transactions by customer, sorted by date",
  },
  {
    collection: "transactions",
    fields: ["vehicleRego", "date"],
    purpose: "Query transactions by vehicle, sorted by date",
  },
  {
    collection: "monthlyStatements",
    fields: ["vehicleId", "status", "dueDate"],
    purpose: "Query unpaid statements by vehicle, sorted by due date",
  },
];

// Export the schemas for reference
export {
  customerSchema,
  transactionSchema,
  vehicleSchema,
  monthlyStatementSchema,
  compositeIndexes,
};
