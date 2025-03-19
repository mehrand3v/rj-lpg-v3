// src/pages/Transactions.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Search,
  Filter,
  ChevronDown,
  Calendar,
  CreditCard,
  Package,
  Truck,
  Plus,
  X,
  Printer
} from 'lucide-react';

// Import components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from '@/components/LoadingSpinner';

// Import services
import { getDocuments, getDocumentById } from '@/services/db';
import { logPageView, logCustomEvent } from '@/services/analytics';

const TransactionSummaryCard = ({ title, icon, value, subtitle, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="bg-gray-800 border-gray-800 shadow-md">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <h3 className="mt-1 text-2xl font-bold text-white">{value}</h3>
            {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className={`rounded-full ${color} p-2 text-white`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const TransactionsTable = ({ transactions, onRowClick }) => {
  return (
    <div className="rounded-md border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-850">
          <TableRow className="hover:bg-gray-800 border-gray-800">
            <TableHead className="text-gray-400 font-medium">Date</TableHead>
            <TableHead className="text-gray-400 font-medium">Customer</TableHead>
            <TableHead className="text-gray-400 font-medium">Type</TableHead>
            <TableHead className="text-gray-400 font-medium">Details</TableHead>
            <TableHead className="text-gray-400 font-medium text-right">Amount</TableHead>
            <TableHead className="text-gray-400 font-medium text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow className="hover:bg-gray-750 border-gray-800">
              <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                No transactions found. Adjust your filters or create a new transaction.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                className="hover:bg-gray-750 border-gray-800 cursor-pointer"
                onClick={() => onRowClick(transaction.id)}
              >
                <TableCell className="font-medium text-gray-300">
                  {transaction.date ? format(transaction.date.toDate(), 'MMM dd, yyyy') : '—'}
                </TableCell>
                <TableCell className="text-gray-300">{transaction.customerName}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transaction.transactionType === 'cylinder'
                      ? 'bg-indigo-900/30 text-indigo-400'
                      : transaction.transactionType === 'weight'
                        ? 'bg-blue-900/30 text-blue-400'
                        : 'bg-green-900/30 text-green-400'
                  }`}>
                    {transaction.transactionType === 'cylinder'
                      ? 'Cylinder'
                      : transaction.transactionType === 'weight'
                        ? 'Weight'
                        : 'Payment'}
                  </span>
                </TableCell>
                <TableCell>
                  {transaction.transactionType === 'cylinder' ? (
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-300">
                        {transaction.cylindersSold} cylinder{transaction.cylindersSold !== 1 ? 's' : ''}
                      </span>
                      {transaction.cylindersReturned > 0 && (
                        <span className="text-xs text-gray-400">
                          {transaction.cylindersReturned} returned
                        </span>
                      )}
                    </div>
                  ) : transaction.transactionType === 'weight' ? (
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-300">
                        {transaction.gasWeightSold} kg
                      </span>
                      {transaction.vehicleRego && (
                        <span className="text-xs text-gray-400">
                          Vehicle: {transaction.vehicleRego}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-300">Payment received</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-medium text-gray-300">
                    ${transaction.totalAmount?.toFixed(2) || '0.00'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transaction.paymentStatus === 'Paid'
                      ? 'bg-green-900/30 text-green-400'
                      : transaction.paymentStatus === 'Partial'
                        ? 'bg-yellow-900/30 text-yellow-400'
                        : 'bg-red-900/30 text-red-400'
                  }`}>
                    {transaction.paymentStatus}
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

const TransactionDetails = ({ transaction, onClose, onRecordPayment }) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75">
      <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto border border-gray-700">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Transaction Details</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Transaction ID</h3>
              <p className="text-gray-300">{transaction.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Date</h3>
              <p className="text-gray-300">
                {transaction.date ? format(transaction.date.toDate(), 'MMM dd, yyyy, h:mm a') : '—'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Customer</h3>
              <p className="text-gray-300">{transaction.customerName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Type</h3>
              <p className="text-gray-300">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  transaction.transactionType === 'cylinder'
                    ? 'bg-indigo-900/30 text-indigo-400'
                    : transaction.transactionType === 'weight'
                      ? 'bg-blue-900/30 text-blue-400'
                      : 'bg-green-900/30 text-green-400'
                }`}>
                  {transaction.transactionType === 'cylinder'
                    ? 'Cylinder Sale'
                    : transaction.transactionType === 'weight'
                      ? 'Weight Sale'
                      : 'Payment'}
                </span>
              </p>
            </div>
          </div>

          {/* Type-specific details */}
          {transaction.transactionType === 'cylinder' && (
            <div className="bg-gray-750 rounded-md p-3 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Cylinder Details</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-sm text-gray-400">Cylinders Sold:</span>
                  <span className="ml-2 text-gray-300">{transaction.cylindersSold}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Rate per Cylinder:</span>
                  <span className="ml-2 text-gray-300">${transaction.cylinderRate?.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Cylinders Returned:</span>
                  <span className="ml-2 text-gray-300">{transaction.cylindersReturned || 0}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Net Cylinders:</span>
                  <span className="ml-2 text-gray-300">{transaction.cylindersSold - (transaction.cylindersReturned || 0)}</span>
                </div>
              </div>
            </div>
          )}

          {transaction.transactionType === 'weight' && (
            <div className="bg-gray-750 rounded-md p-3 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Weight Details</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-sm text-gray-400">Gas Weight:</span>
                  <span className="ml-2 text-gray-300">{transaction.gasWeightSold} kg</span>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Rate per kg:</span>
                  <span className="ml-2 text-gray-300">${transaction.gasWeightRate?.toFixed(2)}</span>
                </div>
                {transaction.vehicleRego && (
                  <div className="col-span-2">
                    <span className="text-sm text-gray-400">Vehicle:</span>
                    <span className="ml-2 text-gray-300">{transaction.vehicleRego}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Financial details */}
          <div className="bg-gray-750 rounded-md p-3 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Financial Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Total Amount:</span>
                <span className="text-sm font-medium text-gray-300">${transaction.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Amount Received:</span>
                <span className="text-sm font-medium text-gray-300">${transaction.amountReceived?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Previous Balance:</span>
                <span className="text-sm font-medium text-gray-300">${transaction.previousBalance?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-1">
                <span className="text-sm font-medium text-gray-300">Remaining Balance:</span>
                <span className={`text-sm font-bold ${(transaction.remainingBalance || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  ${transaction.remainingBalance?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Payment Type</h3>
              <p className="text-gray-300">{transaction.paymentType || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Payment Status</h3>
              <p>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  transaction.paymentStatus === 'Paid'
                    ? 'bg-green-900/30 text-green-400'
                    : transaction.paymentStatus === 'Partial'
                      ? 'bg-yellow-900/30 text-yellow-400'
                      : 'bg-red-900/30 text-red-400'
                }`}>
                  {transaction.paymentStatus || 'Unknown'}
                </span>
              </p>
            </div>
          </div>

          {transaction.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-400">Notes</h3>
              <p className="text-gray-300 bg-gray-750 p-2 rounded mt-1 border border-gray-700">{transaction.notes}</p>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-between">
          <Button
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-700"
            onClick={onClose}
          >
            Close
          </Button>
          <div className="space-x-2">
            <Button
              variant="outline"
              className="border-indigo-600 text-indigo-400 hover:bg-indigo-900 hover:text-white"
              onClick={() => {
                logCustomEvent('transaction_print', { transactionId: transaction.id });
                window.print();  // In a real app, you'd implement proper printing
              }}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
            {transaction.paymentStatus !== 'Paid' && (
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => onRecordPayment(transaction)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Transactions = () => {
  const navigate = useNavigate();
  const { showNotification } = useOutletContext();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    type: "all",
    status: "all",
    dateRange: "all",
  });

  // View details modal
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionDetailLoading, setTransactionDetailLoading] =
    useState(false);

  // Summary calculations
  const [summary, setSummary] = useState({
    totalSales: 0,
    cylindersSold: 0,
    gasWeightSold: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    // Log page view
    logPageView("Transactions");

    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchQuery, activeFilters, transactions]);

  // Calculate summary statistics
  useEffect(() => {
    if (transactions.length > 0) {
      const totalSales = transactions.reduce(
        (sum, tx) => sum + (tx.totalAmount || 0),
        0
      );
      const cylindersSold = transactions.reduce((sum, tx) => {
        return tx.transactionType === "cylinder"
          ? sum + (tx.cylindersSold || 0)
          : sum;
      }, 0);
      const gasWeightSold = transactions.reduce((sum, tx) => {
        return tx.transactionType === "weight"
          ? sum + (tx.gasWeightSold || 0)
          : sum;
      }, 0);
      const pendingPayments = transactions.reduce((sum, tx) => {
        return tx.paymentStatus !== "Paid"
          ? sum + (tx.totalAmount - (tx.amountReceived || 0))
          : sum;
      }, 0);

      setSummary({
        totalSales,
        cylindersSold,
        gasWeightSold,
        pendingPayments,
      });
    }
  }, [transactions]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // In a real application, we would fetch actual transactions from Firestore
      // Using the following approach:
      // const transactionsSnapshot = await getDocuments('transactions', [
      //   orderBy('date', 'desc')
      // ]);
      // const fetchedTransactions = transactionsSnapshot;

      // For this demo, we'll use sample data
      const sampleTransactions = [
        {
          id: "1",
          customerId: "c1",
          customerName: "John Smith",
          date: { toDate: () => new Date(2023, 2, 15) },
          transactionType: "cylinder",
          cylindersSold: 2,
          cylindersReturned: 0,
          cylinderRate: 25,
          totalAmount: 50,
          amountReceived: 50,
          previousBalance: 0,
          remainingBalance: 0,
          paymentType: "Cash",
          paymentStatus: "Paid",
        },
        {
          id: "2",
          customerId: "c2",
          customerName: "Sarah Johnson",
          date: { toDate: () => new Date(2023, 2, 20) },
          transactionType: "weight",
          vehicleRego: "ABC123",
          gasWeightSold: 10,
          gasWeightRate: 3,
          totalAmount: 30,
          amountReceived: 20,
          previousBalance: 0,
          remainingBalance: 10,
          paymentType: "Credit",
          paymentStatus: "Partial",
        },
        {
          id: "3",
          customerId: "c1",
          customerName: "John Smith",
          date: { toDate: () => new Date(2023, 3, 1) },
          transactionType: "cylinder",
          cylindersSold: 1,
          cylindersReturned: 1,
          cylinderRate: 25,
          totalAmount: 25,
          amountReceived: 0,
          previousBalance: 0,
          remainingBalance: 25,
          paymentType: "Credit",
          paymentStatus: "Unpaid",
        },
        {
          id: "4",
          customerId: "c3",
          customerName: "XYZ Company",
          date: { toDate: () => new Date(2023, 3, 5) },
          transactionType: "weight",
          vehicleRego: "XYZ789",
          gasWeightSold: 20,
          gasWeightRate: 3,
          totalAmount: 60,
          amountReceived: 60,
          previousBalance: 0,
          remainingBalance: 0,
          paymentType: "Cash",
          paymentStatus: "Paid",
        },
        {
          id: "5",
          customerId: "c2",
          customerName: "Sarah Johnson",
          date: { toDate: () => new Date(2023, 3, 10) },
          transactionType: "payment",
          totalAmount: 10,
          amountReceived: 10,
          previousBalance: 10,
          remainingBalance: 0,
          paymentType: "Cash",
          paymentStatus: "Paid",
        },
      ];

      setTransactions(sampleTransactions);
      setFilteredTransactions(sampleTransactions);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      showNotification("Failed to load transactions", "error");
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    if (!transactions.length) return;

    let result = [...transactions];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (transaction) =>
          transaction.customerName?.toLowerCase().includes(query) ||
          transaction.vehicleRego?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (activeFilters.type !== "all") {
      result = result.filter(
        (transaction) => transaction.transactionType === activeFilters.type
      );
    }

    // Apply status filter
    if (activeFilters.status !== "all") {
      result = result.filter(
        (transaction) => transaction.paymentStatus === activeFilters.status
      );
    }

    // Apply date range filter
    if (activeFilters.dateRange !== "all") {
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      if (activeFilters.dateRange === "today") {
        result = result.filter((transaction) => {
          const txDate = transaction.date.toDate();
          return txDate >= startOfToday;
        });
      } else if (activeFilters.dateRange === "week") {
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

        result = result.filter((transaction) => {
          const txDate = transaction.date.toDate();
          return txDate >= startOfWeek;
        });
      } else if (activeFilters.dateRange === "month") {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        result = result.filter((transaction) => {
          const txDate = transaction.date.toDate();
          return txDate >= startOfMonth;
        });
      }
    }

    setFilteredTransactions(result);
  };

  const handleViewTransaction = async (id) => {
    setTransactionDetailLoading(true);

    // In a real app, you would fetch the transaction detail from Firestore
    // For this demo, we'll just find it in our existing array
    const transaction = transactions.find((t) => t.id === id);

    if (transaction) {
      setSelectedTransaction(transaction);
    } else {
      showNotification("Transaction not found", "error");
    }

    setTransactionDetailLoading(false);
  };

  const handleAddTransaction = (type) => {
    switch (type) {
      case "cylinder":
        navigate("/sales/new?type=cylinder");
        break;
      case "weight":
        navigate("/sales/new?type=weight");
        break;
      case "payment":
        navigate("/transactions/new?type=payment");
        break;
      default:
        navigate("/sales/new");
    }
  };

  const handleRecordPayment = (transaction) => {
    // Navigate to payment form with transaction details pre-filled
    navigate(
      `/transactions/new?type=payment&customerId=${transaction.customerId}&transactionId=${transaction.id}`
    );
  };

  const resetFilters = () => {
    setActiveFilters({
      type: "all",
      status: "all",
      dateRange: "all",
    });
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-gray-400">
            View and manage all sales and payment transactions
          </p>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Transaction
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-800 border-gray-700 text-gray-300"
            >
              <DropdownMenuItem
                onClick={() => handleAddTransaction("cylinder")}
                className="hover:bg-gray-700 cursor-pointer"
              >
                <Package className="h-4 w-4 mr-2 text-indigo-400" />
                Cylinder Sale
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAddTransaction("weight")}
                className="hover:bg-gray-700 cursor-pointer"
              >
                <Truck className="h-4 w-4 mr-2 text-blue-400" />
                Weight Sale
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                onClick={() => handleAddTransaction("payment")}
                className="hover:bg-gray-700 cursor-pointer"
              >
                <CreditCard className="h-4 w-4 mr-2 text-green-400" />
                Record Payment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <TransactionSummaryCard
          title="Total Sales"
          icon={<CreditCard className="h-5 w-5" />}
          value={`$${summary.totalSales.toFixed(2)}`}
          subtitle="All time total"
          color="bg-indigo-800"
        />
        <TransactionSummaryCard
          title="Cylinders Sold"
          icon={<Package className="h-5 w-5" />}
          value={summary.cylindersSold}
          subtitle="Total cylinders"
          color="bg-blue-800"
        />
        <TransactionSummaryCard
          title="Gas Weight Sold"
          icon={<Truck className="h-5 w-5" />}
          value={`${summary.gasWeightSold} kg`}
          subtitle="Total gas weight"
          color="bg-green-800"
        />
        <TransactionSummaryCard
          title="Pending Payments"
          icon={<Calendar className="h-5 w-5" />}
          value={`$${summary.pendingPayments.toFixed(2)}`}
          subtitle="Outstanding balance"
          color="bg-red-800"
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by customer or vehicle..."
            className="pl-9 bg-gray-800 border-gray-700 text-gray-300 placeholder:text-gray-500 focus:border-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Transaction Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-gray-700 bg-gray-800 text-gray-300 hover:text-gray-200 hover:bg-gray-700 h-10"
              >
                <Package className="h-4 w-4 mr-2" />
                Type:{" "}
                {activeFilters.type === "all"
                  ? "All"
                  : activeFilters.type === "cylinder"
                  ? "Cylinder"
                  : activeFilters.type === "weight"
                  ? "Weight"
                  : "Payment"}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-800 border-gray-700 text-gray-300"
            >
              <DropdownMenuItem
                onClick={() =>
                  setActiveFilters((prev) => ({ ...prev, type: "all" }))
                }
                className="hover:bg-gray-700 cursor-pointer"
              >
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setActiveFilters((prev) => ({ ...prev, type: "cylinder" }))
                }
                className="hover:bg-gray-700 cursor-pointer"
              >
                <Package className="h-4 w-4 mr-2 text-indigo-400" />
                Cylinder Sales
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setActiveFilters((prev) => ({ ...prev, type: "weight" }))
                }
                className="hover:bg-gray-700 cursor-pointer"
              >
                <Truck className="h-4 w-4 mr-2 text-blue-400" />
                Weight Sales
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setActiveFilters((prev) => ({ ...prev, type: "payment" }))
                }
                className="hover:bg-gray-700 cursor-pointer"
              >
                <CreditCard className="h-4 w-4 mr-2 text-green-400" />
                Payments
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Payment Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-gray-700 bg-gray-800 text-gray-300 hover:text-gray-200 hover:bg-gray-700 h-10"
              >
                <Filter className="h-4 w-4 mr-2" />
                Status:{" "}
                {activeFilters.status === "all" ? "All" : activeFilters.status}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-800 border-gray-700 text-gray-300"
            >
              <DropdownMenuItem
                onClick={() =>
                  setActiveFilters((prev) => ({ ...prev, status: "all" }))
                }
                className="hover:bg-gray-700 cursor-pointer"
              >
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setActiveFilters((prev) => ({ ...prev, status: "Paid" }))
                }
                className="hover:bg-gray-700 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                Paid
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setActiveFilters((prev) => ({ ...prev, status: "Partial" }))
                }
                className="hover:bg-gray-700 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                Partial
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setActiveFilters((prev) => ({ ...prev, status: "Unpaid" }))
                }
                className="hover:bg-gray-700 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                Unpaid
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date Range Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-gray-700 bg-gray-800 text-gray-300 hover:text-gray-200 hover:bg-gray-700 h-10"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Date:{" "}
                {activeFilters.dateRange === "all"
                  ? "All Time"
                  : activeFilters.dateRange === "today"
                  ? "Today"
                  : activeFilters.dateRange === "week"
                  ? "This Week"
                  : "This Month"}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-800 border-gray-700 text-gray-300"
            >
              <DropdownMenuItem
                onClick={() =>
                  setActiveFilters((prev) => ({ ...prev, dateRange: "all" }))
                }
                className="hover:bg-gray-700 cursor-pointer"
              >
                All Time
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setActiveFilters((prev) => ({ ...prev, dateRange: "today" }))
                }
                className="hover:bg-gray-700 cursor-pointer"
              >
                Today
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setActiveFilters((prev) => ({ ...prev, dateRange: "week" }))
                }
                className="hover:bg-gray-700 cursor-pointer"
              >
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setActiveFilters((prev) => ({ ...prev, dateRange: "month" }))
                }
                className="hover:bg-gray-700 cursor-pointer"
              >
                This Month
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Reset Filters Button */}
          {(activeFilters.type !== "all" ||
            activeFilters.status !== "all" ||
            activeFilters.dateRange !== "all" ||
            searchQuery) && (
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="h-10 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Loading transactions..." />
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="flex justify-center items-center h-64 bg-gray-800 rounded-lg border border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-300">
              No transactions found
            </h3>
            <p className="text-gray-500 mt-1">
              Try adjusting your search or filters
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => handleAddTransaction("cylinder")}
              >
                <Package className="h-4 w-4 mr-2" />
                New Cylinder Sale
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleAddTransaction("weight")}
              >
                <Truck className="h-4 w-4 mr-2" />
                New Weight Sale
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TransactionsTable
            transactions={filteredTransactions}
            onRowClick={handleViewTransaction}
          />
        </motion.div>
      )}

      {/* Pagination - would implement in a real app */}
      {!loading && filteredTransactions.length > 0 && (
        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-400">
            Showing{" "}
            <span className="font-medium text-gray-300">
              {filteredTransactions.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-300">
              {transactions.length}
            </span>{" "}
            transactions
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
              disabled={true}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="border-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
              disabled={true}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetails
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onRecordPayment={handleRecordPayment}
        />
      )}

      {/* Loading overlay for transaction details */}
      {transactionDetailLoading && (
        <LoadingSpinner fullPage={true} text="Loading transaction details..." />
      )}
    </div>
  );
};

export default Transactions;