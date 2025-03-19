// src/pages/CustomerDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Save,
  Trash,
  CreditCard,
  Package,
  History,
  User,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

// Import components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LoadingSpinner from "@/components/LoadingSpinner";

// Import services
import {
  getDocumentById,
  updateDocument,
  addDocument,
  deleteDocument,
} from "@/services/db";
import { logCustomEvent } from "@/services/analytics";

const CustomerTransactionHistory = ({ transactions }) => {
  return (
    <div className="rounded-md border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-850">
          <TableRow className="hover:bg-gray-800 border-gray-800">
            <TableHead className="text-gray-400 font-medium">Date</TableHead>
            <TableHead className="text-gray-400 font-medium">Type</TableHead>
            <TableHead className="text-gray-400 font-medium text-right">
              Amount
            </TableHead>
            <TableHead className="text-gray-400 font-medium text-right">
              Cylinders
            </TableHead>
            <TableHead className="text-gray-400 font-medium text-right">
              Balance
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow className="hover:bg-gray-750 border-gray-800">
              <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                No transaction history found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                className="hover:bg-gray-750 border-gray-800"
              >
                <TableCell className="font-medium text-gray-300">
                  {transaction.date
                    ? format(transaction.date.toDate(), "MMM dd, yyyy")
                    : "—"}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      transaction.transactionType === "cylinder"
                        ? "bg-indigo-900/30 text-indigo-400"
                        : transaction.transactionType === "weight"
                        ? "bg-blue-900/30 text-blue-400"
                        : "bg-green-900/30 text-green-400"
                    }`}
                  >
                    {transaction.transactionType === "cylinder"
                      ? "Cylinder"
                      : transaction.transactionType === "weight"
                      ? "Weight"
                      : "Payment"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-medium text-gray-300">
                    ${transaction.totalAmount?.toFixed(2) || "0.00"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {transaction.transactionType === "cylinder" ? (
                    <div className="flex flex-col">
                      <span className="text-sm text-green-400">
                        +{transaction.cylindersSold || 0}
                      </span>
                      {transaction.cylindersReturned > 0 && (
                        <span className="text-xs text-red-400">
                          -{transaction.cylindersReturned}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-medium text-gray-300">
                    ${transaction.remainingBalance?.toFixed(2) || "0.00"}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useOutletContext();
  const isNewCustomer = id === "new";

  const [customer, setCustomer] = useState({
    name: "",
    contactNumber: "",
    email: "",
    address: "",
    notes: "",
    isActive: true,
    customerType: "Regular",
    totalAmountDue: 0,
    totalPaid: 0,
    currentBalance: 0,
    totalCylindersBought: 0,
    totalCylindersReturned: 0,
    currentCylindersHeld: 0,
  });

  const [loading, setLoading] = useState(!isNewCustomer);
  const [saving, setSaving] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!isNewCustomer) {
      fetchCustomerData();
    }
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      const customerData = await getDocumentById("customers", id);
      if (customerData) {
        setCustomer(customerData);

        // In a real application, you would fetch the customer's transactions here
        // For this demo, we'll create some sample transactions
        const sampleTransactions = [
          {
            id: "1",
            date: { toDate: () => new Date(2023, 2, 15) },
            transactionType: "cylinder",
            cylindersSold: 2,
            cylindersReturned: 0,
            totalAmount: 50,
            remainingBalance: 50,
          },
          {
            id: "2",
            date: { toDate: () => new Date(2023, 2, 20) },
            transactionType: "weight",
            gasWeightSold: 10,
            totalAmount: 30,
            remainingBalance: 80,
          },
          {
            id: "3",
            date: { toDate: () => new Date(2023, 3, 1) },
            transactionType: "cylinder",
            cylindersSold: 1,
            cylindersReturned: 1,
            totalAmount: 25,
            remainingBalance: 105,
          },
          {
            id: "4",
            date: { toDate: () => new Date(2023, 3, 5) },
            transactionType: "payment",
            totalAmount: 50,
            remainingBalance: 55,
          },
        ];

        setTransactions(sampleTransactions);
      } else {
        showNotification("Customer not found", "error");
        navigate("/customers");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customer:", error);
      showNotification("Failed to load customer details", "error");
      setLoading(false);
      navigate("/customers");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCustomer((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!customer.name.trim()) {
      showNotification("Customer name is required", "error");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (isNewCustomer) {
        const customerId = await addDocument("customers", customer);
        logCustomEvent("customer_created", { customerId });
        showNotification("Customer created successfully", "success");
        navigate(`/customers/${customerId}`);
      } else {
        await updateDocument("customers", id, customer);
        logCustomEvent("customer_updated", { customerId: id });
        showNotification("Customer updated successfully", "success");
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      showNotification("Failed to save customer", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      try {
        await deleteDocument("customers", id);
        showNotification(
          `Customer "${customer.name}" deleted successfully`,
          "success"
        );
        navigate("/customers");
      } catch (error) {
        console.error("Error deleting customer:", error);
        showNotification("Failed to delete customer", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading customer details..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/customers")}
            className="mr-2 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isNewCustomer ? "New Customer" : customer.name}
            </h1>
            {!isNewCustomer && (
              <p className="text-gray-400">Customer ID: {id}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white flex-1 sm:flex-none"
            onClick={() => navigate("/customers")}
          >
            Cancel
          </Button>
          {!isNewCustomer && (
            <Button
              variant="destructive"
              className="bg-red-900 hover:bg-red-800 text-white flex-1 sm:flex-none"
              onClick={handleDelete}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1 sm:flex-none"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger
            value="details"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400 hover:text-gray-300"
          >
            <User className="h-4 w-4 mr-2" />
            Customer Details
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400 hover:text-gray-300"
            disabled={isNewCustomer}
          >
            <History className="h-4 w-4 mr-2" />
            Transaction History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gray-800 border-gray-700 shadow-md">
                <CardHeader>
                  <CardTitle className="text-white">
                    Customer Information
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Basic information about the customer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium text-gray-300"
                      >
                        Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Customer name"
                        value={customer.name}
                        onChange={handleInputChange}
                        className="bg-gray-750 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="contactNumber"
                        className="text-sm font-medium text-gray-300"
                      >
                        Contact Number
                      </label>
                      <Input
                        id="contactNumber"
                        name="contactNumber"
                        placeholder="Phone number"
                        value={customer.contactNumber}
                        onChange={handleInputChange}
                        className="bg-gray-750 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-300"
                      >
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email address"
                        value={customer.email}
                        onChange={handleInputChange}
                        className="bg-gray-750 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="customerType"
                        className="text-sm font-medium text-gray-300"
                      >
                        Customer Type
                      </label>
                      <select
                        id="customerType"
                        name="customerType"
                        value={customer.customerType}
                        onChange={handleInputChange}
                        className="w-full rounded-md bg-gray-750 border-gray-700 text-gray-200 focus:border-indigo-500"
                      >
                        <option value="Regular">Regular</option>
                        <option value="Business">Business</option>
                        <option value="VIP">VIP</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="address"
                      className="text-sm font-medium text-gray-300"
                    >
                      Address
                    </label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="Customer address"
                      value={customer.address}
                      onChange={handleInputChange}
                      className="bg-gray-750 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="notes"
                      className="text-sm font-medium text-gray-300"
                    >
                      Notes
                    </label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Additional notes"
                      value={customer.notes}
                      onChange={handleInputChange}
                      className="bg-gray-750 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-indigo-500"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={customer.isActive}
                      onChange={handleInputChange}
                      className="rounded bg-gray-750 border-gray-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium text-gray-300"
                    >
                      Active Customer
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Stats */}
            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700 shadow-md">
                <CardHeader>
                  <CardTitle className="text-white">Account Summary</CardTitle>
                  <CardDescription className="text-gray-400">
                    Financial and cylinder summary
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Financial Information */}
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <CreditCard className="h-5 w-5 mr-2 text-indigo-400" />
                      <h3 className="text-md font-medium text-gray-300">
                        Financial
                      </h3>
                    </div>
                    <div className="space-y-3 pl-7">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">
                          Total Amount Due:
                        </span>
                        <span className="text-sm font-medium text-gray-200">
                          ${customer.totalAmountDue?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">
                          Total Paid:
                        </span>
                        <span className="text-sm font-medium text-gray-200">
                          ${customer.totalPaid?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-gray-700 pt-2">
                        <span className="text-sm font-medium text-gray-300">
                          Current Balance:
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            (customer.currentBalance || 0) > 0
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          ${customer.currentBalance?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cylinder Information */}
                  <div>
                    <div className="flex items-center mb-2">
                      <Package className="h-5 w-5 mr-2 text-indigo-400" />
                      <h3 className="text-md font-medium text-gray-300">
                        Cylinders
                      </h3>
                    </div>
                    <div className="space-y-3 pl-7">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">
                          Total Bought:
                        </span>
                        <span className="text-sm font-medium text-gray-200">
                          {customer.totalCylindersBought || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">
                          Total Returned:
                        </span>
                        <span className="text-sm font-medium text-gray-200">
                          {customer.totalCylindersReturned || 0}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-gray-700 pt-2">
                        <span className="text-sm font-medium text-gray-300">
                          Currently Held:
                        </span>
                        <span className="text-sm font-bold text-indigo-400">
                          {customer.currentCylindersHeld || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                {!isNewCustomer && (
                  <CardFooter className="border-t border-gray-700 bg-gray-750">
                    <div className="w-full flex flex-col sm:flex-row gap-2">
                      <Button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1"
                        onClick={() => navigate(`/sales/new?customerId=${id}`)}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        New Sale
                      </Button>
                      <Button
                        variant="outline"
                        className="border-indigo-600 text-indigo-400 hover:bg-indigo-900 hover:text-white flex-1"
                        onClick={() =>
                          navigate(
                            `/transactions/new?customerId=${id}&type=payment`
                          )
                        }
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Record Payment
                      </Button>
                    </div>
                  </CardFooter>
                )}
              </Card>

              {!isNewCustomer && (
                <Card className="bg-gray-800 border-gray-700 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white">Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Last Transaction */}
                      <div>
                        <div className="flex items-center mb-1">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-400">
                            Last Transaction
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 pl-6">
                          {customer.lastTransactionDate
                            ? format(
                                customer.lastTransactionDate.toDate(),
                                "MMM dd, yyyy"
                              )
                            : "No transactions yet"}
                        </p>
                      </div>

                      {/* Created Date */}
                      <div>
                        <div className="flex items-center mb-1">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-400">
                            Created On
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 pl-6">
                          {customer.createdAt
                            ? format(
                                customer.createdAt.toDate(),
                                "MMM dd, yyyy"
                              )
                            : "Unknown"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="pt-4">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">
                Transaction History
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-indigo-600 text-indigo-400 hover:bg-indigo-900 hover:text-white"
                  onClick={() =>
                    navigate(`/transactions/new?customerId=${id}&type=payment`)
                  }
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => navigate(`/sales/new?customerId=${id}`)}
                >
                  <Package className="h-4 w-4 mr-2" />
                  New Sale
                </Button>
              </div>
            </div>

            {/* Transaction history table */}
            <CustomerTransactionHistory transactions={transactions} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Full-page loading overlay when saving */}
      {saving && <LoadingSpinner fullPage={true} text="Saving changes..." />}
    </div>
  );
};

export default CustomerDetails;
