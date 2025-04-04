// src/components/sales/SaleForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  createSale, 
  updateSale, 
  getSaleById 
} from '@/services/salesService';
import { 
  getAllCustomers, 
  getVehiclesForCustomer 
} from '@/services/customerService';
import { useNotification } from '@/components/shared/NotificationSystem';
import { Button } from '@/components/ui/button'; // Will be added via shadcn CLI
import { Input } from '@/components/ui/input'; // Will be added via shadcn CLI
import { Label } from '@/components/ui/label'; // Will be added via shadcn CLI
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'; // Will be added via shadcn CLI
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'; // Will be added via shadcn CLI
import { 
  ArrowLeft, 
  Save, 
  Package, 
  Scale, 
  ShoppingCart
} from 'lucide-react';

const SaleForm = ({ isEdit = false }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    type: 'cylinder',
    cylindersDelivered: 1,
    rate: 0,
    weight: 0,
    vehicleId: '',
    paymentType: 'credit',
  });
  
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const notification = useNotification();
  
  // Calculate total amount
  const calculateTotal = () => {
    if (formData.type === 'cylinder') {
      return Math.round(formData.cylindersDelivered * formData.rate);
    } else {
      return Math.round(formData.weight * formData.rate);
    }
  };
  
  // Load customers on component mount
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const customersData = await getAllCustomers(false);
        setCustomers(customersData);
        
        // Check for customer ID in query params (for new sales)
        if (!isEdit) {
          const params = new URLSearchParams(location.search);
          const customerId = params.get('customer');
          
          if (customerId) {
            setFormData(prev => ({ ...prev, customerId }));
            loadVehiclesForCustomer(customerId);
            
            // Find customer in the loaded list
            const customer = customersData.find(c => c.id === customerId);
            if (customer) {
              setSelectedCustomer(customer);
            }
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
  
  // Load sale data if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      const loadSale = async () => {
        try {
          const sale = await getSaleById(id);
          if (sale) {
            setFormData({
              customerId: sale.customerId || '',
              type: sale.type || 'cylinder',
              cylindersDelivered: sale.cylindersDelivered || 1,
              rate: sale.rate || 0,
              weight: sale.weight || 0,
              vehicleId: sale.vehicleId || '',
              paymentType: sale.paymentType || 'credit',
            });
            
            loadVehiclesForCustomer(sale.customerId);
            
            // Find customer in the loaded list
            const customer = customers.find(c => c.id === sale.customerId);
            if (customer) {
              setSelectedCustomer(customer);
            }
          }
        } catch (error) {
          notification.error('Failed to load sale data');
          console.error('Error loading sale:', error);
        } finally {
          setInitialLoading(false);
        }
      };
      
      loadSale();
    }
  }, [isEdit, id, customers]);
  
  // Load vehicles when customer changes
  const loadVehiclesForCustomer = async (customerId) => {
    if (!customerId) return;
    
    try {
      const vehiclesData = await getVehiclesForCustomer(customerId);
      setVehicles(vehiclesData);
      
      // If this is a weight sale, and we have vehicles, select the first one by default
      if (formData.type === 'weight' && vehiclesData.length > 0 && !formData.vehicleId) {
        setFormData(prev => ({ ...prev, vehicleId: vehiclesData[0].id }));
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };
  
  // Handle customer change
  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setFormData(prev => ({ ...prev, customerId }));
    
    // Find selected customer
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer);
    
    // Load vehicles for the selected customer
    loadVehiclesForCustomer(customerId);
  };
  
  // Handle sale type change
  const handleTypeChange = (value) => {
    setFormData(prev => ({ ...prev, type: value }));
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Convert numeric inputs to numbers
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
    
    if (formData.type === 'cylinder') {
      if (formData.cylindersDelivered <= 0) {
        notification.error('Number of cylinders must be greater than zero');
        return;
      }
      
      if (formData.rate <= 0) {
        notification.error('Rate per cylinder must be greater than zero');
        return;
      }
    } else {
      if (!formData.vehicleId) {
        notification.error('Please select a vehicle');
        return;
      }
      
      if (formData.weight <= 0) {
        notification.error('Weight must be greater than zero');
        return;
      }
      
      if (formData.rate <= 0) {
        notification.error('Rate per unit must be greater than zero');
        return;
      }
    }
    
    setLoading(true);
    
    try {
      if (isEdit) {
        await updateSale(id, formData);
        notification.success('Sale updated successfully');
      } else {
        const saleId = await createSale(formData);
        notification.success('Sale created successfully');
        navigate(`/sales/${saleId}`);
        return;
      }
      
      navigate('/sales');
    } catch (error) {
      notification.error(isEdit ? 'Failed to update sale' : 'Failed to create sale');
      console.error('Error saving sale:', error);
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
          onClick={() => navigate('/sales')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? 'Edit Sale' : 'New Sale'}
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {isEdit ? 'Edit Sale Transaction' : 'New Sale Transaction'}
          </CardTitle>
          <CardDescription>
            Enter the sale details. Select a customer first.
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
            
            {/* Sale type tabs */}
            <Tabs
              value={formData.type}
              onValueChange={handleTypeChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cylinder" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  By Cylinder
                </TabsTrigger>
                <TabsTrigger value="weight" className="flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  By Weight
                </TabsTrigger>
              </TabsList>
              
              {/* Cylinder sale form */}
              <TabsContent value="cylinder" className="pt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cylindersDelivered">
                      Number of Cylinders <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="cylindersDelivered"
                      name="cylindersDelivered"
                      type="number"
                      min="1"
                      value={formData.cylindersDelivered}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cylinderRate">
                      Rate per Cylinder <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                      <Input
                        id="cylinderRate"
                        name="rate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.rate}
                        onChange={handleChange}
                        className="pl-7"
                        required
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Weight sale form */}
              <TabsContent value="weight" className="pt-4 space-y-4">
                {vehicles.length === 0 && formData.customerId && (
                  <div className="bg-amber-500/10 text-amber-800 dark:text-amber-400 p-3 rounded-md mb-4">
                    <p className="text-sm">
                      This customer has no registered vehicles. 
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-sm underline"
                        onClick={() => navigate(`/vehicles/new?customer=${formData.customerId}`)}
                      >
                        Add a vehicle
                      </Button>
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleId">
                      Vehicle <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id="vehicleId"
                      name="vehicleId"
                      value={formData.vehicleId}
                      onChange={handleChange}
                      className="w-full rounded-md border border-border bg-background px-3 py-2"
                      required
                      disabled={vehicles.length === 0}
                    >
                      <option value="">Select a vehicle</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.registrationNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weight">
                      Weight (kg) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={formData.weight}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weightRate">
                      Rate per kg <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                      <Input
                        id="weightRate"
                        name="rate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.rate}
                        onChange={handleChange}
                        className="pl-7"
                        required
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Payment type */}
            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentType"
                    value="cash"
                    checked={formData.paymentType === 'cash'}
                    onChange={handleChange}
                    className="rounded border-border"
                  />
                  <span>Cash</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentType"
                    value="credit"
                    checked={formData.paymentType === 'credit'}
                    onChange={handleChange}
                    className="rounded border-border"
                  />
                  <span>Credit</span>
                </label>
              </div>
            </div>
            
            {/* Total amount */}
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">${calculateTotal()}</p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/sales')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : isEdit ? 'Update Sale' : 'Create Sale'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SaleForm;