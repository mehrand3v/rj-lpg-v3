// src/pages/PaymentDetail.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getPaymentById, deletePayment } from '@/services/paymentService';
import { getCustomerById } from '@/services/customerService';
import { getSaleById } from '@/services/salesService';
import { useNotification } from '@/components/shared/NotificationSystem';
import { Button } from '@/components/ui/button'; // Will be added via shadcn CLI
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
  CreditCard,
  User,
  ShoppingCart,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const PaymentDetail = () => {
  const [payment, setPayment] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  
  // Load payment data
  useEffect(() => {
    const loadPayment = async () => {
      try {
        setLoading(true);
        
        // Get payment details
        const paymentData = await getPaymentById(id);
        if (!paymentData) {
          notification.error('Payment not found');
          navigate('/payments');
          return;
        }
        
        setPayment(paymentData);
        
        // Get customer details
        const customerData = await getCustomerById(paymentData.customerId);
        setCustomer(customerData);
        
        // Get sale details if payment is linked to a specific sale
        if (paymentData.saleId) {
          const saleData = await getSaleById(paymentData.saleId);
          setSale(saleData);
        }
        
        setLoading(false);
      } catch (error) {
        notification.error('Failed to load payment data');
        console.error('Error loading payment:', error);
        setLoading(false);
      }
    };
    
    loadPayment();
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
  
  // Handle payment deletion
  const handleDeletePayment = async () => {
    try {
      setDeleting(true);
      await deletePayment(id);
      notification.success('Payment deleted successfully');
      navigate('/payments');
    } catch (error) {
      notification.error(`Failed to delete payment: ${error.message}`);
      console.error('Error deleting payment:', error);
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
  if (!payment) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Payment Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The payment you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/payments')}>
          Back to Payments
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
            onClick={() => navigate('/payments')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Payment Details</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/payments/edit/${id}`)}
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
      
      {/* Payment information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
            <CardDescription>Receipt ID: {payment.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p>{formatDate(payment.date)}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-xl font-bold text-green-600">
                ${payment.amount?.toFixed(2)}
              </p>
            </div>
            
            {customer && (
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <Link
                    to={`/customers/${payment.customerId}`}
                    className="text-primary hover:underline"
                  >
                    {customer.name}
                  </Link>
                </div>
              </div>
            )}
            
            {sale && (
              <div>
                <p className="text-sm text-muted-foreground">Applied to Sale</p>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <Link
                    to={`/sales/${payment.saleId}`}
                    className="text-primary hover:underline"
                  >
                    {payment.saleId} (${sale.amount?.toFixed(2)})
                  </Link>
                </div>
              </div>
            )}
            
            {payment.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="whitespace-pre-wrap">{payment.notes}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => navigate(`/customers/${payment.customerId}`)}
            >
              View Customer
            </Button>
          </CardFooter>
        </Card>
        
        {customer && (
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{customer.name}</p>
              </div>
              
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
              
              <div>
                <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                <p className={customer.outstandingBalance > 0 ? 'text-destructive font-medium' : 'text-green-600 font-medium'}>
                  ${customer.outstandingBalance?.toFixed(2) || '0.00'}
                </p>
              </div>
              
              {customer.cylindersOutstanding > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Cylinders Outstanding</p>
                  <p className="text-amber-600 font-medium">
                    {customer.cylindersOutstanding}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full border border-border">
            <h3 className="text-xl font-bold mb-4">Delete Payment</h3>
            <p className="mb-6">
              Are you sure you want to delete this payment of <span className="font-bold">${payment.amount?.toFixed(2)}</span>?
              This action cannot be undone and will affect customer balances.
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
                onClick={handleDeletePayment}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Payment'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDetail;