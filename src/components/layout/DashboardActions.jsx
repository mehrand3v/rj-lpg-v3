// src/components/layout/DashboardActions.jsx
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Will be added via shadcn CLI
import { Plus, Users, ShoppingCart, CreditCard, Package } from 'lucide-react';

export const DashboardActions = () => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Button 
        onClick={() => navigate('/customers/new')}
        className="flex items-center gap-2 h-16 bg-primary hover:bg-primary/90"
      >
        <Users className="h-5 w-5" />
        <span>New Customer</span>
      </Button>
      
      <Button 
        onClick={() => navigate('/sales/new')}
        className="flex items-center gap-2 h-16 bg-blue-600 hover:bg-blue-700"
      >
        <ShoppingCart className="h-5 w-5" />
        <span>New Sale</span>
      </Button>
      
      <Button 
        onClick={() => navigate('/payments/new')}
        className="flex items-center gap-2 h-16 bg-green-600 hover:bg-green-700"
      >
        <CreditCard className="h-5 w-5" />
        <span>Record Payment</span>
      </Button>
      
      <Button 
        onClick={() => navigate('/cylinders/returns')}
        className="flex items-center gap-2 h-16 bg-amber-600 hover:bg-amber-700"
      >
        <Package className="h-5 w-5" />
        <span>Cylinder Returns</span>
      </Button>
    </div>
  );
};