// src/components/dashboard/RecentSales.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCustomerById } from '@/services/customerService';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'; // Will be added via shadcn CLI
import { Button } from '@/components/ui/button'; // Will be added via shadcn CLI
import { Badge } from '@/components/ui/badge';
import { Package, Scale, RefreshCw } from 'lucide-react';

const RecentSales = ({ sales = [] }) => {
  const [salesWithCustomers, setSalesWithCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  
  // Load customer details for each sale
  useEffect(() => {
    const loadCustomerDetails = async () => {
      try {
        setLoading(true);
        
        const salesData = await Promise.all(
          sales.map(async (sale) => {
            if (sale && sale.customerId && typeof sale.customerId === 'string') {
              try {
                const customer = await getCustomerById(sale.customerId);
                return { ...sale, customer };
              } catch (error) {
                console.error(`Error loading customer ${sale.customerId}:`, error);
                // Return sale without customer data if there's an error
                return { ...sale, customer: null };
              }
            } else {
              // Handle case where customerId is not valid
              return { ...sale, customer: null };
            }
          })
        );
        
        setSalesWithCustomers(salesData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading customer details:', error);
        setLoading(false);
      }
    };
    
    if (sales.length > 0) {
      loadCustomerDetails();
    } else {
      setLoading(false);
    }
  }, [sales]);
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Render loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>Loading recent sales...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  // Render empty state
  if (sales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>No sales transactions yet</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-6">
          <p className="text-muted-foreground mb-4">
            Start recording your first sale to see it here.
          </p>
          <Button onClick={() => navigate('/sales/new')}>
            Record First Sale
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>Latest sales transactions</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/sales')}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {salesWithCustomers.map((sale) => (
            <div key={sale.id} className="flex items-center">
              <div className="rounded-full p-2 mr-4">
                {sale.type === 'cylinder' ? (
                  <Package className="h-5 w-5 text-blue-500" />
                ) : (
                  <Scale className="h-5 w-5 text-purple-500" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <Link 
                    to={`/customers/${sale.customerId}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {sale.customer?.name || 'Unknown Customer'}
                  </Link>
                  <span className="font-medium">
                    {formatCurrency(sale.amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex gap-2 items-center">
                    <Badge 
                      variant={sale.type === 'cylinder' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {sale.type}
                    </Badge>
                    <span>
                      {sale.type === 'cylinder' 
                        ? `${sale.cylindersDelivered} cylinders` 
                        : `${sale.weight?.toFixed(2)} kg`}
                    </span>
                  </div>
                  <span>{formatDate(sale.date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentSales;