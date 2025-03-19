import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, Bell, User, ChevronDown, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

// Import shadcn components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const Header = ({ title, toggleMobileSidebar }) => {
  const navigate = useNavigate();

  return (
    <header className="border-b border-gray-800 bg-gray-900">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileSidebar}
            className="mr-4 rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-gray-200 md:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </button>

          <motion.h1
            className="text-xl font-bold text-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            key={title}
          >
            {title}
          </motion.h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Action Buttons Area */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/customers/new")}
              className="border-indigo-600 bg-transparent text-indigo-400 hover:bg-indigo-700 hover:text-white"
            >
              Add Customer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/vehicles/new")}
              className="border-indigo-600 bg-transparent text-indigo-400 hover:bg-indigo-700 hover:text-white"
            >
              Add Vehicle
            </Button>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-gray-900 text-gray-300 border-gray-800"
            >
              <div className="p-2 text-sm font-medium">Notifications</div>
              <DropdownMenuSeparator className="bg-gray-800" />
              <div className="max-h-80 overflow-y-auto">
                {/* Sample notifications */}
                {[1, 2, 3].map((i) => (
                  <DropdownMenuItem
                    key={i}
                    className="cursor-pointer p-3 hover:bg-gray-800"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0">
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            i === 1 ? "bg-indigo-500" : "bg-gray-600"
                          )}
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-200">
                          Customer payment received
                        </p>
                        <p className="text-xs text-gray-400">
                          John Smith paid $200 on their account
                        </p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem className="cursor-pointer justify-center p-2 text-center text-sm font-medium hover:bg-gray-800">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 hover:bg-gray-800"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-indigo-600 text-white">
                    GS
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium text-gray-300 md:inline-block">
                  Admin
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-900 text-gray-300 border-gray-800"
            >
              <DropdownMenuItem className="hover:bg-gray-800">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-800">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem className="hover:bg-gray-800">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
