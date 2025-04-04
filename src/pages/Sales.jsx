// src/pages/Sales.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllSales } from '@/services/salesService';
import { getCustomerById } from '@/services/customerService';
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
  ShoppingCart, 
  Plus, 
  Search, 
  RefreshCw,
  Package,
  Scale,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [cylinderSales, setCylinderSales] = useState([]);
  const [weightSales, setWeightSales] = useState([]);
  const [customerData, setCustomerData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('cylinder');
  const [loading, setLoading] = useState(true);
  const [expandedCustomers, setExpandedCustomers] = useState({});
  
  const navigate = useNavigate();
  const notification = useNotification();
  
  // Load sales data
  useEffect(() => {
    const loadSales = async () => {
      try {
        setLoading(true);
        const data = await getAllSales();
        setSales(data);
        
        // Process sales data by type and customer
        const cylinderSalesData = data.filter(sale => sale.type === 'cylinder');
        const weightSalesData = data.filter(sale => sale.type === 'weight');
        
        // Group by customer
        const cylinderByCustomer = groupSalesByCustomer(cylinderSalesData);
        const weightByCustomer = groupSalesByCustomer(weightSalesData);
        
        setCylinderSales(cylinderByCustomer);
        setWeightSales(weightByCustomer);
        
        // Load customer data for each sale
        const customerIds = [...new Set(data.map(sale => sale.customerId))];
        const customers = {};
        
        for (const customerId of customerIds) {
          if (customerId && typeof customerId === 'string' && !customers[customerId]) {
            try {
              const customer = await getCustomerById(customerId);
              if (customer) {
                customers[customerId] = customer;
              }
            } catch (error) {
              console.error(`Error loading customer ${customerId}:`, error);
              // Continue with other customers even if one fails
            }
          }
        }
        
        setCustomerData(customers);
        setLoading(false);
      } catch (error) {
        notification.error('Failed to load sales data');
        console.error('Error loading sales:', error);
        setLoading(false);
      }
    };
    
    loadSales();
  }, []);
  
  // Group sales by customer
  const groupSalesByCustomer = (salesData) => {
    const customerSales = {};
    
    salesData.forEach(sale => {
      if (!customerSales[sale.customerId]) {
        customerSales[sale.customerId] = [];
      }
      customerSales[sale.customerId].push(sale);
    });
    
    // Convert to array format for easier rendering
    return Object.entries(customerSales).map(([customerId, sales]) => ({
      customerId,
      sales: sales.sort((a, b) => {
        // Sort by date descending (newest first)
        const dateA = a.date?.seconds || 0;
        const dateB = b.date?.seconds || 0;
        return dateB - dateA;
      }),
      totalAmount: sales.reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0),
      totalCylinders: sales.reduce((sum, sale) => sum + (Number(sale.cylindersDelivered) || 0), 0),
      totalWeight: sales.reduce((sum, sale) => sum + (Number(sale.weight) || 0), 0),
      lastSaleDate: sales.reduce((latest, sale) => {
        const saleDate = sale.date?.seconds || 0;
        return saleDate > latest ? saleDate : latest;
      }, 0)
    }));
  };
  
  // Toggle expansion of a customer's sales
  const toggleCustomerExpanded = (customerId) => {
    setExpandedCustomers(prev => ({
      ...prev,
      [customerId]: !prev[customerId]
    }));
  };
  
  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };
  
  // Filter customer sales based on search term
  const filterSales = (customerSales) => {
    if (!searchTerm.trim()) return customerSales;
    
    return customerSales.filter(item => {
      const customer = customerData[item.customerId];
      return customer?.name?.toLowerCase().includes(searchTerm);
    });
  };
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(validAmount);
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
        <h1 className="text-2xl font-bold">Sales Transactions</h1>
        
        <Button 
          onClick={() => navigate('/sales/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Sale</span>
        </Button>
      </div>
      
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by customer name..."
          value={searchTerm}
          onChange={handleSearch}
          className="pl-9"
        />
      </div>
      
      {sales.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <p className="text-lg text-muted-foreground">No sales transactions found</p>
          <Button 
            onClick={() => navigate('/sales/new')}
            variant="outline"
            className="mt-4"
          >
            Create your first sale
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="cylinder" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
            <TabsTrigger value="cylinder" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Cylinder Sales
            </TabsTrigger>
            <TabsTrigger value="weight" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Weight Sales
            </TabsTrigger>
          </TabsList>
          
          {/* Cylinder Sales Tab */}
          <TabsContent value="cylinder" className="mt-0">
            {filterSales(cylinderSales).length === 0 ? (
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-lg text-muted-foreground">
                  {searchTerm ? 'No matching cylinder sales found' : 'No cylinder sales transactions found'}
                </p>
                <Button 
                  onClick={() => navigate('/sales/new')}
                  variant="outline"
                  className="mt-4"
                >
                  Create a cylinder sale
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filterSales(cylinderSales).map(customerSale => (
                  <Card key={customerSale.customerId} className="overflow-hidden">
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/50"
                      onClick={() => toggleCustomerExpanded(customerSale.customerId)}
                    >
                      <div className="flex items-center gap-3">
                        {expandedCustomers[customerSale.customerId] ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <User className="h-5 w-5 text-blue-500" />
                        <div>
                          <Link
                            to={`/customers/${customerSale.customerId}`}
                            className="font-medium text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {customerData[customerSale.customerId]?.name || 'Unknown Customer'}
                          </Link>
                          <div className="text-sm text-muted-foreground">
                            Last sale: {formatDate(customerSale.lastSaleDate)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-medium">{customerData[customerSale.customerId]?.cylindersOutstanding || 0} cylinders</div>
                          <div className="text-sm text-muted-foreground">Outstanding</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(customerSale.totalAmount)}</div>
                          <div className="text-sm text-muted-foreground">Total sales</div>
                        </div>
                      </div>
                    </div>
                    
                    {expandedCustomers[customerSale.customerId] && (
                      <div className="border-t border-border">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-secondary/80">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Cylinders</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Rate</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Payment</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {customerSale.sales.map(sale => (
                                <tr key={sale.id} className="hover:bg-secondary/30">
                                  <td className="px-4 py-3 text-sm">{formatDate(sale.date?.seconds)}</td>
                                  <td className="px-4 py-3 text-sm font-mono">{sale.id}</td>
                                  <td className="px-4 py-3 text-sm">{sale.cylindersDelivered}</td>
                                  <td className="px-4 py-3 text-sm">${sale.rate?.toFixed(2)}</td>
                                  <td className="px-4 py-3 text-sm font-medium">${sale.amount?.toFixed(2)}</td>
                                  <td className="px-4 py-3 text-sm">
                                    <Badge
                                      variant={sale.paymentType === 'cash' ? 'default' : 'secondary'}
                                    >
                                      {sale.paymentType}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => navigate(`/sales/${sale.id}`)}
                                      >
                                        View
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Weight Sales Tab */}
          <TabsContent value="weight" className="mt-0">
            {filterSales(weightSales).length === 0 ? (
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <Scale className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-lg text-muted-foreground">
                  {searchTerm ? 'No matching weight sales found' : 'No weight sales transactions found'}
                </p>
                <Button 
                  onClick={() => navigate('/sales/new')}
                  variant="outline"
                  className="mt-4"
                >
                  Create a weight sale
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filterSales(weightSales).map(customerSale => (
                  <Card key={customerSale.customerId} className="overflow-hidden">
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/50"
                      onClick={() => toggleCustomerExpanded(customerSale.customerId)}
                    >
                      <div className="flex items-center gap-3">
                        {expandedCustomers[customerSale.customerId] ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <User className="h-5 w-5 text-purple-500" />
                        <div>
                          <Link
                            to={`/customers/${customerSale.customerId}`}
                            className="font-medium text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {customerData[customerSale.customerId]?.name || 'Unknown Customer'}
                          </Link>
                          <div className="text-sm text-muted-foreground">
                            Last sale: {formatDate(customerSale.lastSaleDate)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-medium">{customerSale.totalWeight.toFixed(2)} kg</div>
                          <div className="text-sm text-muted-foreground">Total weight</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(customerSale.totalAmount)}</div>
                          <div className="text-sm text-muted-foreground">Total sales</div>
                        </div>
                      </div>
                    </div>
                    
                    {expandedCustomers[customerSale.customerId] && (
                      <div className="border-t border-border">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-secondary/80">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Vehicle</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Weight (kg)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Rate</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Payment</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {customerSale.sales.map(sale => (
                                <tr key={sale.id} className="hover:bg-secondary/30">
                                  <td className="px-4 py-3 text-sm">{formatDate(sale.date?.seconds)}</td>
                                  <td className="px-4 py-3 text-sm font-mono">{sale.id}</td>
                                  <td className="px-4 py-3 text-sm">{sale.vehicleRegistration || 'No Rego #'}</td>
                                  <td className="px-4 py-3 text-sm">{sale.weight?.toFixed(2)}</td>
                                  <td className="px-4 py-3 text-sm">${sale.rate?.toFixed(2)}</td>
                                  <td className="px-4 py-3 text-sm font-medium">${sale.amount?.toFixed(2)}</td>
                                  <td className="px-4 py-3 text-sm">
                                    <Badge
                                      variant={sale.paymentType === 'cash' ? 'default' : 'secondary'}
                                    >
                                      {sale.paymentType}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => navigate(`/sales/${sale.id}`)}
                                      >
                                        View
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Sales;