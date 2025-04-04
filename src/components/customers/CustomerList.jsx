// src/components/customers/CustomerList.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getAllCustomers, 
  searchCustomers 
} from '@/services/customerService';
import { useNotification } from '@/components/shared/NotificationSystem';
import { Button } from '@/components/ui/button'; // Will be added via shadcn CLI
import { Input } from '@/components/ui/input'; // Will be added via shadcn CLI
import { Badge } from '@/components/ui/badge';
import { Plus, Search, RefreshCw } from 'lucide-react';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(false);
  
  const navigate = useNavigate();
  const notification = useNotification();
  
  // Load customers
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomers(includeInactive);
      setCustomers(data);
      setFilteredCustomers(data);
      setLoading(false);
    } catch (error) {
      notification.error('Failed to load customers');
      console.error('Error loading customers:', error);
      setLoading(false);
    }
  };
  
  // Load data on mount and when includeInactive changes
  useEffect(() => {
    loadCustomers();
  }, [includeInactive]);
  
  // Handle search
  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredCustomers(customers);
      return;
    }
    
    try {
      const results = await searchCustomers(term);
      setFilteredCustomers(results);
    } catch (error) {
      notification.error('Search failed');
      console.error('Search error:', error);
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
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Customers</h1>
        
        <Button 
          onClick={() => navigate('/customers/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Customer</span>
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
          <input
            type="checkbox"
            id="include-inactive"
            checked={includeInactive}
            onChange={() => setIncludeInactive(!includeInactive)}
            className="rounded border-border"
          />
          <label htmlFor="include-inactive" className="text-sm text-muted-foreground">
            Show inactive customers
          </label>
        </div>
      </div>
      
      {filteredCustomers.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <p className="text-lg text-muted-foreground">No customers found</p>
          <Button 
            onClick={() => navigate('/customers/new')}
            variant="outline"
            className="mt-4"
          >
            Add your first customer
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-lg overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Balance</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Cylinders</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-secondary/50">
                    <td className="px-4 py-3 text-sm">
                      <Link 
                        to={`/customers/${customer.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {customer.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">{customer.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {customer.outstandingBalance > 0 ? (
                        <span className="text-destructive font-medium">
                          ${customer.outstandingBalance.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-green-500">Paid</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {customer.cylindersOutstanding > 0 ? (
                        <span className="text-amber-500 font-medium">
                          {customer.cylindersOutstanding} outstanding
                        </span>
                      ) : (
                        <span>None</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge 
                        variant={customer.status === 'active' ? 'default' : 'secondary'}
                      >
                        {customer.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/customers/${customer.id}`)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/customers/edit/${customer.id}`)}
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

export default CustomerList;