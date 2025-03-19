// PaymentPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addDocument, getDocuments } from "@/services/db";
import { logCustomEvent } from "@/services/analytics";
import { getCurrentUser } from "@/services/auth";
// Replace react-hot-toast with our custom toast
import { useToast } from "@/components/ui/toast";
import { format } from "date-fns";
import {
  ArrowLeft,
  X,
  User,
  Calendar,
  DollarSign,
  Package,
} from "lucide-react";

// Component Imports
import CustomerSelector from "@components/CustomerSelector";
import DateSelector from "@components/DateSelector";

// shadcn Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PaymentPage = () => {
  // Initialize the toast hook
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: new Date(),
    customerId: "",
    customerName: "",
    previousBalance: 0,
    paymentAmount: "",
    paymentType: "cash",
    cylindersReturned: "",
    notes: "",
  });

  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customerCylinders, setCustomerCylinders] = useState(0);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loading, setLoading] = useState({
    savePayment: false,
    fetchingData: true,
  });
  const [errors, setErrors] = useState({});
  const [validationTriggered, setValidationTriggered] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [paginatedHistory, setPaginatedHistory] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading((prev) => ({ ...prev, fetchingData: true }));
      try {
        const [customersData, transactionsData] = await Promise.all([
          getDocuments("customers"),
          getDocuments("transactions"),
        ]);

        setCustomers(customersData);
        setTransactions(transactionsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        // Updated toast.error to error
        error("Failed to load necessary data");
      } finally {
        setLoading((prev) => ({ ...prev, fetchingData: false }));
      }
    };

    fetchData();
  }, []);

  // Update paginated history when customerHistory or pagination changes
  useEffect(() => {
    if (customerHistory.length > 0) {
      // Sort transactions by date, newest first
      const sortedHistory = [...customerHistory].sort(
        (a, b) =>
          new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)
      );

      // Calculate total pages
      const pages = Math.ceil(sortedHistory.length / itemsPerPage);
      setTotalPages(pages);

      // Get current page items
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setPaginatedHistory(sortedHistory.slice(startIndex, endIndex));
    }
  }, [customerHistory, currentPage]);

  const handleSelectCustomer = (customer) => {
    console.log("Selected customer:", customer);

    // Calculate cylinders outstanding based on transactions
    const customerTransactions = transactions.filter(
      (t) => t.customerId === customer.id
    );
    let cylindersOutstanding = 0;

    customerTransactions.forEach((transaction) => {
      if (transaction.transactionType === "cylinder") {
        // Add cylinders sold
        if (transaction.cylindersSold) {
          cylindersOutstanding += parseFloat(transaction.cylindersSold) || 0;
        }
        // Subtract cylinders returned
        if (transaction.cylindersReturned) {
          cylindersOutstanding -=
            parseFloat(transaction.cylindersReturned) || 0;
        }
      }
    });

    // Set customer history for display in modal
    setCustomerHistory(customerTransactions);
    setCustomerCylinders(cylindersOutstanding);
    // Reset to first page when selecting a new customer
    setCurrentPage(1);

    setFormData({
      ...formData,
      customerId: customer.id,
      customerName: customer.name,
      previousBalance: customer.balance || 0,
    });

    if (validationTriggered) {
      setErrors((prev) => ({
        ...prev,
        customer: undefined,
      }));
    }

    // Updated toast.success to success
    success(`Selected customer: ${customer.name}`, {
      duration: 2000,
      position: "bottom-right",
    });
  };

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    if (validationTriggered && errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Set validation as triggered
    setValidationTriggered(true);

    const validationErrors = {};

    // Validate customer selection
    if (!formData.customerId) {
      console.log("Customer validation failed, ID:", formData.customerId); // Debug log
      validationErrors.customer = "Customer is required";
    } else {
      console.log("Customer validation passed, ID:", formData.customerId); // Debug log
    }

    if (!formData.paymentAmount || parseFloat(formData.paymentAmount) <= 0) {
      validationErrors.paymentAmount = "Payment amount is required";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading((prev) => ({ ...prev, savePayment: true }));

    try {
      const paymentData = {
        date: formData.date.toISOString(),
        customerId: formData.customerId,
        customerName: formData.customerName,
        previousBalance: formData.previousBalance,
        paymentAmount: parseFloat(formData.paymentAmount),
        newBalance:
          formData.previousBalance - parseFloat(formData.paymentAmount),
        paymentType: formData.paymentType,
        cylindersReturned: formData.cylindersReturned
          ? parseInt(formData.cylindersReturned)
          : 0,
        previousCylinders: customerCylinders,
        newCylinders:
          customerCylinders -
          (formData.cylindersReturned
            ? parseInt(formData.cylindersReturned)
            : 0),
        notes: formData.notes,
        timestamp: new Date(),
        createdBy: getCurrentUser()?.uid || "unknown",
      };

      const paymentId = await addDocument("payments", paymentData);

      // Also update customer balance records
      await addDocument("customerBalanceUpdates", {
        customerId: formData.customerId,
        paymentId,
        previousBalance: formData.previousBalance,
        newBalance: paymentData.newBalance,
        timestamp: new Date(),
        type: "payment",
      });

      logCustomEvent("payment_recorded", {
        payment_id: paymentId,
        customer_id: formData.customerId,
        payment_amount: paymentData.paymentAmount,
        payment_type: formData.paymentType,
      });

      // Updated toast.success to success
      success(
        `Payment of $${paymentData.paymentAmount.toFixed(2)} recorded for ${
          formData.customerName
        }`,
        {
          duration: 5000,
          position: "top-center",
        }
      );

      // Reset form
      setFormData({
        date: new Date(),
        customerId: "",
        customerName: "",
        previousBalance: 0,
        paymentAmount: "",
        paymentType: "cash",
        cylindersReturned: "",
        notes: "",
      });

      // Reset validation state alongside form
      setValidationTriggered(false);
      setErrors({});
    } catch (err) {
      console.error("Error submitting payment:", err);
      // Updated toast.error to error
      error("Failed to record payment. Please try again.", {
        duration: 5000,
        position: "top-center",
      });
    } finally {
      setLoading((prev) => ({ ...prev, savePayment: false }));
    }
  };

  return (
    <Card className="max-w-4xl mx-auto shadow">
      <CardHeader className="bg-muted/40 flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-2xl font-bold">
            {formData.customerName ? (
              <button
                onClick={() => setShowHistoryModal(true)}
                className="hover:underline hover:text-primary flex items-center"
              >
                <User className="inline mr-2 h-5 w-5" />
                {formData.customerName}
              </button>
            ) : (
              "Record Payment"
            )}
          </CardTitle>
          {formData.customerName && (
            <CardDescription className="mt-1">
              Click on customer name to view history
            </CardDescription>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          size="sm"
          className="flex items-center"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      </CardHeader>

      {loading.fetchingData ? (
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <svg
              className="animate-spin h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-lg">Loading customer data...</span>
          </div>
        </CardContent>
      ) : (
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and Customer Selection Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Payment Date
                </Label>
                <DateSelector
                  value={formData.date}
                  onChange={(date) => handleChange("date", date)}
                />
              </div>

              <CustomerSelector
                customers={customers}
                selectedCustomer={formData.customerName}
                error={validationTriggered ? errors.customer : undefined}
                onSelectCustomer={handleSelectCustomer}
                onAddNewCustomer={null}
              />
            </div>

            {/* Customer Information - Enhanced Card Display */}
            {formData.customerId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Due Card */}
                <Card className="border-2 border-amber-200 dark:border-amber-900 shadow-md">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-lg flex items-center">
                      <DollarSign className="mr-2 h-5 w-5 text-amber-500" />
                      Payment Due
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                      ${formData.previousBalance.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Current outstanding balance
                    </div>
                  </CardContent>
                </Card>

                {/* Cylinders Due Card */}
                <Card className="border-2 border-blue-200 dark:border-blue-900 shadow-md">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-lg flex items-center">
                      <Package className="mr-2 h-5 w-5 text-blue-500" />
                      Cylinders Due
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {customerCylinders}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Empty cylinders to be returned
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment Amount */}
              <div className="space-y-2">
                <Label htmlFor="paymentAmount" className="flex items-center">
                  <DollarSign className="mr-1 h-4 w-4" />
                  Payment Amount ($)
                </Label>
                <Input
                  id="paymentAmount"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter amount"
                  value={formData.paymentAmount}
                  onChange={(e) =>
                    handleChange("paymentAmount", e.target.value)
                  }
                  className={
                    validationTriggered && errors.paymentAmount
                      ? "border-destructive"
                      : ""
                  }
                />
                {validationTriggered && errors.paymentAmount && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.paymentAmount}
                  </p>
                )}
              </div>

              {/* Cylinders Returned */}
              <div className="space-y-2">
                <Label
                  htmlFor="cylindersReturned"
                  className="flex items-center"
                >
                  <Package className="mr-1 h-4 w-4" />
                  Empty Cylinders Returned
                </Label>
                <Input
                  id="cylindersReturned"
                  type="text"
                  inputMode="numeric"
                  placeholder="Number of cylinders"
                  value={formData.cylindersReturned}
                  onChange={(e) =>
                    handleChange("cylindersReturned", e.target.value)
                  }
                />
              </div>
            </div>

            {/* New Balance Display */}
            {formData.paymentAmount &&
              !isNaN(parseFloat(formData.paymentAmount)) && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      New Balance After Payment:
                    </span>
                    <span
                      className={`text-xl font-bold ${
                        formData.previousBalance -
                          parseFloat(formData.paymentAmount) >
                        0
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      $
                      {(
                        formData.previousBalance -
                        parseFloat(formData.paymentAmount)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="flex rounded-md overflow-hidden border">
                <Button
                  type="button"
                  variant={
                    formData.paymentType === "cash" ? "default" : "ghost"
                  }
                  className={`flex-1 rounded-none ${
                    formData.paymentType === "cash" ? "" : "border-r"
                  }`}
                  onClick={() => handleChange("paymentType", "cash")}
                >
                  Cash
                </Button>
                <Button
                  type="button"
                  variant={
                    formData.paymentType === "cheque" ? "default" : "ghost"
                  }
                  className="flex-1 rounded-none"
                  onClick={() => handleChange("paymentType", "cheque")}
                >
                  Cheque
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Add any notes about this payment"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>

            {/* Full Page History Modal */}
            {showHistoryModal && (
              <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-xl font-bold flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    {formData.customerName} - Transaction History
                  </h2>
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {customerHistory.length > 0 ? (
                    <div className="space-y-6">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-md">
                              Current Balance
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div
                              className={`text-2xl font-bold ${
                                formData.previousBalance > 0
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-green-600 dark:text-green-400"
                              }`}
                            >
                              ${formData.previousBalance.toFixed(2)}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-md">
                              Cylinders Outstanding
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {customerCylinders}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-md">
                              Total Transactions
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-primary">
                              {customerHistory.length}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Transactions Table */}
                      <div className="rounded-md border">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="p-3 text-left">Date</th>
                              <th className="p-3 text-left">Type</th>
                              <th className="p-3 text-right">Amount</th>
                              <th className="p-3 text-right">Balance After</th>
                              <th className="p-3 text-right">Cylinders</th>
                              <th className="p-3 text-left">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedHistory.map((transaction, index) => {
                              const date = new Date(
                                transaction.date || transaction.timestamp
                              );
                              const isPayment =
                                transaction.paymentAmount !== undefined;

                              return (
                                <tr
                                  key={index}
                                  className="border-t hover:bg-muted/50"
                                >
                                  <td className="p-3">
                                    {date.toLocaleDateString()} <br />
                                    <span className="text-xs text-muted-foreground">
                                      {date.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    {isPayment ? (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                        Payment
                                      </span>
                                    ) : transaction.transactionType ===
                                      "cylinder" ? (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        Cylinder Sale
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                        Weight Sale
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right">
                                    {isPayment ? (
                                      <span className="text-green-600 dark:text-green-400">
                                        -${transaction.paymentAmount.toFixed(2)}
                                      </span>
                                    ) : (
                                      <span className="text-amber-600 dark:text-amber-400">
                                        +$
                                        {transaction.totalAmount?.toFixed(2) ||
                                          "0.00"}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right">
                                    $
                                    {isPayment
                                      ? transaction.newBalance?.toFixed(2)
                                      : transaction.balanceAfter ||
                                        transaction.newBalance ||
                                        "N/A"}
                                  </td>
                                  <td className="p-3 text-right">
                                    {isPayment &&
                                    transaction.cylindersReturned ? (
                                      <span className="text-green-600 dark:text-green-400">
                                        -{transaction.cylindersReturned}
                                      </span>
                                    ) : transaction.transactionType ===
                                      "cylinder" ? (
                                      <span>
                                        +{transaction.cylindersSold || 0}
                                        {transaction.cylindersReturned ? (
                                          <span className="text-green-600 dark:text-green-400">
                                            /-{transaction.cylindersReturned}
                                          </span>
                                        ) : (
                                          ""
                                        )}
                                      </span>
                                    ) : (
                                      "N/A"
                                    )}
                                  </td>
                                  <td className="p-3 text-left max-w-xs truncate">
                                    {transaction.notes || "-"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <Pagination className="justify-center">
                          <PaginationContent>
                            {currentPage > 1 && (
                              <PaginationItem>
                                <PaginationPrevious
                                  onClick={() =>
                                    setCurrentPage((prev) =>
                                      Math.max(prev - 1, 1)
                                    )
                                  }
                                />
                              </PaginationItem>
                            )}

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter(
                                (page) =>
                                  page === 1 ||
                                  page === totalPages ||
                                  (page >= currentPage - 1 &&
                                    page <= currentPage + 1)
                              )
                              .map((page, index, array) => {
                                // Add ellipsis if there are gaps in the sequence
                                if (index > 0 && page - array[index - 1] > 1) {
                                  return (
                                    <React.Fragment key={`ellipsis-${page}`}>
                                      <PaginationItem>
                                        <span className="px-4 py-2">...</span>
                                      </PaginationItem>
                                      <PaginationItem>
                                        <PaginationLink
                                          onClick={() => setCurrentPage(page)}
                                          isActive={page === currentPage}
                                        >
                                          {page}
                                        </PaginationLink>
                                      </PaginationItem>
                                    </React.Fragment>
                                  );
                                }

                                return (
                                  <PaginationItem key={page}>
                                    <PaginationLink
                                      onClick={() => setCurrentPage(page)}
                                      isActive={page === currentPage}
                                    >
                                      {page}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              })}

                            {currentPage < totalPages && (
                              <PaginationItem>
                                <PaginationNext
                                  onClick={() =>
                                    setCurrentPage((prev) =>
                                      Math.min(prev + 1, totalPages)
                                    )
                                  }
                                />
                              </PaginationItem>
                            )}
                          </PaginationContent>
                        </Pagination>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="mx-auto w-16 h-16 mb-4 opacity-20">
                        <Package className="w-full h-full" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">
                        No transaction history
                      </h3>
                      <p>
                        This customer doesn't have any transaction records yet.
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t">
                  <Button
                    onClick={() => setShowHistoryModal(false)}
                    className="w-full"
                    variant="default"
                    size="lg"
                  >
                    Close History View
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      )}

      <CardFooter className="flex justify-center pt-0 pb-6">
        <Button
          type="submit"
          className="w-full max-w-xs"
          disabled={loading.savePayment}
          size="lg"
          onClick={handleSubmit}
        >
          {loading.savePayment ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            "Record Payment"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentPage;
