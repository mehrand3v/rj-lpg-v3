// src/components/customers/CustomerDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getCustomerById, 
  getVehiclesForCustomer, 
  deleteCustomer,
  updateCustomer 
} from '@/services/customerService';
import { useNotification } from '@/components/shared/NotificationSystem';
import { Button } from '@/components/ui/button'; // Will be added via shadcn CLI
import { Badge } from '@/components/ui/badge';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'; // Will be added via shadcn CLI
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Will be added via shadcn CLI
import {
  ArrowLeft,
  Edit,
  Trash,
  Plus,
  ShoppingCart,
  Package,
  Truck,
  CreditCard,
  AlertCircle,
  UserX,
  User,
  FileText
} from 'lucide-react';
import VehicleList from './VehicleList';
import TransactionsList from '../sales/TransactionsList';

const CustomerDetail = () => {
  const [customer, setCustomer] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  
  // Load customer data
  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const customerData = await getCustomerById(id);
        if (!customerData) {
          notification.error('Customer not found');
          navigate('/customers');
          return;
        }
        
        setCustomer(customerData);
        
        // Load vehicles
        const vehiclesData = await getVehiclesForCustomer(id);
        setVehicles(vehiclesData);
        
        setLoading(false);
      } catch (error) {
        notification.error('Failed to load customer data');
        console.error('Error loading customer:', error);
        setLoading(false);
      }
    };
    
    loadCustomer();
  }, [id]);
  
  // Handle customer deletion
  const handleDeleteCustomer = async () => {
    try {
      await deleteCustomer(id);
      notification.success('Customer deleted successfully');
      navigate('/customers');
    } catch (error) {
      notification.error(`Failed to delete customer: ${error.message}`);
      console.error('Error deleting customer:', error);
    }
  };
  
  // Toggle customer status
  const toggleCustomerStatus = async () => {
    try {
      const newStatus = customer.status === 'active' ? 'inactive' : 'active';
      await updateCustomer(id, { status: newStatus });
      
      // Update local state
      setCustomer({ ...customer, status: newStatus });
      
      notification.success(`Customer marked as ${newStatus}`);
    } catch (error) {
      notification.error('Failed to update customer status');
      console.error('Error updating customer status:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading customer data...</p>
      </div>
    );
  }
  
  if (!customer) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Customer Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The customer you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/customers')}>
          Back to Customers
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with back button and actions */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/customers')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <Badge 
            variant={customer.status === 'active' ? 'default' : 'secondary'}
            className="ml-2"
          >
            {customer.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={toggleCustomerStatus}
            className="gap-2"
          >
            {customer.status === 'active' ? <UserX className="h-4 w-4" /> : <User className="h-4 w-4" />}
            {customer.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate(`/customers/edit/${id}`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={() => setDeleteDialogOpen(true)}
            className="gap-2"
            disabled={customer.outstandingBalance > 0 || customer.cylindersOutstanding > 0}
          >
            <Trash className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      
      {/* Customer information card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p>{customer.phone}</p>
              </div>
            )}
            
            {customer.email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{customer.email}</p>
              </div>
            )}
            
            {customer.address && (
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="whitespace-pre-line">{customer.address}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                <p className={`text-xl font-bold ${customer.outstandingBalance > 0 ? 'text-destructive' : 'text-green-500'}`}>
                  ${customer.outstandingBalance?.toFixed(2) || '0.00'}
                </p>
              </div>
              
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Cylinders Outstanding</p>
                <p className={`text-xl font-bold ${customer.cylindersOutstanding > 0 ? 'text-amber-500' : 'text-foreground'}`}>
                  {customer.cylindersOutstanding || 0}
                </p>
              </div>
              
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Vehicles</p>
                <p className="text-xl font-bold">
                  {vehicles.length}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => navigate(`/sales/new?customer=${id}`)}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <ShoppingCart className="h-4 w-4" />
                New Sale
              </Button>
              
              <Button 
                onClick={() => navigate(`/payments/new?customer=${id}`)}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <CreditCard className="h-4 w-4" />
                Record Payment
              </Button>
              
              <Button 
                onClick={() => navigate(`/cylinders/returns?customer=${id}`)}
                className="gap-2 bg-amber-600 hover:bg-amber-700"
                disabled={customer.cylindersOutstanding <= 0}
              >
                <Package className="h-4 w-4" />
                Record Cylinder Returns
              </Button>
              
              <Button 
                onClick={() => navigate(`/vehicles/new?customer=${id}`)}
                variant="outline"
                className="gap-2"
              >
                <Truck className="h-4 w-4" />
                Add Vehicle
              </Button>
              
              <Button 
                onClick={() => navigate(`/reports/invoice?customer=${id}`)}
                variant="outline"
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Generate Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for Vehicles and Transactions */}
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="mt-4">
          <TransactionsList customerId={id} />
        </TabsContent>
        
        <TabsContent value="vehicles" className="mt-4">
          <VehicleList customerId={id} vehicles={vehicles} refreshVehicles={async () => {
            const updatedVehicles = await getVehiclesForCustomer(id);
            setVehicles(updatedVehicles);
          }} />
        </TabsContent>
      </Tabs>
      
      {/* Delete confirmation dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full border border-border">
            <h3 className="text-xl font-bold mb-4">Delete Customer</h3>
            <p className="mb-6">
              Are you sure you want to delete <span className="font-bold">{customer.name}</span>?
              This action cannot be undone.
            </p>
            {(customer.outstandingBalance > 0 || customer.cylindersOutstanding > 0) && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
                <p className="text-sm font-medium">Cannot delete this customer because:</p>
                <ul className="list-disc text-sm ml-4 mt-1">
                  {customer.outstandingBalance > 0 && (
                    <li>Customer has an outstanding balance</li>
                  )}
                  {customer.cylindersOutstanding > 0 && (
                    <li>Customer has outstanding cylinders</li>
                  )}
                </ul>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteCustomer}
                disabled={customer.outstandingBalance > 0 || customer.cylindersOutstanding > 0}
              >
                Delete Customer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;