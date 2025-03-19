// src/pages/Customers.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Filter,
  Trash,
  Edit,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

// Import components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import services
import { getDocuments, deleteDocument } from "@/services/db";
import { logPageView } from "@/services/analytics";

const CustomerCard = ({ customer, onEdit, onDelete }) => {
  const {
    id,
    name,
    contactNumber,
    email,
    address,
    totalAmountDue,
    totalPaid,
    currentBalance,
    totalCylindersBought,
    totalCylindersReturned,
    currentCylindersHeld,
  } = customer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gray-800 border-gray-800 shadow-md overflow-hidden hover:bg-gray-750 transition-colors duration-200">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-white">{name}</h3>
                <div className="mt-1 space-y-1">
                  {contactNumber && (
                    <div className="flex items-center text-sm text-gray-400">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {contactNumber}
                    </div>
                  )}
                  {email && (
                    <div className="flex items-center text-sm text-gray-400">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {email}
                    </div>
                  )}
                  {address && (
                    <div className="flex items-center text-sm text-gray-400">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      {address}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={() => onEdit(id)}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-red-900"
                  onClick={() => onDelete(id, name)}
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-700">
            <div className="p-4">
              <h4 className="text-xs font-medium text-gray-400 uppercase">
                Balance
              </h4>
              <div className="mt-1">
                <div className="text-xl font-bold text-white">
                  ${currentBalance?.toFixed(2) || "0.00"}
                </div>
                <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div>
                    <span className="text-gray-500">Total Due:</span>
                    <span className="ml-1 text-gray-300">
                      ${totalAmountDue?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Paid:</span>
                    <span className="ml-1 text-gray-300">
                      ${totalPaid?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-xs font-medium text-gray-400 uppercase">
                Cylinders
              </h4>
              <div className="mt-1">
                <div className="text-xl font-bold text-white">
                  {currentCylindersHeld || 0}
                </div>
                <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div>
                    <span className="text-gray-500">Bought:</span>
                    <span className="ml-1 text-gray-300">
                      {totalCylindersBought || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Returned:</span>
                    <span className="ml-1 text-gray-300">
                      {totalCylindersReturned || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-750 p-2 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-indigo-400 hover:text-indigo-300 hover:bg-gray-700"
              onClick={() => onEdit(id)}
            >
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CustomersList = ({ customers, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {customers.map((customer) => (
        <CustomerCard
          key={customer.id}
          customer={customer}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

const CustomersTable = ({ customers, onEdit, onDelete }) => {
  return (
    <div className="rounded-md border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-850">
          <TableRow className="hover:bg-gray-800 border-gray-800">
            <TableHead className="text-gray-400 font-medium">Name</TableHead>
            <TableHead className="text-gray-400 font-medium">Contact</TableHead>
            <TableHead className="text-gray-400 font-medium text-right">
              Balance
            </TableHead>
            <TableHead className="text-gray-400 font-medium text-right">
              Cylinders
            </TableHead>
            <TableHead className="text-gray-400 font-medium text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow
              key={customer.id}
              className="hover:bg-gray-750 border-gray-800"
            >
              <TableCell className="font-medium text-gray-200">
                {customer.name}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  {customer.contactNumber && (
                    <span className="text-gray-400 text-sm">
                      {customer.contactNumber}
                    </span>
                  )}
                  {customer.email && (
                    <span className="text-gray-500 text-xs">
                      {customer.email}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={`font-medium ${
                    customer.currentBalance > 0
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  ${customer.currentBalance?.toFixed(2) || "0.00"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="font-medium text-gray-300">
                  {customer.currentCylindersHeld || 0}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                    onClick={() => onEdit(customer.id)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-red-900"
                    onClick={() => onDelete(customer.id, customer.name)}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const Customers = () => {
  const navigate = useNavigate();
  const { showNotification } = useOutletContext();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    // Log page view
    logPageView("Customers");

    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchQuery, activeFilter, customers]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const fetchedCustomers = await getDocuments("customers");
      setCustomers(fetchedCustomers);
      setFilteredCustomers(fetchedCustomers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customers:", error);
      showNotification("Failed to load customers", "error");
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let result = [...customers];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (customer) =>
          customer.name?.toLowerCase().includes(query) ||
          customer.contactNumber?.toLowerCase().includes(query) ||
          customer.email?.toLowerCase().includes(query) ||
          customer.address?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (activeFilter === "withBalance") {
      result = result.filter((customer) => (customer.currentBalance || 0) > 0);
    } else if (activeFilter === "withCylinders") {
      result = result.filter(
        (customer) => (customer.currentCylindersHeld || 0) > 0
      );
    } else if (activeFilter === "inactive") {
      result = result.filter((customer) => customer.isActive === false);
    }

    setFilteredCustomers(result);
  };

  const handleEditCustomer = (id) => {
    navigate(`/customers/${id}`);
  };

  const handleDeleteCustomer = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteDocument("customers", id);
        setCustomers(customers.filter((customer) => customer.id !== id));
        showNotification(`Customer "${name}" deleted successfully`, "success");
      } catch (error) {
        console.error("Error deleting customer:", error);
        showNotification("Failed to delete customer", "error");
      }
    }
  };

  const handleAddCustomer = () => {
    navigate("/customers/new");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-gray-400">
            Manage your customer accounts and cylinders
          </p>
        </div>
        <div>
          <Button
            onClick={handleAddCustomer}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search customers..."
            className="pl-9 bg-gray-800 border-gray-700 text-gray-300 placeholder:text-gray-500 focus:border-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Tabs
            defaultValue="all"
            className="w-auto"
            onValueChange={setActiveFilter}
          >
            <TabsList className="bg-gray-800 border border-gray-700 h-10">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400 hover:text-gray-300"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="withBalance"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400 hover:text-gray-300"
              >
                With Balance
              </TabsTrigger>
              <TabsTrigger
                value="withCylinders"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400 hover:text-gray-300"
              >
                With Cylinders
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 border-gray-700 bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-800 border-gray-700 text-gray-300"
            >
              <DropdownMenuItem
                onClick={() => setViewMode("grid")}
                className="hover:bg-gray-700"
              >
                Grid View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setViewMode("table")}
                className="hover:bg-gray-700"
              >
                Table View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-400">Loading customers...</div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="flex justify-center items-center h-64 bg-gray-800 rounded-lg border border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-300">
              No customers found
            </h3>
            <p className="text-gray-500 mt-1">
              Try adjusting your search or filters
            </p>
            <Button
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleAddCustomer}
            >
              Add Your First Customer
            </Button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <CustomersList
          customers={filteredCustomers}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteCustomer}
        />
      ) : (
        <CustomersTable
          customers={filteredCustomers}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteCustomer}
        />
      )}
    </div>
  );
};

export default Customers;
