// src/components/payments/CustomerPaymentsView.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllCustomers } from '@/services/customerService';
import { getPaymentsForCustomer } from '@/services/paymentService';
import { useNotification } from '@/components/shared/NotificationSystem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  CreditCard, 
  Plus, 
  Search, 
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';

const CustomerPaymentsView = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customerPayments, setCustomerPayments] = useState({});
  const [expandedCustomers, setExpandedCustomers] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('balance'); // 'balance', 'name', 'lastPayment'
  const [sortDirection, setSortDirection] = useState('desc');
  
  const navigate = useNavigate();
  const notification = useNotification();
  
  // Load customers with balance info
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        
        // Get all active customers
        const customersData = await getAllCustomers(false);
        
        // Filter customers with outstanding balance
        const customersWithBalance = customersData.filter(customer => 
          customer.outstandingBalance > 0
        );
        
        setCustomers(customersWithBalance);
        setFilteredCustomers(customersWithBalance);
        setLoading(false);
      } catch (error) {
        notification.error('Failed to load customer data');
        console.error('Error loading customers:', error);
        setLoading(false);
      }
    };
    
    loadCustomers();
  }, []);
  
  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredCustomers(customers);
      return;
    }
    
    const filtered = customers.filter(customer => 
      customer.name.toLowerCase().includes(term.toLowerCase()) ||
      (customer.phone && customer.phone.includes(term))
    );
    
    setFilteredCustomers(filtered);
  };
  
  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for balance, ascending for name
      const newDirection = field === 'balance' ? 'desc' : 'asc';
      setSortBy(field);
      setSortDirection(newDirection);
    }
  };
  
  // Sort customers based on current sort settings
  const sortedCustomers = () => {
    return [...filteredCustomers].sort((a, b) => {
      if (sortBy === 'balance') {
        return sortDirection === 'asc' 
          ? a.outstandingBalance - b.outstandingBalance
          : b.outstandingBalance - a.outstandingBalance;
      } else if (sortBy === 'name') {
        return sortDirection === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'lastPayment') {
        // Sort by last payment date (in a real app, you'd need to fetch and store this)
        // For now, we'll just sort by ID as a placeholder
        return sortDirection === 'asc'
          ? a.id.localeCompare(b.id)
          : b.id.localeCompare(a.id);
      }
      return 0;
    });
  };
  
  // Toggle customer expansion and load their payments
  const toggleCustomerExpanded = async (customerId) => {
    // If we're opening this customer and don't have their payments yet, load them
    if (!expandedCustomers[customerId] && !customerPayments[customerId]) {
      try {
        const payments = await getPaymentsForCustomer(customerId);
        setCustomerPayments(prev => ({
          ...prev,
          [customerId]: payments
        }));
      } catch (error) {
        console.error(`Error loading payments for customer ${customerId}:`, error);
        notification.error('Failed to load payment history');
      }
    }
    
    // Toggle expanded state
    setExpandedCustomers(prev => ({
      ...prev,
      [customerId]: !prev[customerId]
    }));
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
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
        <h1 className="text-2xl font-bold">Customer Payments</h1>
        
        <Button 
          onClick={() => navigate('/payments/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Record Payment</span>
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-9"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Button 
            variant={sortBy === 'balance' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleSort('balance')}
            className="gap-1"
          >
            Balance
            {sortBy === 'balance' && (
              sortDirection === 'asc' ? '↑' : '↓'
            )}
          </Button>
          <Button 
            variant={sortBy === 'name' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleSort('name')}
            className="gap-1"
          >
            Name
            {sortBy === 'name' && (
              sortDirection === 'asc' ? '↑' : '↓'
            )}
          </Button>
        </div>
      </div>
      
      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <p className="text-lg text-muted-foreground">No customers with outstanding balance</p>
            <p className="text-muted-foreground mb-4">
              All customers are paid in full.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedCustomers().map(customer => (
            <Card key={customer.id} className={`overflow-hidden ${customer.outstandingBalance > 500 ? 'border-red-300 dark:border-red-700' : ''}`}>
              <div 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-secondary/50 gap-4"
                onClick={() => toggleCustomerExpanded(customer.id)}
              >
                <div className="flex items-center gap-3">
                  {expandedCustomers[customer.id] ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <Link
                      to={`/customers/${customer.id}`}
                      className="font-medium text-lg text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {customer.name}
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {customer.phone && (
                        <span>{customer.phone}</span>
                      )}
                      {customer.cylindersOutstanding > 0 && (
                        <span className="flex items-center gap-1 text-amber-500">
                          <AlertTriangle className="h-3 w-3" />
                          {Math.round(customer.cylindersOutstanding)} cylinders out
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center justify-between sm:gap-2">
                    <span className="text-sm text-muted-foreground sm:hidden">Balance:</span>
                    <span className={`font-bold text-xl ${
                      customer.outstandingBalance > 500 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      {formatCurrency(customer.outstandingBalance)}
                    </span>
                  </div>
                  
                  <div className="flex sm:gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/payments/new?customer=${customer.id}`);
                      }}
                    >
                      <CreditCard className="h-4 w-4" />
                      Pay
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/customers/${customer.id}`);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
              
              {expandedCustomers[customer.id] && (
                <div className="border-t border-border p-4 bg-muted/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Payment History</h3>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="gap-1 text-green-600 dark:text-green-400"
                      onClick={() => navigate(`/payments/new?customer=${customer.id}`)}
                    >
                      <Plus className="h-4 w-4" />
                      Record Payment
                    </Button>
                  </div>
                  
                  {!customerPayments[customer.id] ? (
                    <div className="flex justify-center p-4">
                      <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : customerPayments[customer.id].length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground text-sm">
                      No payment history found for this customer.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customerPayments[customer.id].map(payment => (
                        <div 
                          key={payment.id} 
                          className="bg-background rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-green-500" />
                              <span className="font-medium">
                                {formatCurrency(payment.amount)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {payment.id}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(payment.date)}
                              {payment.notes && (
                                <span className="truncate max-w-xs">- {payment.notes}</span>
                              )}
                            </div>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/payments/${payment.id}`)}
                          >
                            Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      
      {/* Payment Stats Card */}
      {filteredCustomers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Outstanding</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(filteredCustomers.reduce((sum, customer) => sum + customer.outstandingBalance, 0))}
                </p>
              </div>
              
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Customers with Balance</p>
                <p className="text-xl font-bold">
                  {filteredCustomers.length}
                </p>
              </div>
              
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Avg. Balance</p>
                <p className="text-xl font-bold">
                  {formatCurrency(
                    filteredCustomers.length > 0 
                    ? filteredCustomers.reduce((sum, customer) => sum + customer.outstandingBalance, 0) / filteredCustomers.length 
                    : 0
                  )}
                </p>
              </div>
              
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">High Balance (&gt;$500)</p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {filteredCustomers.filter(c => c.outstandingBalance > 500).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerPaymentsView;