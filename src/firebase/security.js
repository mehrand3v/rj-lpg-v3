// src/firebase/security.js
/*
 * This file contains the Firestore security rules that will be deployed to Firebase.
 * Use the Firebase CLI to deploy these rules to your Firebase project.
 *
 * To deploy: firebase deploy --only firestore:rules
 */

/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can access
    match /{document=**} {
      allow read, write: if false;
    }
    
    // User profiles - users can only read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow write: if request.auth != null && (request.auth.uid == userId || isAdmin());
    }
    
    // Customers - only authenticated users can read, only admin can write
    match /customers/{customerId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
      
      // Prevent deletion if customer has outstanding cylinders or balance
      allow delete: if isAdmin() && 
                     !hasOutstandingBalance(customerId) && 
                     !hasOutstandingCylinders(customerId);
    }
    
    // Vehicles - only authenticated users can read, only admin can write
    match /vehicles/{vehicleId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Sales - only authenticated users can read, only admin can write
    match /sales/{saleId} {
      allow read: if request.auth != null;
      allow create, update: if isAdmin();
      
      // Prevent deletion of sales with payments
      allow delete: if isAdmin() && !hasPayments(saleId);
    }
    
    // Payments - only authenticated users can read, only admin can write
    match /payments/{paymentId} {
      allow read: if request.auth != null;
      allow create, update: if isAdmin();
      
      // Prevent deletion of specific payment records (for data integrity)
      allow delete: if isAdmin() && isMostRecent(paymentId);
    }
    
    // Cylinders - only authenticated users can read, only admin can write
    match /cylinders/{cylinderId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Counters - only admin can read/write
    match /counters/{document} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Helper functions
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function hasOutstandingBalance(customerId) {
      // Logic to check if customer has outstanding balance
      return exists(/databases/$(database)/documents/customers/$(customerId)) &&
             get(/databases/$(database)/documents/customers/$(customerId)).data.outstandingBalance > 0;
    }
    
    function hasOutstandingCylinders(customerId) {
      // Logic to check if customer has outstanding cylinders
      return exists(/databases/$(database)/documents/cylinders/$(customerId)) &&
             get(/databases/$(database)/documents/cylinders/$(customerId)).data.cylindersOutstanding > 0;
    }
    
    function hasPayments(saleId) {
      // Logic to check if a sale has associated payments
      return exists(/databases/$(database)/documents/payments) &&
             existsAfter(/databases/$(database)/documents/payments, where("saleId", "==", saleId));
    }
    
    function isMostRecent(paymentId) {
      // Logic to check if this is the most recent payment (can be deleted)
      let payment = get(/databases/$(database)/documents/payments/$(paymentId));
      let customerId = payment.data.customerId;
      let allPayments = getAfter(/databases/$(database)/documents/payments, 
                        where("customerId", "==", customerId),
                        orderBy("createdAt", "desc"),
                        limit(1));
      return allPayments[0].id == paymentId;
    }
  }
}
*/

// Function to programmatically deploy security rules
// Note: This would typically be done with a Firebase CLI deployment script
export const setupFirebaseSecurityRules = () => {
    console.log("Firebase security rules need to be deployed using the Firebase CLI");
    console.log("Copy the rules from the comment in this file to your Firestore rules file");
    return "See security rules in comment above";
  };