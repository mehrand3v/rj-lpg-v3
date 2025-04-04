// src/components/sales/TransactionsList.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSalesForCustomer } from '@/services/salesService';
import { getPaymentsForCustomer } from '@/services/paymentService';
import { useNotification } from '@/components/shared/NotificationSystem';
import { Button } from '@/components/ui/button'; // Will be added via shadcn CLI
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Scale, 
  CreditCard, 
  Clock, 
  CheckCircle,
  RefreshCw
} from 'lucide-react';

const TransactionsList = ({ customerId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const notification = useNotification();
  
  // Load transactions for customer
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        
        // Load both sales and payments
        const [sales, payments] = await Promise.all([
          getSalesForCustomer(customerId),
          getPaymentsForCustomer(customerId)
        ]);
        
        // Combine and sort transactions by date
        const allTransactions = [
          ...sales.map(sale => ({ ...sale, transactionType: 'sale' })),
          ...payments.map(payment => ({ ...payment, transactionType: 'payment' }))
        ].sort((a, b) => {
          // Sort by date descending (newest first)
          const dateA = a.date?.seconds || 0;
          const dateB = b.date?.seconds || 0;
          return dateB - dateA;
        });
        
        setTransactions(allTransactions);
        setLoading(false);
      } catch (error) {
        notification.error('Failed to load transactions');
        console.error('Error loading transactions:', error);
        setLoading(false);
      }
    };
    
    if (customerId) {
      loadTransactions();
    }
  }, [customerId]);
  
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
  
  // Render transaction icon
  const renderIcon = (transaction) => {
    if (transaction.transactionType === 'payment') {
      return <CreditCard className="h-5 w-5 text-green-500" />;
    } else if (transaction.type === 'cylinder') {
      return <Package className="h-5 w-5 text-blue-500" />;
    } else {
      return <Scale className="h-5 w-5 text-purple-500" />;
    }
  };
  
  // Render transaction status badge
  const renderStatus = (transaction) => {
    if (transaction.transactionType === 'payment') {
      return (
        <Badge variant="default" className="bg-green-500">
          Payment
        </Badge>
      );
    } else if (transaction.status === 'completed') {
      return (
        <Badge variant="default" className="bg-blue-500">
          Completed
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-500">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
  };
  
  // Render transaction details
  const renderDetails = (transaction) => {
    if (transaction.transactionType === 'payment') {
      return `Payment of $${transaction.amount.toFixed(2)}`;
    } else if (transaction.type === 'cylinder') {
      return `${transaction.cylindersDelivered} cylinders at $${transaction.rate.toFixed(2)} each`;
    } else {
      return `${transaction.weight.toFixed(2)} kg at $${transaction.rate.toFixed(2)} per kg`;
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Render empty state
  if (transactions.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-lg text-muted-foreground mb-4">No transactions found</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button 
            onClick={() => navigate(`/sales/new?customer=${customerId}`)}
            variant="default"
          >
            Record a Sale
          </Button>
          <Button 
            onClick={() => navigate(`/payments/new?customer=${customerId}`)}
            variant="outline"
          >
            Record a Payment
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Transaction History</h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate(`/sales/new?customer=${customerId}`)}
            size="sm"
            variant="outline"
          >
            New Sale
          </Button>
          <Button 
            onClick={() => navigate(`/payments/new?customer=${customerId}`)}
            size="sm"
            variant="outline"
          >
            New Payment
          </Button>
        </div>
      </div>
      
      <div className="bg-card rounded-lg overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Details</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-secondary/50">
                  <td className="px-4 py-3 text-sm">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">
                    {transaction.id}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      {renderIcon(transaction)}
                      <span>
                        {transaction.transactionType === 'payment' 
                          ? 'Payment' 
                          : transaction.type === 'cylinder' 
                            ? 'Cylinder' 
                            : 'Weight'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {renderDetails(transaction)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    <span className={transaction.transactionType === 'payment' ? 'text-green-500' : ''}>
                    ${Math.round(transaction.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {renderStatus(transaction)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link 
                      to={`/${transaction.transactionType === 'payment' ? 'payments' : 'sales'}/${transaction.id}`}
                      className="text-primary hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsList;