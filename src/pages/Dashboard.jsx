import React from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  CreditCard,
  Truck,
  Calendar,
  ArrowUpRight,
} from "lucide-react";

// Dashboard widget component
const DashboardWidget = ({ title, value, icon, trend, bgColor, textColor }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`rounded-lg ${bgColor} p-4 shadow-md`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className={`text-sm font-medium ${textColor}`}>{title}</p>
        <h3 className="mt-1 text-2xl font-bold text-white">{value}</h3>
      </div>
      <div className={`rounded-full ${bgColor} p-2 text-white`}>{icon}</div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center">
        <div className="flex items-center rounded-full bg-green-900/30 px-2 py-1 text-xs font-medium text-green-400">
          <ArrowUpRight className="mr-1 h-3 w-3" />
          {trend}
        </div>
        <span className="ml-2 text-xs text-gray-400">vs last month</span>
      </div>
    )}
  </motion.div>
);

// Recent transactions component
const RecentTransactions = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.2 }}
    className="rounded-lg bg-gray-800 p-4 shadow-md"
  >
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
      <button className="text-sm text-indigo-400 hover:text-indigo-300">
        View All
      </button>
    </div>
    <div className="space-y-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="border-b border-gray-700 pb-3 last:border-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 h-9 w-9 rounded-full bg-indigo-900/30 p-2 text-indigo-400">
                {item % 2 === 0 ? (
                  <ShoppingBag className="h-5 w-5" />
                ) : (
                  <CreditCard className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-200">
                  {item % 2 === 0 ? "Gas Cylinders Sale" : "Payment Received"}
                </p>
                <p className="text-xs text-gray-400">
                  {item % 2 === 0 ? "John Smith" : "ABC123 Vehicle"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`font-medium ${
                  item % 2 === 0 ? "text-green-400" : "text-blue-400"
                }`}
              >
                {item % 2 === 0 ? "+$450.00" : "-$120.00"}
              </p>
              <p className="text-xs text-gray-400">Today, 2:30 PM</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

// Cylinders status component
const CylindersStatus = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.3 }}
    className="rounded-lg bg-gray-800 p-4 shadow-md"
  >
    <h3 className="mb-4 text-lg font-bold text-white">Cylinder Inventory</h3>
    <div className="space-y-3">
      {[
        { type: "Available", count: 120, color: "bg-green-500" },
        { type: "With Customers", count: 85, color: "bg-blue-500" },
        { type: "Scheduled Return", count: 32, color: "bg-yellow-500" },
        { type: "Damaged", count: 8, color: "bg-red-500" },
      ].map((item) => (
        <div key={item.type} className="flex items-center">
          <div className={`mr-2 h-3 w-3 rounded-full ${item.color}`}></div>
          <span className="text-sm text-gray-300">{item.type}</span>
          <div className="ml-auto font-medium text-white">{item.count}</div>
        </div>
      ))}
    </div>
    <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-gray-700">
      <div className="flex h-full">
        <div className="h-full w-[48%] bg-green-500"></div>
        <div className="h-full w-[34%] bg-blue-500"></div>
        <div className="h-full w-[12%] bg-yellow-500"></div>
        <div className="h-full w-[6%] bg-red-500"></div>
      </div>
    </div>
  </motion.div>
);

// Upcoming deliveries component
const UpcomingDeliveries = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.4 }}
    className="rounded-lg bg-gray-800 p-4 shadow-md"
  >
    <h3 className="mb-4 text-lg font-bold text-white">Upcoming Deliveries</h3>
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="rounded-md bg-gray-700/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-indigo-400" />
              <span className="text-sm font-medium text-gray-200">
                Today, {item + 1}:00 PM
              </span>
            </div>
            <span className="rounded-full bg-indigo-900/30 px-2 py-1 text-xs font-medium text-indigo-400">
              {item * 2 + 3} Cylinders
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Customer:{" "}
            {item === 1
              ? "John Smith"
              : item === 2
              ? "Sarah Johnson"
              : "XYZ Company"}
          </p>
          <p className="text-xs text-gray-500">
            Address:{" "}
            {item === 1
              ? "123 Main St"
              : item === 2
              ? "456 Oak Ave"
              : "789 Business Blvd"}
          </p>
        </div>
      ))}
    </div>
  </motion.div>
);

// Dashboard page
const Dashboard = () => {
  const { showNotification } = useOutletContext();

  const widgets = [
    {
      title: "Total Sales",
      value: "$12,540",
      icon: <TrendingUp className="h-5 w-5" />,
      trend: "+12.5%",
      bgColor: "bg-indigo-800",
      textColor: "text-indigo-300",
    },
    {
      title: "Active Customers",
      value: "124",
      icon: <Users className="h-5 w-5" />,
      trend: "+5.2%",
      bgColor: "bg-blue-800",
      textColor: "text-blue-300",
    },
    {
      title: "Cylinders Out",
      value: "85",
      icon: <ShoppingBag className="h-5 w-5" />,
      trend: "+3.1%",
      bgColor: "bg-green-800",
      textColor: "text-green-300",
    },
    {
      title: "Active Vehicles",
      value: "18",
      icon: <Truck className="h-5 w-5" />,
      trend: "+8.4%",
      bgColor: "bg-purple-800",
      textColor: "text-purple-300",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Welcome back, Admin</h2>
          <p className="text-gray-400">
            Here's what's happening with your gas business today.
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => showNotification("Sample notification", "info")}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Show Notification
          </button>
        </div>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {widgets.map((widget, index) => (
          <DashboardWidget key={index} {...widget} />
        ))}
      </div>

      {/* Dashboard content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        <div className="space-y-6">
          <CylindersStatus />
          <UpcomingDeliveries />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
