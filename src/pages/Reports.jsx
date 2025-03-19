// src/pages/Reports.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import {
  Calendar,
  BarChart3,
  Download,
  FileText,
  Truck,
  Package,
  CreditCard,
  Mail,
  ChevronDown,
  RefreshCw,
  Printer,
  Filter,
} from "lucide-react";

// Import components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LoadingSpinner from "@/components/LoadingSpinner";

// Import services
import { getDocuments } from "@/services/db";
import { logPageView, logCustomEvent } from "@/services/analytics";

// Report period selector component
const ReportPeriodSelector = ({ selectedMonth, onMonthChange }) => {
  const currentDate = new Date();

  // Generate last 6 months for dropdown
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(currentDate, i);
    return {
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy"),
    };
  });

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-5 w-5 text-gray-400" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="border-gray-700 bg-gray-800 text-gray-300 hover:text-gray-200 hover:bg-gray-700"
          >
            {months.find((m) => m.value === selectedMonth)?.label ||
              "Select Month"}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-gray-800 border-gray-700 text-gray-300"
        >
          {months.map((month) => (
            <DropdownMenuItem
              key={month.value}
              className={`hover:bg-gray-700 cursor-pointer ${
                selectedMonth === month.value ? "bg-gray-700" : ""
              }`}
              onClick={() => onMonthChange(month.value)}
            >
              {month.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// Summary card component for reports
const ReportSummaryCard = ({ title, value, subtitle, icon, color }) => (
  <Card className="bg-gray-800 border-gray-700 shadow-md">
    <CardContent className="p-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <h3 className="mt-1 text-2xl font-bold text-white">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`rounded-full ${color} p-2`}>{icon}</div>
      </div>
    </CardContent>
  </Card>
);

// Vehicle Statements table components
const MonthlyVehicleStatements = ({
  statements,
  onGenerateInvoice,
  onSendInvoice,
  onViewDetails,
}) => {
  return (
    <div className="rounded-md border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-850">
          <TableRow className="hover:bg-gray-800 border-gray-800">
            <TableHead className="text-gray-400 font-medium">Vehicle</TableHead>
            <TableHead className="text-gray-400 font-medium">
              Customer
            </TableHead>
            <TableHead className="text-gray-400 font-medium text-right">
              Gas Used
            </TableHead>
            <TableHead className="text-gray-400 font-medium text-right">
              Amount
            </TableHead>
            <TableHead className="text-gray-400 font-medium text-right">
              Status
            </TableHead>
            <TableHead className="text-gray-400 font-medium text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {statements.length === 0 ? (
            <TableRow className="hover:bg-gray-750 border-gray-800">
              <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                No vehicle statements found for this period.
              </TableCell>
            </TableRow>
          ) : (
            statements.map((statement) => (
              <TableRow
                key={statement.id}
                className="hover:bg-gray-750 border-gray-800"
              >
                <TableCell className="font-medium text-gray-300">
                  {statement.vehicleRego}
                </TableCell>
                <TableCell className="text-gray-300">
                  {statement.customerName}
                </TableCell>
                <TableCell className="text-right text-gray-300">
                  {statement.totalGasSold} kg
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-medium text-gray-300">
                    ${statement.totalAmount?.toFixed(2) || "0.00"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      statement.status === "Paid"
                        ? "bg-green-900/30 text-green-400"
                        : statement.status === "Partial"
                        ? "bg-yellow-900/30 text-yellow-400"
                        : "bg-red-900/30 text-red-400"
                    }`}
                  >
                    {statement.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                      onClick={() => onViewDetails(statement)}
                      title="View Details"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-white hover:bg-indigo-900"
                      onClick={() => onGenerateInvoice(statement)}
                      title="Generate Invoice"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-white hover:bg-blue-900"
                      onClick={() => onSendInvoice(statement)}
                      title="Send Invoice"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

// Sales summary table component
const SalesSummaryTable = ({ salesData }) => {
  return (
    <div className="rounded-md border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-850">
          <TableRow className="hover:bg-gray-800 border-gray-800">
            <TableHead className="text-gray-400 font-medium">
              Category
            </TableHead>
            <TableHead className="text-gray-400 font-medium text-right">
              Quantity
            </TableHead>
            <TableHead className="text-gray-400 font-medium text-right">
              Total Sales
            </TableHead>
            <TableHead className="text-gray-400 font-medium text-right">
              Payments
            </TableHead>
            <TableHead className="text-gray-400 font-medium text-right">
              Outstanding
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {salesData.map((item) => (
            <TableRow
              key={item.category}
              className="hover:bg-gray-750 border-gray-800"
            >
              <TableCell className="font-medium text-gray-300">
                {item.category}
              </TableCell>
              <TableCell className="text-right text-gray-300">
                {item.quantityLabel
                  ? `${item.quantity} ${item.quantityLabel}`
                  : item.quantity}
              </TableCell>
              <TableCell className="text-right">
                <span className="font-medium text-gray-300">
                  ${item.totalSales.toFixed(2)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="font-medium text-green-400">
                  ${item.payments.toFixed(2)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="font-medium text-red-400">
                  ${item.outstanding.toFixed(2)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Statement detail modal
const StatementDetailModal = ({ statement, onClose }) => {
  if (!statement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75">
      <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto border border-gray-700">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            Monthly Statement - {statement.vehicleRego}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            Close
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Header Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Vehicle</h3>
              <p className="text-gray-300">{statement.vehicleRego}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Customer</h3>
              <p className="text-gray-300">{statement.customerName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Period</h3>
              <p className="text-gray-300">
                {format(statement.startDate.toDate(), "MMM dd")} -{" "}
                {format(statement.endDate.toDate(), "MMM dd, yyyy")}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Status</h3>
              <p>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    statement.status === "Paid"
                      ? "bg-green-900/30 text-green-400"
                      : statement.status === "Partial"
                      ? "bg-yellow-900/30 text-yellow-400"
                      : "bg-red-900/30 text-red-400"
                  }`}
                >
                  {statement.status}
                </span>
              </p>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-gray-750 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-3 bg-gray-700 font-medium text-gray-300">
              Transactions
            </div>
            <div className="p-0">
              <Table>
                <TableHeader className="bg-gray-800">
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400 font-medium">
                      Date
                    </TableHead>
                    <TableHead className="text-gray-400 font-medium text-right">
                      Gas (kg)
                    </TableHead>
                    <TableHead className="text-gray-400 font-medium text-right">
                      Rate
                    </TableHead>
                    <TableHead className="text-gray-400 font-medium text-right">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statement.transactions?.map((tx, index) => (
                    <TableRow key={index} className="border-gray-700">
                      <TableCell className="text-gray-300">
                        {format(tx.date.toDate(), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right text-gray-300">
                        {tx.gasWeightSold}
                      </TableCell>
                      <TableCell className="text-right text-gray-300">
                        ${tx.gasWeightRate.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-gray-300">
                        ${tx.totalAmount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-750 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-3 bg-gray-700 font-medium text-gray-300">
              Summary
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Gas Used:</span>
                <span className="text-gray-300 font-medium">
                  {statement.totalGasSold} kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Amount:</span>
                <span className="text-gray-300 font-medium">
                  ${statement.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount Paid:</span>
                <span className="text-green-400 font-medium">
                  ${statement.amountPaid.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
                <span className="text-gray-300 font-medium">
                  Remaining Balance:
                </span>
                <span className="text-red-400 font-medium">
                  ${statement.remainingBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="bg-gray-750 rounded-lg border border-gray-700 p-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-400">Due Date:</span>
                <span className="ml-2 text-gray-300 font-medium">
                  {format(statement.dueDate.toDate(), "MMMM dd, yyyy")}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Invoice Number:</span>
                <span className="ml-2 text-gray-300 font-medium">
                  {statement.id}
                </span>
              </div>
            </div>
          </div>
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
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Mail className="h-4 w-4 mr-2" />
              Send Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Reports component
const Reports = () => {
  const navigate = useNavigate();
  const { showNotification } = useOutletContext();

  // State management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [vehicleStatements, setVehicleStatements] = useState([]);
  const [salesSummary, setSalesSummary] = useState([]);
  const [selectedStatement, setSelectedStatement] = useState(null);

  // Calculated date range for reports
  const startDate = startOfMonth(new Date(selectedMonth));
  const endDate = endOfMonth(new Date(selectedMonth));

  useEffect(() => {
    // Log page view
    logPageView("Reports");

    // Load data when month changes
    loadReportData();
  }, [selectedMonth]);

  const loadReportData = async () => {
    setLoading(true);

    try {
      // Load vehicle statements for selected month
      await fetchVehicleStatements();

      // Generate sales summary
      await generateSalesSummary();

      setLoading(false);
    } catch (error) {
      console.error("Error loading report data:", error);
      showNotification("Failed to load report data", "error");
      setLoading(false);
    }
  };

  const fetchVehicleStatements = async () => {
    // This would be a real Firebase query in production
    // For now, we'll use sample data

    // Sample statements data
    const sampleStatements = [
      {
        id: "VS-2023-03-001",
        vehicleId: "v1",
        vehicleRego: "ABC123",
        customerId: "c2",
        customerName: "Sarah Johnson",
        month: selectedMonth,
        startDate: { toDate: () => startDate },
        endDate: { toDate: () => endDate },
        totalGasSold: 120,
        totalAmount: 360.0,
        amountPaid: 360.0,
        remainingBalance: 0.0,
        status: "Paid",
        dueDate: {
          toDate: () =>
            new Date(endDate.getFullYear(), endDate.getMonth() + 1, 15),
        },
        transactions: [
          {
            date: { toDate: () => new Date(2023, 2, 5) },
            gasWeightSold: 40,
            gasWeightRate: 3.0,
            totalAmount: 120.0,
          },
          {
            date: { toDate: () => new Date(2023, 2, 15) },
            gasWeightSold: 30,
            gasWeightRate: 3.0,
            totalAmount: 90.0,
          },
          {
            date: { toDate: () => new Date(2023, 2, 25) },
            gasWeightSold: 50,
            gasWeightRate: 3.0,
            totalAmount: 150.0,
          },
        ],
      },
      {
        id: "VS-2023-03-002",
        vehicleId: "v2",
        vehicleRego: "XYZ789",
        customerId: "c3",
        customerName: "XYZ Company",
        month: selectedMonth,
        startDate: { toDate: () => startDate },
        endDate: { toDate: () => endDate },
        totalGasSold: 200,
        totalAmount: 600.0,
        amountPaid: 300.0,
        remainingBalance: 300.0,
        status: "Partial",
        dueDate: {
          toDate: () =>
            new Date(endDate.getFullYear(), endDate.getMonth() + 1, 15),
        },
        transactions: [
          {
            date: { toDate: () => new Date(2023, 2, 8) },
            gasWeightSold: 70,
            gasWeightRate: 3.0,
            totalAmount: 210.0,
          },
          {
            date: { toDate: () => new Date(2023, 2, 18) },
            gasWeightSold: 65,
            gasWeightRate: 3.0,
            totalAmount: 195.0,
          },
          {
            date: { toDate: () => new Date(2023, 2, 28) },
            gasWeightSold: 65,
            gasWeightRate: 3.0,
            totalAmount: 195.0,
          },
        ],
      },
      {
        id: "VS-2023-03-003",
        vehicleId: "v3",
        vehicleRego: "DEF456",
        customerId: "c1",
        customerName: "John Smith",
        month: selectedMonth,
        startDate: { toDate: () => startDate },
        endDate: { toDate: () => endDate },
        totalGasSold: 80,
        totalAmount: 240.0,
        amountPaid: 0.0,
        remainingBalance: 240.0,
        status: "Unpaid",
        dueDate: {
          toDate: () =>
            new Date(endDate.getFullYear(), endDate.getMonth() + 1, 15),
        },
        transactions: [
          {
            date: { toDate: () => new Date(2023, 2, 10) },
            gasWeightSold: 40,
            gasWeightRate: 3.0,
            totalAmount: 120.0,
          },
          {
            date: { toDate: () => new Date(2023, 2, 22) },
            gasWeightSold: 40,
            gasWeightRate: 3.0,
            totalAmount: 120.0,
          },
        ],
      },
    ];

    setVehicleStatements(sampleStatements);
  };

  const generateSalesSummary = async () => {
    // This would calculate real summary based on transactions
    // For now, we'll use sample data

    const summary = [
      {
        category: "Cylinder Sales",
        quantity: 45,
        quantityLabel: "cylinders",
        totalSales: 1125.0,
        payments: 900.0,
        outstanding: 225.0,
      },
      {
        category: "Weight Sales",
        quantity: 400,
        quantityLabel: "kg",
        totalSales: 1200.0,
        payments: 660.0,
        outstanding: 540.0,
      },
      {
        category: "Cylinder Returns",
        quantity: 25,
        quantityLabel: "cylinders",
        totalSales: 0.0,
        payments: 0.0,
        outstanding: 0.0,
      },
      {
        category: "Total",
        quantity: "",
        quantityLabel: "",
        totalSales: 2325.0,
        payments: 1560.0,
        outstanding: 765.0,
      },
    ];

    setSalesSummary(summary);
  };

  const handleGenerateMonthlyStatements = () => {
    showNotification("Generating monthly statements...", "info");

    // In a real app, this would trigger a backend process
    setTimeout(() => {
      showNotification("Monthly statements generated successfully", "success");
      loadReportData();
    }, 1500);
  };

  const handleViewStatementDetails = (statement) => {
    setSelectedStatement(statement);
  };

  const handleGenerateInvoice = (statement) => {
    logCustomEvent("invoice_generated", { statementId: statement.id });
    showNotification(
      `Invoice for ${statement.vehicleRego} generated`,
      "success"
    );

    // In a real app, this would trigger PDF generation
    // For this demo, we'll just open the statement details
    setSelectedStatement(statement);
  };

  const handleSendInvoice = (statement) => {
    logCustomEvent("invoice_sent", { statementId: statement.id });
    showNotification(
      `Invoice for ${statement.vehicleRego} sent to ${statement.customerName}`,
      "success"
    );
  };

  const handleExportReport = (format) => {
    logCustomEvent("report_exported", { format, period: selectedMonth });
    showNotification(`Report exported as ${format.toUpperCase()}`, "success");
  };

  const getTotalAmounts = () => {
    const total = vehicleStatements.reduce(
      (sum, statement) => sum + statement.totalAmount,
      0
    );
    const paid = vehicleStatements.reduce(
      (sum, statement) => sum + statement.amountPaid,
      0
    );
    const pending = vehicleStatements.reduce(
      (sum, statement) => sum + statement.remainingBalance,
      0
    );

    return { total, paid, pending };
  };

  // Get summary numbers for display
  const { total, paid, pending } = getTotalAmounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-gray-400">
            View and generate sales reports and monthly statements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ReportPeriodSelector
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-800 border-gray-700 text-gray-300"
            >
              <DropdownMenuItem
                className="hover:bg-gray-700 cursor-pointer"
                onClick={() => handleExportReport("pdf")}
              >
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-gray-700 cursor-pointer"
                onClick={() => handleExportReport("csv")}
              >
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-gray-700 cursor-pointer"
                onClick={() => handleExportReport("excel")}
              >
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ReportSummaryCard
          title="Total Invoices"
          value={`$${total.toFixed(2)}`}
          subtitle={`For ${format(startDate, "MMMM yyyy")}`}
          icon={<FileText className="h-5 w-5 text-white" />}
          color="bg-indigo-800"
        />
        <ReportSummaryCard
          title="Paid Amount"
          value={`$${paid.toFixed(2)}`}
          subtitle="Collected payments"
          icon={<CreditCard className="h-5 w-5 text-white" />}
          color="bg-green-800"
        />
        <ReportSummaryCard
          title="Outstanding Amount"
          value={`$${pending.toFixed(2)}`}
          subtitle="Pending payments"
          icon={<Truck className="h-5 w-5 text-white" />}
          color="bg-red-800"
        />
      </div>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger
            value="monthly"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400 hover:text-gray-300"
          >
            <Truck className="h-4 w-4 mr-2" />
            Monthly Vehicle Statements
          </TabsTrigger>
          <TabsTrigger
            value="sales"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400 hover:text-gray-300"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Sales Summary
          </TabsTrigger>
        </TabsList>

        {/* Monthly Statements */}
        <TabsContent value="monthly" className="pt-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-white">
                Monthly Vehicle Statements - {format(startDate, "MMMM yyyy")}
              </h2>
              <Button
                onClick={handleGenerateMonthlyStatements}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Statements
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" text="Loading statements..." />
              </div>
            ) : (
              <MonthlyVehicleStatements
                statements={vehicleStatements}
                onViewDetails={handleViewStatementDetails}
                onGenerateInvoice={handleGenerateInvoice}
                onSendInvoice={handleSendInvoice}
              />
            )}

            <div className="mt-4 p-4 bg-gray-750 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-2">
                About Monthly Vehicle Statements
              </h3>
              <p className="text-sm text-gray-400">
                Monthly statements for vehicle gas sales are automatically
                generated at the end of each month. You can use this report to
                view, print and send invoices to your customers. All
                weight-based sales for registered vehicles are consolidated into
                a single monthly invoice.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Sales Summary */}
        <TabsContent value="sales" className="pt-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-white">
                Sales Summary - {format(startDate, "MMMM yyyy")}
              </h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-gray-700 bg-gray-800 text-gray-300 hover:text-gray-200 hover:bg-gray-700"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-gray-800 border-gray-700 text-gray-300"
                >
                  <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">
                    All Transactions
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">
                    Cylinder Sales Only
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">
                    Weight Sales Only
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">
                    Paid Transactions
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">
                    Outstanding Balances
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" text="Loading sales data..." />
              </div>
            ) : (
              <SalesSummaryTable salesData={salesSummary} />
            )}

            {/* Sales Charts would go here in a real app */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-indigo-500 opacity-50 mb-2" />
                  <p className="text-gray-400">Sales by Type Chart</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Visual representation would appear here
                  </p>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 h-64 flex items-center justify-center">
                <div className="text-center">
                  <Package className="h-12 w-12 mx-auto text-indigo-500 opacity-50 mb-2" />
                  <p className="text-gray-400">Cylinder Movement Chart</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Visual representation would appear here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Statement Detail Modal */}
      {selectedStatement && (
        <StatementDetailModal
          statement={selectedStatement}
          onClose={() => setSelectedStatement(null)}
        />
      )}
    </div>
  );
};

export default Reports;
