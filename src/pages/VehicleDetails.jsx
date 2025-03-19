// src/pages/VehicleDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Save,
  Trash,
  CreditCard,
  Truck,
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

// Import services
import {
  getDocumentById,
  updateDocument,
  addDocument,
  deleteDocument,
} from "@/services/db";
import { logCustomEvent } from "@/services/analytics";

const CustomerSelector = ({
  onSelectCustomer,
  selectedCustomerId,
  selectedCustomerName,
}) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // In a real app, fetch from Firestore
      // For this demo, we'll create sample data
      const sampleCustomers = [
        { id: "c1", name: "John Smith" },
        { id: "c2", name: "Sarah Johnson" },
        { id: "c3", name: "XYZ Company" },
      ];
      setCustomers(sampleCustomers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="customerId" className="text-sm font-medium text-gray-300">
        Customer <span className="text-red-500">*</span>
      </label>
      <select
        id="customerId"
        name="customerId"
        value={selectedCustomerId || ""}
        onChange={(e) => onSelectCustomer(e.target.value)}
        className="w-full rounded-md bg-gray-750 border-gray-700 text-gray-200 focus:border-indigo-500"
        disabled={loading}
      >
        <option value="">Select a customer</option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.name}
          </option>
        ))}
      </select>
    </div>
  );
};

