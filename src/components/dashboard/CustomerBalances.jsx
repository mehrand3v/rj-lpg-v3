// src/components/dashboard/CustomerBalances.jsx
import { useNavigate } from 'react-router-dom';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'; // Will be added via shadcn CLI
import { Button } from '@/components/ui/button'; // Will be added via shadcn CLI
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const CustomerBalances = ({ customers = [] }) => {
  const navigate = useNavigate();
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0, // Don't show decimal places
      maximumFractionDigits: 0  // Don't show decimal places
    }).format(Math.round(amount));
  };
  
  // Prepare chart data
  const chartData = customers.map(customer => ({
    name: customer.name.length > 15 
      ? `${customer.name.substring(0, 15)}...` 
      : customer.name,
    balance: customer.outstandingBalance,
    fullName: customer.name,
    id: customer.id
  }));
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border p-3 rounded-md shadow-md">
          <p className="font-medium">{data.fullName}</p>
          <p className="text-sm">Balance: {formatCurrency(data.balance)}</p>
        </div>
      );
    }
    return null;
  };
  
  // Render empty state if no data
  if (customers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Balances</CardTitle>
          <CardDescription>No customers have outstanding balances</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            All customers are up to date with their payments.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Outstanding Balances</CardTitle>
        <CardDescription>
          Top {customers.length} customers with highest balances
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis 
              type="number" 
              tickFormatter={(value) => formatCurrency(value)}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={100}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="balance" 
              fill="var(--chart-1)" 
              onClick={(data) => navigate(`/customers/${data.id}`)}
              cursor="pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CustomerBalances;