// src/components/payments/PaymentForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  createPayment, 
  updatePayment, 
  getPaymentById 
} from '@/services/paymentService';
import { 
  getAllCustomers, 
  getCustomerById 
} from '@/services/customerService';
import { getSalesForCustomer } from '@/services/salesService';
import { useNotification } from '@/components/shared/NotificationSystem';
import { Button } from '@/components/ui/button'; // Will be added via shadcn CLI
import { Input } from '@/components/ui/input'; // Will be added via shadcn CLI
import { Label } from '@/components/ui/label'; // Will be added via shadcn CLI
import { Textarea } from '@/components/ui/textarea'; // Will be added via shadcn CLI
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'; // Will be added via shadcn CLI
import { ArrowLeft, Save, CreditCard } from 'lucide-react';

const PaymentForm = ({ isEdit = false }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    amount: 0,
    notes: '',
    saleId: '', // Optional - specific sale this payment is for
  });
  
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [outstandingSales, setOutstandingSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const notification = useNotification();
  
  // Load customers on component mount
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const customersData = await getAllCustomers(false);
        setCustomers(customersData);
        
        // Check for customer ID in query params (for new payments)
        if (!isEdit) {
          const params = new URLSearchParams(location.search);
          const customerId = params.get('customer');
          
          if (customerId) {
            setFormData(prev => ({ ...prev, customerId }));
            loadCustomerDetails(customerId);
          }
        }
        
        setInitialLoading(false);
      } catch (error) {
        notification.error('Failed to load customers');
        console.error('Error loading customers:', error);
        setInitialLoading(false);
      }
    };
    
    loadCustomers();
  }, [isEdit, location.search]);
  
  // Load payment data if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      const loadPayment = async () => {
        try {
          const payment = await getPaymentById(id);
          if (payment) {
            setFormData({
              customerId: payment.customerId || '',
              amount: payment.amount || 0,
              notes: payment.notes || '',
              saleId: payment.saleId || '',
            });
            
            loadCustomerDetails(payment.customerId);
          }
        } catch (error) {
          notification.error('Failed to load payment data');
          console.error('Error loading payment:', error);
        } finally {
          setInitialLoading(false);
        }
      };
      
      loadPayment();
    }
  }, [isEdit, id]);
  
  // Load customer details and outstanding sales
  const loadCustomerDetails = async (customerId) => {
    if (!customerId) return;
    
    try {
      // Get customer details
      const customerData = await getCustomerById(customerId);
      setSelectedCustomer(customerData);
      
      // Get outstanding sales
      const sales = await getSalesForCustomer(customerId);
      const pendingSales = sales.filter(sale => sale.status === 'pending');
      setOutstandingSales(pendingSales);
    } catch (error) {
      console.error('Error loading customer details:', error);
    }
  };
  
  // Handle customer change
  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setFormData(prev => ({ ...prev, customerId, saleId: '' }));
    loadCustomerDetails(customerId);
  };
  
  // Handle specific sale selection
  const handleSaleChange = (e) => {
    const saleId = e.target.value;
    
    // If a specific sale is selected, set the payment amount to match the sale amount
    if (saleId) {
      const selectedSale = outstandingSales.find(sale => sale.id === saleId);
      if (selectedSale) {
        setFormData(prev => ({ ...prev, saleId, amount: selectedSale.amount }));
      }
    } else {
      setFormData(prev => ({ ...prev, saleId }));
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Convert amount to number
    const parsedValue = name === 'amount' ? Math.round(parseFloat(value) || 0) : value;

    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customerId) {
      notification.error('Please select a customer');
      return;
    }
    
    if (formData.amount <= 0) {
      notification.error('Payment amount must be greater than zero');
      return;
    }
    
    // Check if payment amount exceeds outstanding balance
    if (selectedCustomer && formData.amount > selectedCustomer.outstandingBalance) {
      notification.error('Payment amount exceeds outstanding balance');
      return;
    }
    
    setLoading(true);
    
    try {
      if (isEdit) {
        await updatePayment(id, formData);
        notification.success('Payment updated successfully');
      } else {
        const paymentId = await createPayment(formData);
        notification.success('Payment recorded successfully');
        navigate(`/payments/${paymentId}`);
        return;
      }
      
      navigate('/payments');
    } catch (error) {
      notification.error(isEdit ? 'Failed to update payment' : 'Failed to record payment');
      console.error('Error saving payment:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/payments')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? 'Edit Payment' : 'Record Payment'}
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {isEdit ? 'Edit Payment' : 'Record Payment'}
          </CardTitle>
          <CardDescription>
            Enter the payment details. Select a customer first.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Customer selection */}
            <div className="space-y-2">
              <Label htmlFor="customerId">
                Customer <span className="text-destructive">*</span>
              </Label>
              <select
                id="customerId"
                name="customerId"
                value={formData.customerId}
                onChange={handleCustomerChange}
                className="w-full rounded-md border border-border bg-background px-3 py-2"
                required
                disabled={isEdit} // Can't change customer on edit
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Customer info if selected */}
            {selectedCustomer && (
              <div className="bg-secondary p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                    <p className="text-xl font-bold text-destructive">
                      ${selectedCustomer.outstandingBalance?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  
                  {selectedCustomer.cylindersOutstanding > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Cylinders Outstanding</p>
                      <p className="text-lg font-medium text-amber-500">
                        {selectedCustomer.cylindersOutstanding}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Specific sale selection */}
            {selectedCustomer && outstandingSales.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="saleId">Apply to Specific Sale (Optional)</Label>
                <select
                  id="saleId"
                  name="saleId"
                  value={formData.saleId}
                  onChange={handleSaleChange}
                  className="w-full rounded-md border border-border bg-background px-3 py-2"
                >
                  <option value="">Apply to overall balance</option>
                  {outstandingSales.map(sale => (
                    <option key={sale.id} value={sale.id}>
                      {sale.id} - ${sale.amount?.toFixed(2)} 
                      ({sale.type === 'cylinder' 
                        ? `${sale.cylindersDelivered} cylinders` 
                        : `${sale.weight?.toFixed(2)} kg`})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Payment amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                Payment Amount <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="1"
                  step="1"
                  value={Math.round(formData.amount)}
                  onChange={handleChange}
                  className="pl-7"
                  required
                />
              </div>
            </div>
            
            {/* Payment notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Enter any additional notes"
                rows={3}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/payments')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedCustomer || formData.amount <= 0}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : isEdit ? 'Update Payment' : 'Record Payment'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PaymentForm;