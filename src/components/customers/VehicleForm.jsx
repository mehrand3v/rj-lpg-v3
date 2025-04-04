// src/components/customers/VehicleForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  addVehicle, 
  updateVehicle, 
   
  getCustomerById 
} from '@/services/customerService';
import { getDocument } from '@/firebase/firestore';
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
import { ArrowLeft, Save, Truck } from 'lucide-react';

const VehicleForm = ({ isEdit = false }) => {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    description: '',
    customerId: '',
  });
  
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const notification = useNotification();
  
  // Extract customer ID from query params if creating a new vehicle
  useEffect(() => {
    if (!isEdit) {
      const params = new URLSearchParams(location.search);
      const customerId = params.get('customer');
      
      if (customerId) {
        setFormData(prev => ({ ...prev, customerId }));
        
        // Load customer details
        const loadCustomer = async () => {
          try {
            const customerData = await getCustomerById(customerId);
            if (customerData) {
              setCustomer(customerData);
            }
          } catch (error) {
            console.error('Error loading customer:', error);
          } finally {
            setInitialLoading(false);
          }
        };
        
        loadCustomer();
      } else {
        setInitialLoading(false);
      }
    }
  }, [isEdit, location.search]);
  
  // Load vehicle data if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      const loadVehicle = async () => {
        try {
          const vehicle = await getDocument('vehicles', id);
          if (vehicle) {
            setFormData({
              registrationNumber: vehicle.registrationNumber || '',
              description: vehicle.description || '',
              customerId: vehicle.customerId || '',
            });
            
            // Load customer details
            const customerData = await getCustomerById(vehicle.customerId);
            if (customerData) {
              setCustomer(customerData);
            }
          }
        } catch (error) {
          notification.error('Failed to load vehicle data');
          console.error('Error loading vehicle:', error);
        } finally {
          setInitialLoading(false);
        }
      };
      
      loadVehicle();
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
    
    if (!formData.registrationNumber.trim()) {
      notification.error('Vehicle registration number is required');
      return;
    }
    
    if (!formData.customerId) {
      notification.error('Customer is required');
      return;
    }
    
    setLoading(true);
    
    try {
      if (isEdit) {
        await updateVehicle(id, formData);
        notification.success('Vehicle updated successfully');
      } else {
        await addVehicle(formData);
        notification.success('Vehicle added successfully');
      }
      
      navigate(`/customers/${formData.customerId}`);
    } catch (error) {
      notification.error(isEdit ? 'Failed to update vehicle' : 'Failed to add vehicle');
      console.error('Error saving vehicle:', error);
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
          onClick={() => navigate(
            formData.customerId ? `/customers/${formData.customerId}` : '/customers'
          )}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
        </h1>
      </div>
      
      {customer && (
        <p className="text-muted-foreground">
          Adding vehicle for customer: <span className="font-medium text-foreground">{customer.name}</span>
        </p>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {isEdit ? 'Edit Vehicle Information' : 'Vehicle Information'}
          </CardTitle>
          <CardDescription>
            Enter the vehicle details for weight-based sales.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">
                Registration Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="registrationNumber"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
                placeholder="Enter vehicle registration number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter vehicle description"
                rows={3}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(
                formData.customerId ? `/customers/${formData.customerId}` : '/customers'
              )}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : isEdit ? 'Update Vehicle' : 'Add Vehicle'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default VehicleForm;