const VehicleTransactionHistory = ({ transactions }) => {
  return (
    <div className="rounded-md border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-850">
          <TableRow className="hover:bg-gray-800 border-gray-800">
            <TableHead className="text-gray-400 font-medium">Date</TableHead>
            <TableHead className="text-gray-400 font-medium">Type</TableHead>
            <TableHead className="text-gray-400 font-medium text-right">
              Gas Weight
            </TableHead>
            <TableHead className="text-gray-400 font-medium text-right">
              Amount
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
                      transaction.transactionType === "weight"
                        ? "bg-blue-900/30 text-blue-400"
                        : "bg-green-900/30 text-green-400"
                    }`}
                  >
                    {transaction.transactionType === "weight"
                      ? "Gas Purchase"
                      : "Payment"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {transaction.transactionType === "weight" ? (
                    <span className="font-medium text-gray-300">
                      {transaction.gasWeightSold} kg
                    </span>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-medium text-gray-300">
                    ${transaction.totalAmount?.toFixed(2) || "0.00"}
                  </span>
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

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useOutletContext();
  const isNewVehicle = id === "new";

  const [vehicle, setVehicle] = useState({
    registrationNumber: "",
    customerId: "",
    customerName: "",
    vehicleType: "Truck",
    vehicleModel: "",
    notes: "",
    isActive: true,
    totalAmountDue: 0,
    totalPaid: 0,
    currentBalance: 0,
  });

  const [loading, setLoading] = useState(!isNewVehicle);
  const [saving, setSaving] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!isNewVehicle) {
      fetchVehicleData();
    }
  }, [id]);

  const fetchVehicleData = async () => {
    try {
      // In a real application, you would fetch from Firestore
      // For this demo, we'll use sample data
      const sampleVehicle = {
        id: id,
        registrationNumber: "ABC123",
        customerId: "c2",
        customerName: "Sarah Johnson",
        vehicleType: "Truck",
        vehicleModel: "Small",
        totalAmountDue: 150,
        totalPaid: 100,
        currentBalance: 50,
        isActive: true,
        notes: "Regular customer vehicle",
        lastTransactionDate: { toDate: () => new Date(2023, 2, 20) },
        createdAt: { toDate: () => new Date(2023, 1, 10) },
      };

      setVehicle(sampleVehicle);

      // Sample transactions
      const sampleTransactions = [
        {
          id: "1",
          date: { toDate: () => new Date(2023, 2, 15) },
          transactionType: "weight",
          gasWeightSold: 15,
          totalAmount: 45,
          remainingBalance: 45,
        },
        {
          id: "2",
          date: { toDate: () => new Date(2023, 2, 20) },
          transactionType: "weight",
          gasWeightSold: 35,
          totalAmount: 105,
          remainingBalance: 150,
        },
        {
          id: "3",
          date: { toDate: () => new Date(2023, 2, 20) },
          transactionType: "payment",
          totalAmount: 100,
          remainingBalance: 50,
        },
      ];

      setTransactions(sampleTransactions);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      showNotification("Failed to load vehicle details", "error");
      setLoading(false);
      navigate("/vehicles");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVehicle((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCustomerSelect = (customerId) => {
    // In a real app, you would lookup the customer name
    const customerNames = {
      c1: "John Smith",
      c2: "Sarah Johnson",
      c3: "XYZ Company",
    };

    setVehicle((prev) => ({
      ...prev,
      customerId,
      customerName: customerNames[customerId] || "",
    }));
  };

  const validateForm = () => {
    if (!vehicle.registrationNumber.trim()) {
      showNotification("Vehicle registration number is required", "error");
      return false;
    }

    if (!vehicle.customerId) {
      showNotification("Please select a customer", "error");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (isNewVehicle) {
        const vehicleId = await addDocument("vehicles", vehicle);
        logCustomEvent("vehicle_created", { vehicleId });
        showNotification("Vehicle created successfully", "success");
        navigate(`/vehicles/${vehicleId}`);
      } else {
        await updateDocument("vehicles", id, vehicle);
        logCustomEvent("vehicle_updated", { vehicleId: id });
        showNotification("Vehicle updated successfully", "success");
      }
    } catch (error) {
      console.error("Error saving vehicle:", error);
      showNotification("Failed to save vehicle", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${vehicle.registrationNumber}?`
      )
    ) {
      try {
        await deleteDocument("vehicles", id);
        showNotification(
          `Vehicle "${vehicle.registrationNumber}" deleted successfully`,
          "success"
        );
        navigate("/vehicles");
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        showNotification("Failed to delete vehicle", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400">Loading vehicle details...</div>
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
            onClick={() => navigate("/vehicles")}
            className="mr-2 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isNewVehicle ? "New Vehicle" : vehicle.registrationNumber}
            </h1>
            {!isNewVehicle && vehicle.customerName && (
              <p className="text-gray-400">Customer: {vehicle.customerName}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white flex-1 sm:flex-none"
            onClick={() => navigate("/vehicles")}
          >
            Cancel
          </Button>
          {!isNewVehicle && (
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
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save"}
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
            <Truck className="h-4 w-4 mr-2" />
            Vehicle Details
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400 hover:text-gray-300"
            disabled={isNewVehicle}
          >
            <History className="h-4 w-4 mr-2" />
            Transaction History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Vehicle Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gray-800 border-gray-700 shadow-md">
                <CardHeader>
                  <CardTitle className="text-white">
                    Vehicle Information
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Basic information about the vehicle
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="registrationNumber"
                        className="text-sm font-medium text-gray-300"
                      >
                        Registration Number{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="registrationNumber"
                        name="registrationNumber"
                        placeholder="Vehicle registration"
                        value={vehicle.registrationNumber}
                        onChange={handleInputChange}
                        className="bg-gray-750 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-indigo-500"
                      />
                    </div>
                    <CustomerSelector
                      onSelectCustomer={handleCustomerSelect}
                      selectedCustomerId={vehicle.customerId}
                      selectedCustomerName={vehicle.customerName}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="vehicleType"
                        className="text-sm font-medium text-gray-300"
                      >
                        Vehicle Type
                      </label>
                      <select
                        id="vehicleType"
                        name="vehicleType"
                        value={vehicle.vehicleType}
                        onChange={handleInputChange}
                        className="w-full rounded-md bg-gray-750 border-gray-700 text-gray-200 focus:border-indigo-500"
                      >
                        <option value="Truck">Truck</option>
                        <option value="Van">Van</option>
                        <option value="Car">Car</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="vehicleModel"
                        className="text-sm font-medium text-gray-300"
                      >
                        Vehicle Model
                      </label>
                      <Input
                        id="vehicleModel"
                        name="vehicleModel"
                        placeholder="Model or description"
                        value={vehicle.vehicleModel}
                        onChange={handleInputChange}
                        className="bg-gray-750 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-indigo-500"
                      />
                    </div>
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
                      value={vehicle.notes}
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
                      checked={vehicle.isActive}
                      onChange={handleInputChange}
                      className="rounded bg-gray-750 border-gray-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium text-gray-300"
                    >
                      Active Vehicle
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Vehicle Stats */}
            <div className="space-y-6">
              {!isNewVehicle && (
                <Card className="bg-gray-800 border-gray-700 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Account Summary
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Financial summary
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Financial Information */}
                    <div>
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
                            ${vehicle.totalAmountDue?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">
                            Total Paid:
                          </span>
                          <span className="text-sm font-medium text-gray-200">
                            ${vehicle.totalPaid?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-700 pt-2">
                          <span className="text-sm font-medium text-gray-300">
                            Current Balance:
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              (vehicle.currentBalance || 0) > 0
                                ? "text-red-400"
                                : "text-green-400"
                            }`}
                          >
                            ${vehicle.currentBalance?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-700 bg-gray-750">
                    <div className="w-full flex flex-col sm:flex-row gap-2">
                      <Button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1"
                        onClick={() =>
                          navigate(`/sales/new?type=weight&vehicleId=${id}`)
                        }
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        New Gas Sale
                      </Button>
                      <Button
                        variant="outline"
                        className="border-indigo-600 text-indigo-400 hover:bg-indigo-900 hover:text-white flex-1"
                        onClick={() =>
                          navigate(
                            `/transactions/new?type=payment&vehicleId=${id}`
                          )
                        }
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Record Payment
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )}

              {!isNewVehicle && (
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
                          {vehicle.lastTransactionDate
                            ? format(
                                vehicle.lastTransactionDate.toDate(),
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
                          {vehicle.createdAt
                            ? format(vehicle.createdAt.toDate(), "MMM dd, yyyy")
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
                    navigate(`/transactions/new?type=payment&vehicleId=${id}`)
                  }
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() =>
                    navigate(`/sales/new?type=weight&vehicleId=${id}`)
                  }
                >
                  <Truck className="h-4 w-4 mr-2" />
                  New Gas Sale
                </Button>
              </div>
            </div>

            {/* Transaction history table */}
            <VehicleTransactionHistory transactions={transactions} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VehicleDetails;
