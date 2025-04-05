// src/pages/PaymentDetail.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getPaymentById, deletePayment, getPaymentsForCustomer } from '@/services/paymentService';
import { getCustomerById } from '@/services/customerService';
import { getSaleById } from '@/services/salesService';
import { useNotification } from '@/components/shared/NotificationSystem';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ArrowLeft,
  Edit,
  Trash,
  CreditCard,
  User,
  ShoppingCart,
  AlertCircle,
  RefreshCw,
  Calendar,
  Clock,
  ArrowRight,
  FileText
} from 'lucide-react';

const PaymentDetail = () => {
  const [payment, setPayment] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [sale, setSale] = useState(null);
  const [customerPayments, setCustomerPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  
  // Load payment data
  useEffect(() => {
    const loadPaymentData = async () => {
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
        
        // Get customer's payment history
        const paymentsData = await getPaymentsForCustomer(paymentData.customerId);
        setCustomerPayments(paymentsData.filter(p => p.id !== id)); // Exclude current payment
        
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
    
    loadPaymentData();
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
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-500" />
              Payment Information
            </CardTitle>
            <CardDescription>Receipt ID: {payment.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p>{formatDate(payment.date)}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(payment.amount)}
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
                    {payment.saleId} ({formatCurrency(sale.amount)})
                  </Link>
                </div>
              </div>
            )}
            
            {payment.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="whitespace-pre-wrap bg-secondary p-3 rounded-md text-sm">
                  {payment.notes}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/customers/${payment.customerId}`)}
              className="gap-1"
            >
              <User className="h-4 w-4" />
              Customer Profile
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate(`/payments/new?customer=${payment.customerId}`)}
              className="gap-1"
            >
              <CreditCard className="h-4 w-4" />
              New Payment
            </Button>
          </CardFooter>
        </Card>
        
        <div className="lg:col-span-2 space-y-6">
          {customer && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>Customer Account</span>
                  <Badge variant={customer.outstandingBalance > 0 ? 'outline' : 'default'} className={customer.outstandingBalance > 0 ? 'border-red-500 text-red-500' : 'bg-green-500'}>
                    {customer.outstandingBalance > 0 ? 'Balance Due' : 'Paid in Full'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className={`text-xl font-bold ${customer.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(customer.outstandingBalance)}
                    </p>
                  </div>
                  
                  {customer.cylindersOutstanding > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Cylinders Outstanding</p>
                      <p className="text-lg font-medium text-amber-600">
                        {Math.round(customer.cylindersOutstanding)}
                      </p>
                    </div>
                  )}
                  
                  <Button
                    variant={customer.outstandingBalance > 0 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => navigate(`/payments/new?customer=${customer.id}`)}
                    className="gap-1"
                    disabled={customer.outstandingBalance <= 0}
                  >
                    <CreditCard className="h-4 w-4" />
                    {customer.outstandingBalance > 0 ? 'Make Another Payment' : 'No Balance Due'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Customer payment history */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Payment History
              </CardTitle>
              <CardDescription>
                Other payments by this customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customerPayments.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">
                  No other payment records found for this customer.
                </div>
              ) : (
                <div className="space-y-2">
                  {customerPayments.slice(0, 5).map((otherPayment) => (
                    <div 
                      key={otherPayment.id}
                      className="flex items-center justify-between p-3 bg-secondary rounded-md hover:bg-secondary/80"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-background p-2 rounded-full">
                          <CreditCard className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatCurrency(otherPayment.amount)}</span>
                            <Badge variant="outline" className="text-xs">
                              {otherPayment.id}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(otherPayment.date)}
                          </div>
                        </div>
                      </div>
                      
                      <Link
                        to={`/payments/${otherPayment.id}`}
                        className="text-primary hover:underline text-sm font-medium"
                      >
                        Details
                      </Link>
                    </div>
                  ))}
                  
                  {customerPayments.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-sm gap-1 mt-2"
                      onClick={() => navigate(`/customers/${customer.id}`)}
                    >
                      View all payment history
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full border border-border">
            <h3 className="text-xl font-bold mb-4">Delete Payment</h3>
            <p className="mb-6">
              Are you sure you want to delete this payment of <span className="font-bold">{formatCurrency(payment.amount)}</span>?
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