// src/pages/Vehicles.jsx
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
  Truck,
  User,
  Ban,
  CreditCard,
  ShieldCheck,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import services
import { getDocuments, deleteDocument } from "@/services/db";
import { logPageView } from "@/services/analytics";

const VehicleCard = ({ vehicle, onEdit, onDelete }) => {
  const {
    id,
    registrationNumber,
    customerName,
    vehicleType,
    vehicleModel,
    totalAmountDue,
    totalPaid,
    currentBalance,
    lastTransactionDate,
  } = vehicle;

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
                <h3 className="text-lg font-semibold text-white">
                  {registrationNumber}
                </h3>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center text-sm text-gray-400">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    {customerName}
                  </div>
                  {vehicleType && (
                    <div className="flex items-center text-sm text-gray-400">
                      <Truck className="h-4 w-4 mr-2 text-gray-500" />
                      {vehicleType} {vehicleModel ? `- ${vehicleModel}` : ""}
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
                  onClick={() => onDelete(id, registrationNumber)}
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h4 className="text-xs font-medium text-gray-400 uppercase mb-2">
              Balance
            </h4>
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-white">
                ${currentBalance?.toFixed(2) || "0.00"}
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs ${
                  (currentBalance || 0) > 0
                    ? "bg-red-900/30 text-red-400"
                    : "bg-green-900/30 text-green-400"
                }`}
              >
                {(currentBalance || 0) > 0 ? "Outstanding" : "Clear"}
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-400">
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

const VehiclesList = ({ vehicles, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

const VehiclesTable = ({ vehicles, onEdit, onDelete }) => {
  return (
    <div className="rounded-md border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-850">
          <TableRow className="hover:bg-gray-800 border-gray-800">
            <TableHead className="text-gray-400 font-medium">
              Registration
            </TableHead>
            <TableHead className="text-gray-400 font-medium">
              Customer
            </TableHead>
            <TableHead className="text-gray-400 font-medium">Type</TableHead>
            <TableHead className="text-gray-400 font-medium text-right">
              Balance
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
          {vehicles.map((vehicle) => (
            <TableRow
              key={vehicle.id}
              className="hover:bg-gray-750 border-gray-800"
            >
              <TableCell className="font-medium text-gray-200">
                {vehicle.registrationNumber}
              </TableCell>
              <TableCell className="text-gray-300">
                {vehicle.customerName}
              </TableCell>
              <TableCell className="text-gray-300">
                {vehicle.vehicleType}{" "}
                {vehicle.vehicleModel ? `- ${vehicle.vehicleModel}` : ""}
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={`font-medium ${
                    vehicle.currentBalance > 0
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  ${vehicle.currentBalance?.toFixed(2) || "0.00"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    vehicle.isActive === false
                      ? "bg-red-900/30 text-red-400"
                      : vehicle.currentBalance > 0
                      ? "bg-yellow-900/30 text-yellow-400"
                      : "bg-green-900/30 text-green-400"
                  }`}
                >
                  {vehicle.isActive === false
                    ? "Inactive"
                    : vehicle.currentBalance > 0
                    ? "Outstanding"
                    : "Active"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                    onClick={() => onEdit(vehicle.id)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-red-900"
                    onClick={() =>
                      onDelete(vehicle.id, vehicle.registrationNumber)
                    }
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

const Vehicles = () => {
  const navigate = useNavigate();
  const { showNotification } = useOutletContext();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    // Log page view
    logPageView("Vehicles");

    fetchVehicles();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [searchQuery, activeFilter, vehicles]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      // In a real app, fetch from Firestore
      // For this demo, we'll create sample data
      const sampleVehicles = [
        {
          id: "v1",
          registrationNumber: "ABC123",
          customerId: "c2",
          customerName: "Sarah Johnson",
          vehicleType: "Truck",
          vehicleModel: "Small",
          totalAmountDue: 150,
          totalPaid: 100,
          currentBalance: 50,
          isActive: true,
          lastTransactionDate: { toDate: () => new Date(2023, 2, 20) },
        },
        {
          id: "v2",
          registrationNumber: "XYZ789",
          customerId: "c3",
          customerName: "XYZ Company",
          vehicleType: "Truck",
          vehicleModel: "Large",
          totalAmountDue: 600,
          totalPaid: 600,
          currentBalance: 0,
          isActive: true,
          lastTransactionDate: { toDate: () => new Date(2023, 3, 5) },
        },
        {
          id: "v3",
          registrationNumber: "DEF456",
          customerId: "c1",
          customerName: "John Smith",
          vehicleType: "Van",
          vehicleModel: "Medium",
          totalAmountDue: 300,
          totalPaid: 300,
          currentBalance: 0,
          isActive: false,
          lastTransactionDate: { toDate: () => new Date(2023, 1, 15) },
        },
      ];

      setVehicles(sampleVehicles);
      setFilteredVehicles(sampleVehicles);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      showNotification("Failed to load vehicles", "error");
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    let result = [...vehicles];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (vehicle) =>
          vehicle.registrationNumber?.toLowerCase().includes(query) ||
          vehicle.customerName?.toLowerCase().includes(query) ||
          vehicle.vehicleType?.toLowerCase().includes(query) ||
          vehicle.vehicleModel?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (activeFilter === "withBalance") {
      result = result.filter((vehicle) => (vehicle.currentBalance || 0) > 0);
    } else if (activeFilter === "active") {
      result = result.filter((vehicle) => vehicle.isActive !== false);
    } else if (activeFilter === "inactive") {
      result = result.filter((vehicle) => vehicle.isActive === false);
    }

    setFilteredVehicles(result);
  };

  const handleEditVehicle = (id) => {
    navigate(`/vehicles/${id}`);
  };

  const handleDeleteVehicle = async (id, registrationNumber) => {
    if (
      window.confirm(
        `Are you sure you want to delete vehicle ${registrationNumber}?`
      )
    ) {
      try {
        await deleteDocument("vehicles", id);
        setVehicles(vehicles.filter((vehicle) => vehicle.id !== id));
        showNotification(
          `Vehicle "${registrationNumber}" deleted successfully`,
          "success"
        );
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        showNotification("Failed to delete vehicle", "error");
      }
    }
  };

  const handleAddVehicle = () => {
    navigate("/vehicles/new");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Vehicles</h1>
          <p className="text-gray-400">
            Manage vehicles for weight-based gas sales
          </p>
        </div>
        <div>
          <Button
            onClick={handleAddVehicle}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search vehicles..."
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
                value="active"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400 hover:text-gray-300"
              >
                Active
              </TabsTrigger>
              <TabsTrigger
                value="withBalance"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400 hover:text-gray-300"
              >
                With Balance
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
                className="hover:bg-gray-700 cursor-pointer"
              >
                Grid View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setViewMode("table")}
                className="hover:bg-gray-700 cursor-pointer"
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
          <div className="text-gray-400">Loading vehicles...</div>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="flex justify-center items-center h-64 bg-gray-800 rounded-lg border border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-300">
              No vehicles found
            </h3>
            <p className="text-gray-500 mt-1">
              Try adjusting your search or filters
            </p>
            <Button
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleAddVehicle}
            >
              Add Your First Vehicle
            </Button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <VehiclesList
          vehicles={filteredVehicles}
          onEdit={handleEditVehicle}
          onDelete={handleDeleteVehicle}
        />
      ) : (
        <VehiclesTable
          vehicles={filteredVehicles}
          onEdit={handleEditVehicle}
          onDelete={handleDeleteVehicle}
        />
      )}

      {/* Summary Cards */}
      {!loading && filteredVehicles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="bg-gray-800 border-gray-700 shadow-md">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-white">
                    Total Vehicles
                  </h3>
                  <p className="text-3xl font-bold text-indigo-400 mt-1">
                    {vehicles.length}
                  </p>
                </div>
                <div className="rounded-full bg-indigo-900/30 p-3 text-indigo-400">
                  <Truck className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 shadow-md">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-white">
                    Active Vehicles
                  </h3>
                  <p className="text-3xl font-bold text-green-400 mt-1">
                    {vehicles.filter((v) => v.isActive !== false).length}
                  </p>
                </div>
                <div className="rounded-full bg-green-900/30 p-3 text-green-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 shadow-md">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-white">
                    Outstanding Balance
                  </h3>
                  <p className="text-3xl font-bold text-red-400 mt-1">
                    $
                    {vehicles
                      .reduce((sum, v) => sum + (v.currentBalance || 0), 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div className="rounded-full bg-red-900/30 p-3 text-red-400">
                  <CreditCard className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
