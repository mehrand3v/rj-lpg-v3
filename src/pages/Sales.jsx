// src/pages/Sales.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllSales } from '@/services/salesService';
import { getCustomerById } from '@/services/customerService';
import { useNotification } from '@/components/shared/NotificationSystem';
import { Button } from '@/components/ui/button'; // Will be added via shadcn CLI
import { Input } from '@/components/ui/input'; // Will be added via shadcn CLI
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  RefreshCw,
  Package,
  Scale
} from 'lucide-react';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState({});
  
  const navigate = useNavigate();
  const notification = useNotification();
  
  // Load sales data
  useEffect(() => {
    const loadSales = async () => {
      try {
        setLoading(true);
        const data = await getAllSales();
        setSales(data);
        setFilteredSales(data);
        
        // Load customer data for each sale
        const customers = {};
        for (const sale of data) {
          if (!customers[sale.customerId]) {
            const customer = await getCustomerById(sale.customerId);
            customers[sale.customerId] = customer;
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
  
  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredSales(sales);
      return;
    }
    
    const filtered = sales.filter(sale => {
      const customer = customerData[sale.customerId];
      
      return (
        sale.id.toLowerCase().includes(term) ||
        (customer?.name && customer.name.toLowerCase().includes(term)) ||
        sale.type.toLowerCase().includes(term)
      );
    });
    
    setFilteredSales(filtered);
  };
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          placeholder="Search sales..."
          value={searchTerm}
          onChange={handleSearch}
          className="pl-9"
        />
      </div>
      
      {filteredSales.length === 0 ? (
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
        <div className="bg-card rounded-lg overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Details</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Payment</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-secondary/50">
                    <td className="px-4 py-3 text-sm font-mono">
                      {sale.id}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(sale.date)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {customerData[sale.customerId] ? (
                        <Link
                          to={`/customers/${sale.customerId}`}
                          className="text-primary hover:underline"
                        >
                          {customerData[sale.customerId].name}
                        </Link>
                      ) : (
                        'Unknown Customer'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-1">
                        {sale.type === 'cylinder' ? (
                          <Package className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Scale className="h-4 w-4 text-purple-500" />
                        )}
                        <span className="capitalize">{sale.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {sale.type === 'cylinder' 
                        ? `${sale.cylindersDelivered} cylinders at ${sale.rate?.toFixed(2)}` 
                        : `${sale.weight?.toFixed(2)} kg at ${sale.rate?.toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      ${sale.amount?.toFixed(2)}
                    </td>
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/sales/edit/${sale.id}`)}
                        >
                          Edit
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
    </div>
  );
};

export default Sales;