// components/shared/Header.jsx

import { useLocation } from "react-router-dom";
import { ModeToggle } from "@components/ModeToggle";
import { cn } from "@/lib/utils";

export const Header = ({ className }) => {
  const location = useLocation();

  // Get the current page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    if (path === "/customers") return "Customers";
    if (path === "/sales") return "Sales";
    return "Page Not Found";
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background px-4 lg:px-6",
        "pl-16 lg:pl-4", // Add left padding on mobile to accommodate menu button
        className
      )}
    >
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        {getPageTitle()}
      </h1>
      <ModeToggle />
    </header>
  );
};
