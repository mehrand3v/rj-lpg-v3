// src/components/dashboard/CylinderStatus.jsx
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

const CylinderStatus = ({ customers = [] }) => {
  const navigate = useNavigate();
  
  // Prepare chart data
  const chartData = customers.map(customer => ({
    name: customer.name.length > 15 
      ? `${customer.name.substring(0, 15)}...` 
      : customer.name,
    cylinders: customer.cylindersOutstanding,
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
          <p className="text-sm">Cylinders: {data.cylinders}</p>
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
          <CardTitle>Cylinder Status</CardTitle>
          <CardDescription>No customers have outstanding cylinders</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            All cylinders have been returned.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cylinder Status</CardTitle>
        <CardDescription>
          Top {customers.length} customers with outstanding cylinders
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
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={100}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="cylinders" 
              fill="var(--chart-3)" 
              onClick={(data) => navigate(`/customers/${data.id}`)}
              cursor="pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CylinderStatus;