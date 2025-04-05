// src/components/cylinders/CylinderReturns.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  recordCylinderReturns,
  getCylinderTracking,
  resetCylinderTracking
} from '@/services/cylinderService';
import {
  getAllCustomers,
  getCustomerById
} from '@/services/customerService';
import { useNotification } from '@/components/shared/NotificationSystem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { ArrowLeft, Save, Package, RefreshCw, CheckCircle, HistoryIcon } from 'lucide-react';

const CylinderReturns = () => {
  const [formData, setFormData] = useState({
    customerId: '',
    cylindersReturned: 1,
    notes: '',
  });
  
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [cylinderTracking, setCylinderTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [showHistoryOption, setShowHistoryOption] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const notification = useNotification();
  
  // Load customers on component mount
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const customersData = await getAllCustomers(false);
        
        // Filter to only show customers with outstanding cylinders
        const customersWithCylinders = customersData.filter(
          customer => customer.cylindersOutstanding > 0
        );
        
        setCustomers(customersData);
        setFilteredCustomers(customersWithCylinders);
        
        // Check for customer ID in query params
        const params = new URLSearchParams(location.search);
        const customerId = params.get('customer');
        
        if (customerId) {
          setFormData(prev => ({ ...prev, customerId }));
          loadCustomerDetails(customerId);
        }
        
        setInitialLoading(false);
      } catch (error) {
        notification.error('Failed to load customers');
        console.error('Error loading customers:', error);
        setInitialLoading(false);
      }
    };
    
    loadCustomers();
  }, [location.search]);
  
  // Load customer details and cylinder tracking
  const loadCustomerDetails = async (customerId) => {
    if (!customerId) return;
    
    try {
      setLoading(true);
      
      // Get customer details
      const customerData = await getCustomerById(customerId);
      setSelectedCustomer(customerData);
      
      // Get cylinder tracking
      const cylinderData = await getCylinderTracking(customerId);
      setCylinderTracking(cylinderData);
      
      // Enable history option if the customer has returned cylinders before
      setShowHistoryOption(cylinderData && cylinderData.cylindersReturned > 0);
      
      setLoading(false);
    } catch (error) {
      notification.error('Failed to load customer details');
      console.error('Error loading customer details:', error);
      setLoading(false);
    }
  };
  
  // Handle customer change
  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setFormData(prev => ({ ...prev, customerId }));
    
    if (customerId) {
      loadCustomerDetails(customerId);
    } else {
      setSelectedCustomer(null);
      setCylinderTracking(null);
      setShowHistoryOption(false);
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Convert to number if needed
    const parsedValue = type === 'number' ? Math.round(parseFloat(value) || 0) : value;

    
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
    
    if (formData.cylindersReturned <= 0) {
      notification.error('Number of cylinders must be greater than zero');
      return;
    }
    
    if (!cylinderTracking || formData.cylindersReturned > cylinderTracking.cylindersOutstanding) {
      notification.error(`Customer only has ${cylinderTracking?.cylindersOutstanding || 0} cylinders outstanding`);
      return;
    }
    
    setLoading(true);
    
    try {
      await recordCylinderReturns(
        formData.customerId,
        formData.cylindersReturned,
        formData.notes
      );
      
      notification.success(`${formData.cylindersReturned} cylinders recorded as returned`);
      
      // Check if this was the last of the cylinders
      if (cylinderTracking.cylindersOutstanding === formData.cylindersReturned) {
        setResetConfirmOpen(true);
      } else {
        // Reload customer details to update counts
        loadCustomerDetails(formData.customerId);
        
        // Reset form
        setFormData(prev => ({ ...prev, cylindersReturned: 1, notes: '' }));
      }
    } catch (error) {
      notification.error(`Failed to record cylinder returns: ${error.message}`);
      console.error('Error recording cylinder returns:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle cylinder tracking reset
  const handleResetTracking = async () => {
    try {
      setLoading(true);
      await resetCylinderTracking(formData.customerId);
      notification.success('Cylinder tracking reset successfully');
      navigate(`/customers/${formData.customerId}`);
    } catch (error) {
      notification.error(`Failed to reset cylinder tracking: ${error.message}`);
      console.error('Error resetting cylinder tracking:', error);
      setLoading(false);
    } finally {
      setResetConfirmOpen(false);
    }
  };
  
  // Navigate to view cylinder history
  const handleViewHistory = () => {
    navigate(`/cylinders?customer=${formData.customerId}`);
  };
  
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Record Cylinder Returns</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Cylinder Returns
          </CardTitle>
          <CardDescription>
            Record cylinders returned by a customer.
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
              >
                <option value="">Select a customer</option>
                {filteredCustomers.length === 0 ? (
                  <option disabled>No customers with outstanding cylinders</option>
                ) : (
                  filteredCustomers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.cylindersOutstanding} cylinders)
                    </option>
                  ))
                )}
              </select>
              
              {filteredCustomers.length === 0 && customers.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No customers currently have outstanding cylinders.
                </p>
              )}
            </div>
            
            {/* Customer info if selected */}
            {selectedCustomer && cylinderTracking && (
              <div className="bg-secondary p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">{selectedCustomer.name}</h3>
                  
                  {showHistoryOption && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleViewHistory}
                      className="flex gap-2 items-center"
                    >
                      <HistoryIcon className="h-4 w-4" />
                      View Return History
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Delivered</p>
                    <p className="text-lg font-medium">
                      {cylinderTracking.cylindersDelivered} cylinders
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Already Returned</p>
                    <p className="text-lg font-medium">
                      {cylinderTracking.cylindersReturned} cylinders
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                    <p className="text-lg font-medium text-amber-500">
                      {cylinderTracking.cylindersOutstanding} cylinders
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Number of cylinders being returned */}
            <div className="space-y-2">
              <Label htmlFor="cylindersReturned">
                Cylinders Returned <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cylindersReturned"
                name="cylindersReturned"
                type="number"
                min="1"
                max={cylinderTracking?.cylindersOutstanding || 1}
                value={formData.cylindersReturned}
                onChange={handleChange}
                disabled={!selectedCustomer}
                required
              />
              
              {selectedCustomer && cylinderTracking && (
                <p className="text-xs text-muted-foreground">
                  Maximum: {cylinderTracking.cylindersOutstanding} cylinders
                </p>
              )}
            </div>
            
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Enter any additional notes"
                disabled={!selectedCustomer}
                rows={3}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedCustomer || formData.cylindersReturned <= 0 || !cylinderTracking || formData.cylindersReturned > cylinderTracking?.cylindersOutstanding}
              className="gap-2"
            >
              <Package className="h-4 w-4" />
              {loading ? 'Processing...' : 'Record Returns'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {/* Reset confirmation dialog */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full border border-border">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">All Cylinders Returned!</h3>
            <p className="mb-6 text-center">
              {selectedCustomer?.name} has returned all cylinders. Would you like to reset the cylinder tracking for this customer?
            </p>
            <div className="flex justify-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setResetConfirmOpen(false);
                  navigate(`/customers/${formData.customerId}`);
                }}
                disabled={loading}
              >
                No, Keep Tracking
              </Button>
              <Button 
                variant="default"
                onClick={handleResetTracking}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Processing...' : 'Yes, Reset Tracking'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CylinderReturns;