import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Import shadcn components
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";

// Import icons
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Truck,
  BarChart3,
  Settings,
  X,
} from "lucide-react";

const navItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    name: "Customers",
    path: "/customers",
    icon: <Users className="h-5 w-5" />,
  },
  { name: "Sales", path: "/sales", icon: <ShoppingCart className="h-5 w-5" /> },
  { name: "Vehicles", path: "/vehicles", icon: <Truck className="h-5 w-5" /> },
  {
    name: "Reports",
    path: "/reports",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

// Mobile Sidebar using Sheet component
const MobileSidebar = ({
  isMobileOpen,
  toggleMobileSidebar,
  closeMobileSidebar,
}) => {
  const location = useLocation();

  return (
    <Sheet open={isMobileOpen} onOpenChange={toggleMobileSidebar}>
      <SheetContent
        side="left"
        className="w-64 p-0 bg-gray-900 border-gray-800"
      >
        <SheetHeader className="p-4 text-left border-b border-gray-800">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-indigo-400">
              Gas Sales
            </SheetTitle>
            <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <X className="h-4 w-4 text-gray-400" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
          <SheetDescription className="text-gray-400 text-sm">
            Manage your gas sales and inventory
          </SheetDescription>
        </SheetHeader>
        <div className="flex h-full flex-col">
          <nav className="flex-1 space-y-1 p-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileSidebar}
                className={cn(
                  "flex items-center rounded-md px-3 py-2.5 text-sm font-medium",
                  location.pathname === item.path
                    ? "bg-indigo-700 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-indigo-400"
                )}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Desktop Sidebar
const DesktopSidebar = ({ isOpen }) => {
  const location = useLocation();

  return (
    <motion.div
      initial={{ width: isOpen ? 240 : 64 }}
      animate={{ width: isOpen ? 240 : 64 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden h-full border-r border-gray-800 bg-gray-900 md:block"
    >
      <div className="flex h-full flex-col">
        <div
          className={cn(
            "flex h-14 items-center border-b border-gray-800 px-4",
            isOpen ? "justify-between" : "justify-center"
          )}
        >
          {isOpen ? (
            <h2 className="text-xl font-bold text-indigo-400">Gas Sales</h2>
          ) : (
            <span className="text-xl font-bold text-indigo-400">GS</span>
          )}
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center rounded-md px-3 py-2.5 text-sm font-medium",
                location.pathname === item.path
                  ? "bg-indigo-700 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-indigo-400",
                !isOpen && "justify-center"
              )}
              title={!isOpen ? item.name : undefined}
            >
              <span>{item.icon}</span>
              {isOpen && <span className="ml-3">{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </motion.div>
  );
};

// Combined Sidebar component
const Sidebar = ({
  isOpen,
  isMobileOpen,
  toggleSidebar,
  toggleMobileSidebar,
  closeMobileSidebar,
}) => {
  return (
    <>
      <MobileSidebar
        isMobileOpen={isMobileOpen}
        toggleMobileSidebar={toggleMobileSidebar}
        closeMobileSidebar={closeMobileSidebar}
      />
      <DesktopSidebar isOpen={isOpen} />
    </>
  );
};

export default Sidebar;
