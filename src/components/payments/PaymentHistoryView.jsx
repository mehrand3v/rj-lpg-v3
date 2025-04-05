// src/components/payments/PaymentHistoryView.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllPayments } from '@/services/paymentService';
import { getCustomerById } from '@/services/customerService';
import { useNotification } from '@/components/shared/NotificationSystem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  CreditCard, 
  Plus, 
  Search, 
  RefreshCw,
  Calendar,
  FileText,
  User
} from 'lucide-react';

const PaymentHistoryView = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState({});
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  
  const navigate = useNavigate();
  const notification = useNotification();
  
  // Load payments data
  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        const data = await getAllPayments();
        setPayments(data);
        
        // Load customer data for each payment
        const customers = {};
        const customerIds = [...new Set(data.map(payment => payment.customerId))];
        
        for (const customerId of customerIds) {
          if (customerId && typeof customerId === 'string' && !customers[customerId]) {
            try {
              const customer = await getCustomerById(customerId);
              if (customer) {
                customers[customerId] = customer;
              }
            } catch (error) {
              console.error(`Error loading customer ${customerId}:`, error);
            }
          }
        }
        
        setCustomerData(customers);
        applyFilters(data, dateFilter, searchTerm, customers);
        setLoading(false);
      } catch (error) {
        notification.error('Failed to load payments data');
        console.error('Error loading payments:', error);
        setLoading(false);
      }
    };
    
    loadPayments();
  }, []);
  
  // Apply all filters
  const applyFilters = (data, dateFilterValue, searchTermValue, customers) => {
    let filtered = [...data];
    
    // Apply date filter
    if (dateFilterValue !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(payment => {
        if (!payment.date || !payment.date.seconds) return false;
        
        const paymentDate = new Date(payment.date.seconds * 1000);
        
        if (dateFilterValue === 'today') {
          const paymentDay = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), paymentDate.getDate());
          return paymentDay.getTime() === today.getTime();
        } else if (dateFilterValue === 'week') {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(now.getDate() - 7);
          return paymentDate >= oneWeekAgo;
        } else if (dateFilterValue === 'month') {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(now.getMonth() - 1);
          return paymentDate >= oneMonthAgo;
        }
        
        return true;
      });
    }
    
    // Apply search filter
    if (searchTermValue.trim() !== '') {
      const term = searchTermValue.toLowerCase();
      
      filtered = filtered.filter(payment => {
        const customer = customers[payment.customerId];
        
        return (
          payment.id?.toLowerCase().includes(term) ||
          (customer?.name && customer.name.toLowerCase().includes(term)) ||
          (payment.notes && payment.notes.toLowerCase().includes(term))
        );
      });
    }
    
    setFilteredPayments(filtered);
  };
  
  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    applyFilters(payments, dateFilter, term, customerData);
  };
  
  // Handle date filter change
  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    applyFilters(payments, value, searchTerm, customerData);
  };
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return 'N/A';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return '';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString('en-US', {
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
  
  // Group payments by date
  const groupPaymentsByDate = () => {
    const groups = {};
    
    filteredPayments.forEach(payment => {
      if (!payment.date || !payment.date.seconds) return;
      
      const date = new Date(payment.date.seconds * 1000);
      const dateStr = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
      
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      
      groups[dateStr].push(payment);
    });
    
    // Sort dates in descending order
    return Object.keys(groups)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(date => ({
        date: new Date(date),
        payments: groups[date]
      }));
  };
  
  // Get total for a group
  const getGroupTotal = (payments) => {
    return payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Group payments by date
  const groupedPayments = groupPaymentsByDate();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Payment History</h1>
        
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
            placeholder="Search payments..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-9"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Period:</span>
          <Button 
            variant={dateFilter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleDateFilterChange('all')}
          >
            All Time
          </Button>
          <Button 
            variant={dateFilter === 'today' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleDateFilterChange('today')}
          >
            Today
          </Button>
          <Button 
            variant={dateFilter === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleDateFilterChange('week')}
          >
            Last 7 Days
          </Button>
          <Button 
            variant={dateFilter === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleDateFilterChange('month')}
          >
            Last 30 Days
          </Button>
        </div>
      </div>
      
      {filteredPayments.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <p className="text-lg text-muted-foreground">No payments found</p>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "Try adjusting your search query"
              : dateFilter !== 'all'
                ? `No payments recorded in the selected time period`
                : "No payments have been recorded yet"}
          </p>
          <Button 
            onClick={() => navigate('/payments/new')}
            variant="outline"
            className="mt-2"
          >
            Record your first payment
          </Button>
        </div>
      ) : (
        <>
          {/* Payment Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Collected</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(filteredPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0))}
                  </p>
                </div>
                
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Number of Payments</p>
                  <p className="text-xl font-bold">
                    {filteredPayments.length}
                  </p>
                </div>
                
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Average Payment</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(
                      filteredPayments.length > 0 
                      ? filteredPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0) / filteredPayments.length 
                      : 0
                    )}
                  </p>
                </div>
                
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Unique Customers</p>
                  <p className="text-xl font-bold">
                    {new Set(filteredPayments.map(p => p.customerId)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Grouped payment history */}
          <div className="space-y-6">
            {groupedPayments.map(group => (
              <Card key={group.date.toISOString()}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      {formatDate(
                        { seconds: group.date.getTime() / 1000 }
                      )}
                    </CardTitle>
                    <Badge variant="outline" className="font-normal">
                      {formatCurrency(getGroupTotal(group.payments))}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {group.payments.map(payment => (
                      <div 
                        key={payment.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-secondary/50 rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-background p-2 rounded-full">
                            <CreditCard className="h-4 w-4 text-green-500" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium">{formatCurrency(payment.amount)}</span>
                              <Badge variant="outline" className="text-xs">
                                {payment.id}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(payment.date)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <Link 
                                to={`/customers/${payment.customerId}`}
                                className="text-sm text-primary hover:underline"
                              >
                                {customerData[payment.customerId]?.name || 'Unknown Customer'}
                              </Link>
                              
                              {payment.notes && (
                                <span className="text-xs text-muted-foreground truncate max-w-md">
                                  - {payment.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex self-end sm:self-auto gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/payments/${payment.id}`)}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentHistoryView;