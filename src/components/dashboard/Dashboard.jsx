// src/components/dashboard/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCustomers } from '@/services/customerService';
import { getAllSales } from '@/services/salesService';
import { getAllPayments } from '@/services/paymentService';
import { getCustomersWithOutstandingCylinders } from '@/services/cylinderService';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Users,
  ShoppingCart,
  Package,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { DashboardActions } from '@/components/layout/DashboardActions';
import CustomerBalances from './CustomerBalances';
import CylinderStatus from './CylinderStatus';
import RecentSales from './RecentSales';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalSales: 0,
    totalRevenue: 0,
    outstandingBalance: 0,
    outstandingCylinders: 0,
    recentSales: [],
    customersWithBalance: [],
    customersWithCylinders: [],
  });
  
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load all required data in parallel
        const [customers, sales, payments, customersWithCylinders] = await Promise.all([
          getAllCustomers(false),
          getAllSales(),
          getAllPayments(),
          getCustomersWithOutstandingCylinders()
        ]);
        
        // Calculate statistics with proper safety checks
        const totalRevenue = sales.reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0);
        const totalPayments = payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
        const outstandingBalance = totalRevenue - totalPayments;
        
        // Get customers with outstanding balance
        const customersWithBalance = customers
          .filter(customer => customer.outstandingBalance > 0)
          .sort((a, b) => b.outstandingBalance - a.outstandingBalance);
        
        // Calculate total outstanding cylinders
        const outstandingCylinders = customersWithCylinders.reduce(
          (sum, customer) => sum + (Number(customer.cylindersOutstanding) || 0), 0
        );
        
        // Get recent sales (last 5)
        const recentSales = sales.slice(0, 5);
        
        // Update stats
        setStats({
          totalCustomers: customers.length,
          totalSales: sales.length,
          totalRevenue,
          outstandingBalance,
          outstandingCylinders,
          recentSales,
          customersWithBalance,
          customersWithCylinders
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);
  
  // Format currency with safety check
  const formatCurrency = (amount) => {
    // Ensure amount is a valid number
    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(validAmount);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Quick Actions */}
      <DashboardActions />
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900">
              <Users className="h-6 w-6 text-blue-700 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <h3 className="text-2xl font-bold">{stats.totalCustomers}</h3>
              <Button
                variant="link"
                className="p-0 h-auto text-sm text-blue-600 dark:text-blue-400"
                onClick={() => navigate('/customers')}
              >
                View all customers
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="rounded-full p-3 bg-green-100 dark:bg-green-900">
              <TrendingUp className="h-6 w-6 text-green-700 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <h3 className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</h3>
              <p className="text-sm text-muted-foreground">
                From {stats.totalSales} sales
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="rounded-full p-3 bg-red-100 dark:bg-red-900">
              <CreditCard className="h-6 w-6 text-red-700 dark:text-red-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding Balance</p>
              <h3 className="text-2xl font-bold">{formatCurrency(stats.outstandingBalance)}</h3>
              <Button
                variant="link"
                className="p-0 h-auto text-sm text-red-600 dark:text-red-400"
                onClick={() => navigate('/payments')}
              >
                View payments
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="rounded-full p-3 bg-amber-100 dark:bg-amber-900">
              <Package className="h-6 w-6 text-amber-700 dark:text-amber-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cylinders Out</p>
              <h3 className="text-2xl font-bold">{stats.outstandingCylinders}</h3>
              <Button
                variant="link"
                className="p-0 h-auto text-sm text-amber-600 dark:text-amber-400"
                onClick={() => navigate('/cylinders')}
              >
                View cylinder tracking
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Alert for customers with overdue balances */}
      {stats.customersWithBalance.length > 0 && (
        <Card className="border-red-300 dark:border-red-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Outstanding Balances
            </CardTitle>
            <CardDescription>
              {stats.customersWithBalance.length} customers have outstanding balances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stats.customersWithBalance.slice(0, 3).map(customer => (
                <li key={customer.id} className="flex justify-between">
                  <Button
                    variant="link"
                    className="p-0 h-auto text-foreground"
                    onClick={() => navigate(`/customers/${customer.id}`)}
                  >
                    {customer.name}
                  </Button>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {formatCurrency(customer.outstandingBalance)}
                  </span>
                </li>
              ))}
            </ul>
            
            {stats.customersWithBalance.length > 3 && (
              <Button
                variant="link"
                className="mt-2 p-0 h-auto"
                onClick={() => navigate('/reports/outstanding-balances')}
              >
                View all {stats.customersWithBalance.length} customers with balances
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Data Visualization Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerBalances customers={stats.customersWithBalance.slice(0, 10)} />
        <CylinderStatus customers={stats.customersWithCylinders.slice(0, 10)} />
      </div>
      
      {/* Recent Sales */}
      <RecentSales sales={stats.recentSales} />
    </div>
  );
};

export default Dashboard;