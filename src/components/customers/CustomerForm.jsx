// src/components/customers/CustomerForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  createCustomer, 
  getCustomerById, 
  updateCustomer 
} from '@/services/customerService';
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
import { ArrowLeft, Save } from 'lucide-react';

const CustomerForm = ({ isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    status: 'active',
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  
  // Load customer data if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      const loadCustomer = async () => {
        try {
          const customer = await getCustomerById(id);
          if (customer) {
            setFormData({
              name: customer.name || '',
              phone: customer.phone || '',
              email: customer.email || '',
              address: customer.address || '',
              status: customer.status || 'active',
            });
          }
          setInitialLoading(false);
        } catch (error) {
          notification.error('Failed to load customer data');
          console.error('Error loading customer:', error);
          setInitialLoading(false);
        }
      };
      
      loadCustomer();
    }
  }, [isEdit, id]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      notification.error('Customer name is required');
      return;
    }
    
    setLoading(true);
    
    try {
      if (isEdit) {
        await updateCustomer(id, formData);
        notification.success('Customer updated successfully');
      } else {
        const customerId = await createCustomer({
          ...formData,
          outstandingBalance: 0,
          cylindersOutstanding: 0,
        });
        notification.success('Customer created successfully');
        navigate(`/customers/${customerId}`);
        return; // Prevent the navigate below from executing
      }
      
      navigate('/customers');
    } catch (error) {
      notification.error(isEdit ? 'Failed to update customer' : 'Failed to create customer');
      console.error('Error saving customer:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading customer data...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/customers')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? 'Edit Customer' : 'Add New Customer'}
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Customer Information' : 'Customer Information'}</CardTitle>
          <CardDescription>
            Enter the customer details. Only name is required.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter customer name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-md border border-border bg-background px-3 py-2"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter customer address"
                rows={3}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/customers')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Customer'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CustomerForm;