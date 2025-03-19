// src/pages/SalesForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { ChevronLeft, Save, Package, Truck } from "lucide-react";

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

// Import services
import { logCustomEvent } from "@/services/analytics";

const SalesForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useOutletContext();
  const queryParams = new URLSearchParams(location.search);

  // Get type from URL (cylinder or weight)
  const initialSaleType = queryParams.get("type") || "cylinder";
  // Get customer ID from URL if provided
  const customerId = queryParams.get("customerId");

  const [saleType, setSaleType] = useState(initialSaleType);
  const [saving, setSaving] = useState(false);

  // Customer and vehicle selection
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Form data for cylinder sales
  const [cylinderData, setCylinderData] = useState({
    cylindersSold: 1,
    cylinderRate: 25.0,
    cylindersReturned: 0,
    notes: "",
  });

  // Form data for weight sales
  const [weightData, setWeightData] = useState({
    gasWeightSold: 10,
    gasWeightRate: 3.0,
    notes: "",
  });

  // Payment info
  const [paymentInfo, setPaymentInfo] = useState({
    paymentType: "Cash",
    amountReceived: 0,
  });

  // Calculated values
  const [calculated, setCalculated] = useState({
    totalAmount: 0,
    remainingBalance: 0,
    previousBalance: 0,
  });

  useEffect(() => {
    // Log page view
    logCustomEvent("sales_page_view", { saleType });

    // If customerId is provided, fetch and set customer data
    if (customerId) {
      fetchCustomerById(customerId);
    }

    // Calculate initial values
    calculateTotals();
  }, []);

  // Recalculate totals whenever inputs change
  useEffect(() => {
    calculateTotals();
  }, [cylinderData, weightData, paymentInfo, selectedCustomer]);

  const fetchCustomerById = async (id) => {
    try {
      // In a real app, fetch from Firestore
      // For demo purposes:
      const customer = {
        id: id,
        name: "John Smith",
        contactNumber: "123-456-7890",
        currentBalance: 50,
      };
      setSelectedCustomer(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      showNotification("Failed to load customer data", "error");
    }
  };

  const calculateTotals = () => {
    let totalAmount = 0;
    let previousBalance = selectedCustomer?.currentBalance || 0;

    // Calculate based on sale type
    if (saleType === "cylinder") {
      totalAmount = cylinderData.cylindersSold * cylinderData.cylinderRate;
    } else {
      totalAmount = weightData.gasWeightSold * weightData.gasWeightRate;
    }

    // Calculate remaining balance
    const amountReceived = parseFloat(paymentInfo.amountReceived) || 0;
    const remainingBalance = previousBalance + totalAmount - amountReceived;

    setCalculated({
      totalAmount,
      previousBalance,
      remainingBalance,
    });

    // Update payment amount if payment type is Cash and there's no previous input
    if (
      paymentInfo.paymentType === "Cash" &&
      paymentInfo.amountReceived === 0
    ) {
      setPaymentInfo((prev) => ({
        ...prev,
        amountReceived: totalAmount,
      }));
    }
  };

  const handleCylinderInputChange = (e) => {
    const { name, value } = e.target;
    setCylinderData((prev) => ({
      ...prev,
      [name]: name === "notes" ? value : parseFloat(value) || 0,
    }));
  };

  const handleWeightInputChange = (e) => {
    const { name, value } = e.target;
    setWeightData((prev) => ({
      ...prev,
      [name]: name === "notes" ? value : parseFloat(value) || 0,
    }));
  };

  const handlePaymentInfoChange = (e) => {
    const { name, value } = e.target;

    if (name === "paymentType") {
      // If switching to Credit, set amount received to 0
      // If switching to Cash, set amount received to total
      const newAmount = value === "Credit" ? 0 : calculated.totalAmount;

      setPaymentInfo((prev) => ({
        ...prev,
        [name]: value,
        amountReceived: newAmount,
      }));
    } else {
      setPaymentInfo((prev) => ({
        ...prev,
        [name]: name === "amountReceived" ? parseFloat(value) || 0 : value,
      }));
    }
  };

  const validateForm = () => {
    if (!selectedCustomer) {
      showNotification("Please select a customer", "error");
      return false;
    }

    if (saleType === "cylinder") {
      if (cylinderData.cylindersSold <= 0) {
        showNotification(
          "Number of cylinders sold must be greater than 0",
          "error"
        );
        return false;
      }
    } else {
      if (weightData.gasWeightSold <= 0) {
        showNotification("Gas weight sold must be greater than 0", "error");
        return false;
      }

      if (!selectedVehicle) {
        showNotification("Please select a vehicle", "error");
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      // Create transaction object
      const transaction = {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        date: new Date(),
        transactionType: saleType,

        // Common fields
        totalAmount: calculated.totalAmount,
        amountReceived: paymentInfo.amountReceived,
        previousBalance: calculated.previousBalance,
        remainingBalance: calculated.remainingBalance,
        paymentType: paymentInfo.paymentType,
        paymentStatus:
          paymentInfo.amountReceived >= calculated.totalAmount
            ? "Paid"
            : paymentInfo.amountReceived > 0
            ? "Partial"
            : "Unpaid",
        notes: saleType === "cylinder" ? cylinderData.notes : weightData.notes,

        // Type-specific fields
        ...(saleType === "cylinder"
          ? {
              cylindersSold: cylinderData.cylindersSold,
              cylinderRate: cylinderData.cylinderRate,
              cylindersReturned: cylinderData.cylindersReturned,
              totalCylindersOutstanding:
                cylinderData.cylindersSold - cylinderData.cylindersReturned,
            }
          : {
              vehicleRego: selectedVehicle.registrationNumber,
              vehicleId: selectedVehicle.id,
              gasWeightSold: weightData.gasWeightSold,
              gasWeightRate: weightData.gasWeightRate,
            }),
      };

      // In a real app, you would:
      // 1. Add the transaction document
      // const transactionId = await addDocument('transactions', transaction);

      // 2. Update the customer's running totals
      // await updateDocument('customers', selectedCustomer.id, {
      //   totalAmountDue: firebase.firestore.FieldValue.increment(calculated.totalAmount),
      //   totalPaid: firebase.firestore.FieldValue.increment(paymentInfo.amountReceived),
      //   currentBalance: firebase.firestore.FieldValue.increment(calculated.totalAmount - paymentInfo.amountReceived),
      //   ...(saleType === 'cylinder' ? {
      //     totalCylindersBought: firebase.firestore.FieldValue.increment(cylinderData.cylindersSold),
      //     totalCylindersReturned: firebase.firestore.FieldValue.increment(cylinderData.cylindersReturned),
      //     currentCylindersHeld: firebase.firestore.FieldValue.increment(cylinderData.cylindersSold - cylinderData.cylindersReturned)
      //   } : {}),
      //   lastTransactionDate: new Date(),
      //   updatedAt: serverTimestamp()
      // });

      // Log event
      logCustomEvent(`${saleType}_sale_created`, {
        customerId: selectedCustomer.id,
        amount: calculated.totalAmount,
      });

      showNotification("Sale recorded successfully", "success");
      navigate("/transactions");
    } catch (error) {
      console.error("Error saving transaction:", error);
      showNotification("Failed to save transaction", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/transactions")}
            className="mr-2 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              New {saleType === "cylinder" ? "Cylinder" : "Weight"} Sale
            </h1>
            <p className="text-gray-400">Record a new gas sale transaction</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white flex-1 sm:flex-none"
            onClick={() => navigate("/transactions")}
          >
            Cancel
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1 sm:flex-none"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Transaction"}
          </Button>
        </div>
      </div>

      {/* Sale Type Tabs */}
      <Tabs value={saleType} onValueChange={setSaleType} className="w-full">
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger
            value="cylinder"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400 hover:text-gray-300"
          >
            <Package className="h-4 w-4 mr-2" />
            Cylinder Sale
          </TabsTrigger>
          <TabsTrigger
            value="weight"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400 hover:text-gray-300"
          >
            <Truck className="h-4 w-4 mr-2" />
            Weight Sale
          </TabsTrigger>
        </TabsList>

        {/* Cylinder Sale Form */}
        <TabsContent value="cylinder" className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gray-800 border-gray-700 shadow-md">
                <CardHeader>
                  <CardTitle className="text-white">
                    Cylinder Sale Details
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Enter the cylinder sale information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Customer <span className="text-red-500">*</span>
                    </label>
                    <CustomerSearch
                      onSelectCustomer={setSelectedCustomer}
                      selectedCustomer={selectedCustomer}
                    />
                  </div>

                  {/* Cylinder Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="cylindersSold"
                        className="text-sm font-medium text-gray-300"
                      >
                        Cylinders Sold <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="cylindersSold"
                        name="cylindersSold"
                        type="number"
                        min="1"
                        value={cylinderData.cylindersSold}
                        onChange={handleCylinderInputChange}
                        className="bg-gray-750 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="cylinderRate"
                        className="text-sm font-medium text-gray-300"
                      >
                        Rate per Cylinder{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <Input
                          id="cylinderRate"
                          name="cylinderRate"
                          type="number"
                          min="0"
                          step="0.01"
                          value={cylinderData.cylinderRate}
                          onChange={handleCylinderInputChange}
                          className="pl-8 bg-gray-750 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="cylindersReturned"
                        className="text-sm font-medium text-gray-300"
                      >
                        Cylinders Returned
                      </label>
                      <Input
                        id="cylindersReturned"
                        name="cylindersReturned"
                        type="number"
                        min="0"
                        value={cylinderData.cylindersReturned}
                        onChange={handleCylinderInputChange}
                        className="bg-gray-750 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Notes */}
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
                      placeholder="Additional notes about this sale"
                      value={cylinderData.notes}
                      onChange={handleCylinderInputChange}
                      className="bg-gray-750 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-indigo-500"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card className="bg-gray-800 border-gray-700 shadow-md">
                <CardHeader>
                  <CardTitle className="text-white">
                    Payment Information
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Enter payment details for this transaction
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="paymentType"
                        className="text-sm font-medium text-gray-300"
                      >
                        Payment Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="paymentType"
                        name="paymentType"
                        value={paymentInfo.paymentType}
                        onChange={handlePaymentInfoChange}
                        className="w-full rounded-md bg-gray-750 border-gray-700 text-gray-200 focus:border-indigo-500"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Credit">Credit</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="amountReceived"
                        className="text-sm font-medium text-gray-300"
                      >
                        Amount Received
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <Input
                          id="amountReceived"
                          name="amountReceived"
                          type="number"
                          min="0"
                          step="0.01"
                          value={paymentInfo.amountReceived}
                          onChange={handlePaymentInfoChange}
                          className="pl-8 bg-gray-750 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary and Totals */}
            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700 shadow-md">
                <CardHeader>
                  <CardTitle className="text-white">
                    Transaction Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          {cylinderData.cylindersSold} Cylinder(s) × $
                          {cylinderData.cylinderRate}
                        </span>
                        <span className="text-gray-300">
                          ${calculated.totalAmount.toFixed(2)}
                        </span>
                      </div>

                      {selectedCustomer && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            Previous Balance
                          </span>
                          <span className="text-gray-300">
                            ${calculated.previousBalance.toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Amount Received</span>
                        <span className="text-gray-300">
                          -${paymentInfo.amountReceived.toFixed(2)}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-gray-700 flex justify-between">
                        <span className="font-medium text-gray-300">
                          New Balance
                        </span>
                        <span
                          className={`font-bold ${
                            calculated.remainingBalance > 0
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          ${calculated.remainingBalance.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Cylinders Sold</span>
                        <span className="text-gray-300">
                          {cylinderData.cylindersSold}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          Cylinders Returned
                        </span>
                        <span className="text-gray-300">
                          {cylinderData.cylindersReturned}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="font-medium text-gray-300">
                          Net Change
                        </span>
                        <span className="font-bold text-indigo-400">
                          {cylinderData.cylindersSold -
                            cylinderData.cylindersReturned}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-750 border-t border-gray-700 flex justify-between">
                  <span className="text-sm font-medium text-gray-300">
                    Status
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      paymentInfo.amountReceived >=
                      calculated.totalAmount + calculated.previousBalance
                        ? "bg-green-900/30 text-green-400"
                        : paymentInfo.amountReceived > 0
                        ? "bg-yellow-900/30 text-yellow-400"
                        : "bg-red-900/30 text-red-400"
                    }`}
                  >
                    {paymentInfo.amountReceived >=
                    calculated.totalAmount + calculated.previousBalance
                      ? "Paid"
                      : paymentInfo.amountReceived > 0
                      ? "Partial"
                      : "Unpaid"}
                  </span>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Weight Sale Form */}
        <TabsContent value="weight" className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gray-800 border-gray-700 shadow-md">
                <CardHeader>
                  <CardTitle className="text-white">
                    Weight Sale Details
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Enter the weight-based sale information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Customer <span className="text-red-500">*</span>
                    </label>
                    <CustomerSearch
                      onSelectCustomer={setSelectedCustomer}
                      selectedCustomer={selectedCustomer}
                    />
                  </div>

                  {/* Vehicle Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Vehicle <span className="text-red-500">*</span>
                    </label>
                    <VehicleSearch
                      onSelectVehicle={setSelectedVehicle}
                      selectedVehicle={selectedVehicle}
                    />
                  </div>

                  {/* Weight Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="gasWeightSold"
                        className="text-sm font-medium text-gray-300"
                      >
                        Gas Weight (kg) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="gasWeightSold"
                        name="gasWeightSold"
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={weightData.gasWeightSold}
                        onChange={handleWeightInputChange}
                        className="bg-gray-750 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="gasWeightRate"
                        className="text-sm font-medium text-gray-300"
                      >
                        Rate per kg <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <Input
                          id="gasWeightRate"
                          name="gasWeightRate"
                          type="number"
                          min="0"
                          step="0.01"
                          value={weightData.gasWeightRate}
                          onChange={handleWeightInputChange}
                          className="pl-8 bg-gray-750 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
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
                      placeholder="Additional notes about this sale"
                      value={weightData.notes}
                      onChange={handleWeightInputChange}
                      className="bg-gray-750 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-indigo-500"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card className="bg-gray-800 border-gray-700 shadow-md">
                <CardHeader>
                  <CardTitle className="text-white">
                    Payment Information
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Enter payment details for this transaction
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="paymentType"
                        className="text-sm font-medium text-gray-300"
                      >
                        Payment Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="paymentType"
                        name="paymentType"
                        value={paymentInfo.paymentType}
                        onChange={handlePaymentInfoChange}
                        className="w-full rounded-md bg-gray-750 border-gray-700 text-gray-200 focus:border-indigo-500"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Credit">Credit</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="amountReceived"
                        className="text-sm font-medium text-gray-300"
                      >
                        Amount Received
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <Input
                          id="amountReceived"
                          name="amountReceived"
                          type="number"
                          min="0"
                          step="0.01"
                          value={paymentInfo.amountReceived}
                          onChange={handlePaymentInfoChange}
                          className="pl-8 bg-gray-750 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary and Totals */}
            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700 shadow-md">
                <CardHeader>
                  <CardTitle className="text-white">
                    Transaction Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          {weightData.gasWeightSold} kg × $
                          {weightData.gasWeightRate}
                        </span>
                        <span className="text-gray-300">
                          ${calculated.totalAmount.toFixed(2)}
                        </span>
                      </div>

                      {selectedCustomer && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            Previous Balance
                          </span>
                          <span className="text-gray-300">
                            ${calculated.previousBalance.toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Amount Received</span>
                        <span className="text-gray-300">
                          -${paymentInfo.amountReceived.toFixed(2)}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-gray-700 flex justify-between">
                        <span className="font-medium text-gray-300">
                          New Balance
                        </span>
                        <span
                          className={`font-bold ${
                            calculated.remainingBalance > 0
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          ${calculated.remainingBalance.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {selectedVehicle && (
                      <div className="pt-2 border-t border-gray-700">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Vehicle</span>
                          <span className="text-gray-300">
                            {selectedVehicle.registrationNumber}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Gas Weight</span>
                          <span className="text-gray-300">
                            {weightData.gasWeightSold} kg
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-750 border-t border-gray-700 flex justify-between">
                  <span className="text-sm font-medium text-gray-300">
                    Status
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      paymentInfo.amountReceived >=
                      calculated.totalAmount + calculated.previousBalance
                        ? "bg-green-900/30 text-green-400"
                        : paymentInfo.amountReceived > 0
                        ? "bg-yellow-900/30 text-yellow-400"
                        : "bg-red-900/30 text-red-400"
                    }`}
                  >
                    {paymentInfo.amountReceived >=
                    calculated.totalAmount + calculated.previousBalance
                      ? "Paid"
                      : paymentInfo.amountReceived > 0
                      ? "Partial"
                      : "Unpaid"}
                  </span>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesForm;

// Customer Search Component
const CustomerSearch = ({ onSelectCustomer, selectedCustomer }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = customers.filter((customer) =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered.slice(0, 5));
    } else {
      setResults([]);
    }
  }, [searchQuery, customers]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch actual customers
      const sampleCustomers = [
        { id: "c1", name: "John Smith", contactNumber: "123-456-7890" },
        { id: "c2", name: "Sarah Johnson", contactNumber: "987-654-3210" },
        { id: "c3", name: "XYZ Company", contactNumber: "555-123-4567" },
      ];
      setCustomers(sampleCustomers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setLoading(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    onSelectCustomer(customer);
    setSearchQuery("");
    setResults([]);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-gray-750 border-gray-700 text-gray-300 placeholder:text-gray-500 focus:border-indigo-500"
          disabled={selectedCustomer !== null}
        />
        {results.length > 0 && !selectedCustomer && (
          <div className="absolute z-10 mt-1 w-full rounded-md bg-gray-800 border border-gray-700 shadow-lg">
            <ul className="max-h-60 overflow-auto rounded-md py-1 text-base">
              {results.map((customer) => (
                <li
                  key={customer.id}
                  className="cursor-pointer px-3 py-2 hover:bg-gray-700 text-gray-300"
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{customer.name}</span>
                    <span className="text-sm text-gray-400">
                      {customer.contactNumber}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <div className="p-3 rounded-md bg-gray-750 border border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-300">
                {selectedCustomer.name}
              </h3>
              <p className="text-sm text-gray-400">
                {selectedCustomer.contactNumber}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectCustomer(null)}
              className="h-8 hover:bg-gray-700 text-gray-400 hover:text-gray-200"
            >
              Change
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Vehicle Search Component
const VehicleSearch = ({ onSelectVehicle, selectedVehicle }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = vehicles.filter((vehicle) =>
        vehicle.registrationNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setResults(filtered.slice(0, 5));
    } else {
      setResults([]);
    }
  }, [searchQuery, vehicles]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch actual vehicles
      const sampleVehicles = [
        {
          id: "v1",
          registrationNumber: "ABC123",
          customerName: "Sarah Johnson",
        },
        { id: "v2", registrationNumber: "XYZ789", customerName: "XYZ Company" },
        { id: "v3", registrationNumber: "DEF456", customerName: "John Smith" },
      ];
      setVehicles(sampleVehicles);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setLoading(false);
    }
  };

  const handleSelectVehicle = (vehicle) => {
    onSelectVehicle(vehicle);
    setSearchQuery("");
    setResults([]);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder="Search vehicle registration..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-gray-750 border-gray-700 text-gray-300 placeholder:text-gray-500 focus:border-indigo-500"
          disabled={selectedVehicle !== null}
        />
        {results.length > 0 && !selectedVehicle && (
          <div className="absolute z-10 mt-1 w-full rounded-md bg-gray-800 border border-gray-700 shadow-lg">
            <ul className="max-h-60 overflow-auto rounded-md py-1 text-base">
              {results.map((vehicle) => (
                <li
                  key={vehicle.id}
                  className="cursor-pointer px-3 py-2 hover:bg-gray-700 text-gray-300"
                  onClick={() => handleSelectVehicle(vehicle)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {vehicle.registrationNumber}
                    </span>
                    <span className="text-sm text-gray-400">
                      {vehicle.customerName}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {selectedVehicle && (
        <div className="p-3 rounded-md bg-gray-750 border border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-300">
                {selectedVehicle.registrationNumber}
              </h3>
              <p className="text-sm text-gray-400">
                {selectedVehicle.customerName}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectVehicle(null)}
              className="h-8 hover:bg-gray-700 text-gray-400 hover:text-gray-200"
            >
              Change
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
