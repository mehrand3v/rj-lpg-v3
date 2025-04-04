// src/components/layout/Sidebar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Will be added via shadcn CLI
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  ShoppingCart,
  Package,
  CreditCard,
  FileText,
  Menu,
  X
} from 'lucide-react';

// Navigation items
const navItems = [
  { label: 'Dashboard', path: '/', icon: <Home className="h-5 w-5" /> },
  { label: 'Customers', path: '/customers', icon: <Users className="h-5 w-5" /> },
  { label: 'Sales', path: '/sales', icon: <ShoppingCart className="h-5 w-5" /> },
  { label: 'Cylinders', path: '/cylinders', icon: <Package className="h-5 w-5" /> },
  { label: 'Payments', path: '/payments', icon: <CreditCard className="h-5 w-5" /> },
  { label: 'Reports', path: '/reports', icon: <FileText className="h-5 w-5" /> },
];

// NavItem component
const NavItem = ({ label, path, icon }) => (
  <NavLink
    to={path}
    className={({ isActive }) => cn(
      'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
      isActive 
        ? 'bg-primary text-primary-foreground font-medium' 
        : 'text-foreground hover:bg-secondary'
    )}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-50 lg:hidden"
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>
      
      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Gas Sales</h2>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </nav>
        </div>
      </aside>
      
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 border-r border-border bg-card">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Gas Sales</h2>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </nav>
        </div>
      </aside>
      
      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}
    </>
  );
};