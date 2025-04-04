// src/pages/Payments.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllPayments } from '@/services/paymentService';
import { getCustomerById } from '@/services/customerService';
import { useNotification } from '@/components/shared/NotificationSystem';
import { Button } from '@/components/ui/button'; // Will be added via shadcn CLI
import { Input } from '@/components/ui/input'; // Will be added via shadcn CLI
import { 
  CreditCard, 
  Plus, 
  Search, 
  RefreshCw,
} from 'lucide-react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState({});
  
  const navigate = useNavigate();
  const notification = useNotification();
  
  // Load payments data
  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        const data = await getAllPayments();
        setPayments(data);
        setFilteredPayments(data);
        
        // Load customer data for each payment
        const customers = {};
        for (const payment of data) {
          if (payment.customerId && typeof payment.customerId === 'string' && !customers[payment.customerId]) {
            try {
              const customer = await getCustomerById(payment.customerId);
              if (customer) {
                customers[payment.customerId] = customer;
              }
            } catch (error) {
              console.error(`Error loading customer ${payment.customerId}:`, error);
              // Continue with other payments even if one fails
            }
          }
        }
        setCustomerData(customers);
        
        setLoading(false);
      } catch (error) {
        notification.error('Failed to load payments data');
        console.error('Error loading payments:', error);
        setLoading(false);
      }
    };
    
    loadPayments();
  }, []);
  
  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredPayments(payments);
      return;
    }
    
    const filtered = payments.filter(payment => {
      const customer = customerData[payment.customerId];
      
      return (
        payment.id?.toLowerCase().includes(term) ||
        (customer?.name && customer.name.toLowerCase().includes(term)) ||
        (payment.notes && payment.notes.toLowerCase().includes(term))
      );
    });
    
    setFilteredPayments(filtered);
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
        <h1 className="text-2xl font-bold">Payments</h1>
        
        <Button 
          onClick={() => navigate('/payments/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Record Payment</span>
        </Button>
      </div>
      
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search payments..."
          value={searchTerm}
          onChange={handleSearch}
          className="pl-9"
        />
      </div>
      
      {filteredPayments.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <p className="text-lg text-muted-foreground">No payments found</p>
          <Button 
            onClick={() => navigate('/payments/new')}
            variant="outline"
            className="mt-4"
          >
            Record your first payment
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
                  <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Notes</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-secondary/50">
                    <td className="px-4 py-3 text-sm font-mono">
                      {payment.id}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {payment.customerId && typeof payment.customerId === 'string' && customerData[payment.customerId] ? (
                        <Link
                          to={`/customers/${payment.customerId}`}
                          className="text-primary hover:underline"
                        >
                          {customerData[payment.customerId].name}
                        </Link>
                      ) : (
                        'Unknown Customer'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                      ${payment.amount?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm truncate max-w-xs">
                      {payment.notes || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/payments/${payment.id}`)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/payments/edit/${payment.id}`)}
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

export default Payments;