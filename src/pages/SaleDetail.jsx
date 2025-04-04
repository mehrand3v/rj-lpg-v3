// src/pages/SaleDetail.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSaleById, deleteSale } from '@/services/salesService';
import { getCustomerById } from '@/services/customerService';
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
import {
  ArrowLeft,
  Edit,
  Trash,
  Package,
  Scale,
  CreditCard,
  Truck,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const SaleDetail = () => {
  const [sale, setSale] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  
  // Load sale data
  useEffect(() => {
    const loadSale = async () => {
      try {
        setLoading(true);
        
        // Get sale details
        const saleData = await getSaleById(id);
        if (!saleData) {
          notification.error('Sale not found');
          navigate('/sales');
          return;
        }
        
        setSale(saleData);
        
        // Get customer details
        const customerData = await getCustomerById(saleData.customerId);
        setCustomer(customerData);
        
        setLoading(false);
      } catch (error) {
        notification.error('Failed to load sale data');
        console.error('Error loading sale:', error);
        setLoading(false);
      }
    };
    
    loadSale();
  }, [id]);
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  // Handle sale deletion
  const handleDeleteSale = async () => {
    try {
      setDeleting(true);
      await deleteSale(id);
      notification.success('Sale deleted successfully');
      navigate('/sales');
    } catch (error) {
      notification.error(`Failed to delete sale: ${error.message}`);
      console.error('Error deleting sale:', error);
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Render not found
  if (!sale) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sale Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The sale transaction you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/sales')}>
          Back to Sales
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
            onClick={() => navigate('/sales')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Sale Details</h1>
          <Badge 
            variant={sale.status === 'completed' ? 'default' : 'secondary'}
            className="ml-2"
          >
            {sale.status}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/sales/edit/${id}`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={() => setDeleteDialogOpen(true)}
            className="gap-2"
          >
            <Trash className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      
      {/* Sale information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Sale Information</CardTitle>
            <CardDescription>Sale ID: {sale.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p>{formatDate(sale.date)}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <div className="flex items-center gap-2">
                {sale.type === 'cylinder' ? (
                  <Package className="h-4 w-4 text-blue-500" />
                ) : (
                  <Scale className="h-4 w-4 text-purple-500" />
                )}
                <span className="capitalize">{sale.type}</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Payment Type</p>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="capitalize">{sale.paymentType}</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge 
                variant={sale.status === 'completed' ? 'default' : 'secondary'}
              >
                {sale.status}
              </Badge>
            </div>
            
            {sale.type === 'weight' && sale.vehicleId && (
              <div>
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>{sale.vehicleRegistration || sale.vehicleId}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sale Details</CardTitle>
            {customer && (
              <CardDescription>
                Customer: <span className="font-medium">{customer.name}</span>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sale.type === 'cylinder' ? (
                <>
                  <div className="bg-secondary p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Cylinders Delivered</p>
                    <p className="text-xl font-bold">{sale.cylindersDelivered}</p>
                  </div>
                  
                  <div className="bg-secondary p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Rate per Cylinder</p>
                    <p className="text-xl font-bold">${sale.rate?.toFixed(2)}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-secondary p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <p className="text-xl font-bold">{sale.weight?.toFixed(2)} kg</p>
                  </div>
                  
                  <div className="bg-secondary p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Rate per kg</p>
                    <p className="text-xl font-bold">${sale.rate?.toFixed(2)}</p>
                  </div>
                </>
              )}
              
              <div className="bg-secondary p-4 rounded-lg sm:col-span-2">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">${sale.amount?.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/customers/${sale.customerId}`)}
              >
                View Customer
              </Button>
              
              {sale.paymentType === 'credit' && (
                <Button 
                  onClick={() => navigate(`/payments/new?customer=${sale.customerId}&sale=${sale.id}`)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Record Payment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Delete confirmation dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full border border-border">
            <h3 className="text-xl font-bold mb-4">Delete Sale</h3>
            <p className="mb-6">
              Are you sure you want to delete this sale transaction?
              This action cannot be undone and will affect customer balances and cylinder tracking.
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteSale}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Sale'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleDetail;