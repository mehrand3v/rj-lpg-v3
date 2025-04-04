// src/pages/Reports.jsx
import { useState } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'; // Will be added via shadcn CLI
import { Button } from '@/components/ui/button'; // Will be added via shadcn CLI
import { 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  Mail, 
  CreditCard, 
  Package,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { useNotification } from '@/components/shared/NotificationSystem';

const reportTypes = [
  {
    id: 'sales',
    title: 'Sales Report',
    description: 'Generate a report of all sales transactions for a specific period',
    icon: <FileSpreadsheet className="h-10 w-10 text-blue-500" />,
    options: [
      { id: 'today', label: 'Today' },
      { id: 'week', label: 'This Week' },
      { id: 'month', label: 'This Month' },
      { id: 'custom', label: 'Custom Date Range' }
    ]
  },
  {
    id: 'payments',
    title: 'Payments Report',
    description: 'Generate a report of all payments received for a specific period',
    icon: <CreditCard className="h-10 w-10 text-green-500" />,
    options: [
      { id: 'today', label: 'Today' },
      { id: 'week', label: 'This Week' },
      { id: 'month', label: 'This Month' },
      { id: 'custom', label: 'Custom Date Range' }
    ]
  },
  {
    id: 'outstanding',
    title: 'Outstanding Balances',
    description: 'Generate a report of all customers with outstanding balances',
    icon: <FileText className="h-10 w-10 text-red-500" />
  },
  {
    id: 'cylinders',
    title: 'Cylinder Status',
    description: 'Generate a report of all customers with outstanding cylinders',
    icon: <Package className="h-10 w-10 text-amber-500" />
  },
  {
    id: 'customer',
    title: 'Customer Statement',
    description: 'Generate a detailed statement for a specific customer',
    icon: <FileText className="h-10 w-10 text-purple-500" />
  }
];

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [period, setPeriod] = useState('month');
  
  const notification = useNotification();
  
  // Handle report generation
  const handleGenerateReport = () => {
    if (!selectedReport) return;
    
    setLoading(true);
    
    // Simulate report generation
    setTimeout(() => {
      setLoading(false);
      notification.success('Report generated successfully');
      
      // In a real application, this would generate and download a PDF report
      // For now, just inform the user
      notification.info('In a production environment, this would generate a PDF report.');
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports and Invoices</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map(report => (
          <Card 
            key={report.id}
            onClick={() => setSelectedReport(report)}
            className={`cursor-pointer hover:border-primary transition-colors ${
              selectedReport?.id === report.id ? 'border-primary' : ''
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                {report.icon}
                {selectedReport?.id === report.id && (
                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                )}
              </div>
              <CardTitle>{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      
      {selectedReport && (
        <Card>
          <CardHeader>
            <CardTitle>Generate {selectedReport.title}</CardTitle>
            <CardDescription>
              Configure report settings and download
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedReport.options && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Select Time Period</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedReport.options.map(option => (
                    <Button
                      key={option.id}
                      variant={period === option.id ? 'default' : 'outline'}
                      onClick={() => setPeriod(option.id)}
                      size="sm"
                    >
                      {option.id === 'custom' && <Calendar className="h-4 w-4 mr-2" />}
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {selectedReport.id === 'customer' && (
              <div className="space-y-4 mt-4">
                <h3 className="text-sm font-medium">Select Customer</h3>
                <p className="text-sm text-muted-foreground">
                  In a real implementation, this would show a customer dropdown
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Button>
            </div>
            
            <Button 
              onClick={handleGenerateReport}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default Reports;