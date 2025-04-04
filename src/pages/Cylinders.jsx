// src/pages/Cylinders.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCustomersWithOutstandingCylinders } from '@/services/cylinderService';
import { useNotification } from '@/components/shared/NotificationSystem';
import { Button } from '@/components/ui/button'; // Will be added via shadcn CLI
import { Input } from '@/components/ui/input'; // Will be added via shadcn CLI
import { Badge } from '@/components/ui/badge'; // Will be added via shadcn CLI
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'; // Will be added via shadcn CLI
import { 
  Package, 
  Plus, 
  Search, 
  RefreshCw
} from 'lucide-react';

const Cylinders = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const notification = useNotification();
  
  // Load customers with outstanding cylinders
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const data = await getCustomersWithOutstandingCylinders();
        setCustomers(data);
        setFilteredCustomers(data);
        setLoading(false);
      } catch (error) {
        notification.error('Failed to load cylinder data');
        console.error('Error loading cylinders:', error);
        setLoading(false);
      }
    };
    
    loadCustomers();
  }, []);
  
  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredCustomers(customers);
      return;
    }
    
    const filtered = customers.filter(customer => 
      customer.name.toLowerCase().includes(term) ||
      (customer.phone && customer.phone.includes(term))
    );
    
    setFilteredCustomers(filtered);
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Cylinder Tracking</h1>
        
        <Button 
          onClick={() => navigate('/cylinders/returns')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Record Returns</span>
        </Button>
      </div>
      
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={handleSearch}
          className="pl-9"
        />
      </div>
      
      {filteredCustomers.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <p className="text-lg text-muted-foreground">No outstanding cylinders</p>
          <p className="text-muted-foreground mb-4">
            All cylinders have been returned by customers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(customer => (
            <Card key={customer.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <Link
                    to={`/customers/${customer.id}`}
                    className="text-primary hover:underline"
                  >
                    {customer.name}
                  </Link>
                  <Badge className="bg-amber-500 text-white">
                    {customer.cylindersOutstanding} cylinders
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {customer.phone || customer.email || 'No contact info'}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex justify-end">
                  <Button
                    onClick={() => navigate(`/cylinders/returns?customer=${customer.id}`)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Record Returns
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Total Cylinder Status</CardTitle>
          <CardDescription>
            Current status of all cylinders in circulation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Outstanding Cylinders</p>
              <p className="text-2xl font-bold text-amber-500">
                {customers.reduce((total, customer) => total + customer.cylindersOutstanding, 0)}
              </p>
            </div>
            
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Customers with Cylinders</p>
              <p className="text-2xl font-bold">
                {customers.length}
              </p>
            </div>
            
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Average per Customer</p>
              <p className="text-2xl font-bold">
                {customers.length > 0
                  ? (customers.reduce((total, customer) => total + customer.cylindersOutstanding, 0) / customers.length).toFixed(1)
                  : '0.0'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cylinders;