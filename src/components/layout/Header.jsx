// src/components/layout/Header.jsx
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ModeToggle';
import { LogOut, User } from 'lucide-react';

export const Header = () => {
  const { currentUser, userProfile, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-foreground">Gas Sales Management</h1>
      </div>
      
      {currentUser && (
        <div className="flex items-center gap-4">
          {/* Add ModeToggle here */}
          <ModeToggle />
          
          <div className="hidden md:flex flex-col items-end">
            {/* <p className="text-sm font-medium text-foreground">{userProfile?.name || currentUser.email}</p> */}
            <p className="text-xs text-muted-foreground">{userProfile?.role || 'Rana Jehanzeb'}</p>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      )}
    </header>
  );
};