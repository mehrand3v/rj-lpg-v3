// components/shared/Sidebar.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";

const routes = [
  {
    name: "Dashboard",
    path: "/",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    name: "Customers",
    path: "/customers",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    name: "Sales",
    path: "/sales",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

const SidebarItem = ({ icon, name, path, isMobile = false, onItemClick }) => {
  const handleClick = (e) => {
    // Only call onItemClick if it exists
    if (onItemClick && typeof onItemClick === "function") {
      // Add a small delay to let the navigation happen first
      setTimeout(() => {
        onItemClick();
      }, 100);
    }
  };

  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground",
          isMobile && "w-full"
        )
      }
      onClick={handleClick}
    >
      {icon}
      <span>{name}</span>
    </NavLink>
  );
};

export const Sidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="lg:hidden fixed z-40 left-0 top-0 p-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 text-foreground"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="flex h-full flex-col bg-background">
              <div className="px-6 py-4 border-b border-border">
                <SheetTitle className="text-lg font-semibold tracking-tight text-foreground">
                  MyApp
                </SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  Navigation
                </SheetDescription>
              </div>
              <ScrollArea className="flex-1 px-3 py-2">
                <div className="flex flex-col gap-1">
                  {routes.map((route) => (
                    <SidebarItem
                      key={route.path}
                      {...route}
                      isMobile={true}
                      onItemClick={() => setOpen(false)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen w-64 flex-col border-r border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            MyApp
          </h2>
          <p className="text-sm text-muted-foreground">Navigation</p>
        </div>
        <ScrollArea className="flex-1 px-3 py-2">
          <div className="flex flex-col gap-1">
            {routes.map((route) => (
              <SidebarItem key={route.path} {...route} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};
