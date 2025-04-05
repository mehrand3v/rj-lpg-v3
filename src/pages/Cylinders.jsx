// src/pages/Cylinders.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCustomersWithOutstandingCylinders, getCylinderTracking } from '@/services/cylinderService';
import { useNotification } from '@/components/shared/NotificationSystem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  Package, 
  Plus, 
  Search, 
  RefreshCw,
  User,
  InfoIcon
} from 'lucide-react';

// Import the cylinder return history component
import CylinderReturnHistory from '@/components/cylinders/CylinderReturnHistory';

const Cylinders = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [customerTracking, setCustomerTracking] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
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
  
  // Handle selecting a customer
  const handleSelectCustomer = async (customerId, customerName) => {
    setSelectedCustomerId(customerId);
    setSelectedCustomerName(customerName);
    setActiveTab('history');
    
    try {
      // Get detailed cylinder tracking for the selected customer
      const tracking = await getCylinderTracking(customerId);
      setCustomerTracking(tracking);
    } catch (error) {
      console.error('Error loading customer tracking:', error);
      notification.error('Failed to load detailed cylinder tracking');
    }
  };
  
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Customer Overview
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="flex items-center gap-2"
            disabled={!selectedCustomerId}
          >
            <User className="h-4 w-4" />
            Return History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
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
            <div className="bg-card rounded-lg border border-border p-8 text-center mt-4">
              <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
              <p className="text-lg text-muted-foreground">No outstanding cylinders</p>
              <p className="text-muted-foreground mb-4">
                All cylinders have been returned by customers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {filteredCustomers.map(customer => (
                <Card key={customer.id} className="hover:border-primary cursor-pointer transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                      <Link
                        to={`/customers/${customer.id}`}
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
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
                  
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleSelectCustomer(customer.id, customer.name)}
                      >
                        <InfoIcon className="h-4 w-4" />
                        View History
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/cylinders/returns?customer=${customer.id}`);
                        }}
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
          
          <Card className="mt-6">
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
        </TabsContent>
        
        <TabsContent value="history" className="mt-0">
          {selectedCustomerId ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">{selectedCustomerName}</h2>
                  <p className="text-muted-foreground text-sm">Cylinder tracking details</p>
                </div>
                <Button
                  onClick={() => navigate(`/cylinders/returns?customer=${selectedCustomerId}`)}
                  size="sm"
                  className="gap-2"
                >
                  <Package className="h-4 w-4" />
                  Record Returns
                </Button>
              </div>
              
              {customerTracking && (
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>Cylinder Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-secondary p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Delivered</p>
                        <p className="text-2xl font-bold">
                          {customerTracking.cylindersDelivered || 0}
                        </p>
                      </div>
                      
                      <div className="bg-secondary p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Returned</p>
                        <p className="text-2xl font-bold text-green-500">
                          {customerTracking.cylindersReturned || 0}
                        </p>
                      </div>
                      
                      <div className="bg-secondary p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Currently Outstanding</p>
                        <p className="text-2xl font-bold text-amber-500">
                          {customerTracking.cylindersOutstanding || 0}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Last Update</p>
                      <p className="text-base">
                        {customerTracking.lastUpdate ? new Date(customerTracking.lastUpdate.seconds * 1000).toLocaleString() : 'Never'}
                      </p>
                      {customerTracking.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">Notes</p>
                          <p className="text-base">{customerTracking.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <CylinderReturnHistory 
                customerId={selectedCustomerId}
                customerName={selectedCustomerName}
              />
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
              <p className="text-lg text-muted-foreground">No customer selected</p>
              <p className="text-muted-foreground mb-4">
                Please select a customer from the overview tab to view their return history.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('overview')}
              >
                Go to Overview
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Cylinders;