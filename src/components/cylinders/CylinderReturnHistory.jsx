// src/components/cylinders/CylinderReturnHistory.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCylinderReturnHistory } from '@/services/cylinderService';
import { useNotification } from '@/components/shared/NotificationSystem';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  Package, 
  Calendar,
  RefreshCw,
  ArrowDown,
  FileText
} from 'lucide-react';

const CylinderReturnHistory = ({ customerId, customerName }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const notification = useNotification();
  
  useEffect(() => {
    // Load cylinder return history for the selected customer
    const loadHistory = async () => {
      if (!customerId) return;
      
      try {
        setLoading(true);
        const historyData = await getCylinderReturnHistory(customerId);
        setHistory(historyData);
        setLoading(false);
      } catch (error) {
        notification.error('Failed to load cylinder return history');
        console.error('Error loading cylinder history:', error);
        setLoading(false);
      }
    };
    
    loadHistory();
  }, [customerId]);
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  // Handle the case where history data needs to be implemented
  if (!Array.isArray(history) || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-amber-500" />
            Cylinder Return History: {customerName || 'Selected Customer'}
          </CardTitle>
          <CardDescription>
            View the history of cylinder returns for this customer
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <p className="text-muted-foreground mb-2">No return history found</p>
          <p className="text-xs text-muted-foreground mb-4">
            This customer has not returned any cylinders yet or the history is unavailable.
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/cylinders/returns?customer=${customerId}`)}
            size="sm"
            className="gap-2"
          >
            <Package className="h-4 w-4" />
            Record Cylinder Returns
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-amber-500" />
          Cylinder Return History: {customerName || 'Selected Customer'}
        </CardTitle>
        <CardDescription>
          View the history of cylinder returns for this customer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((entry, index) => (
            <div 
              key={index} 
              className="bg-secondary p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ArrowDown className="h-4 w-4 text-green-500" />
                  <span className="font-medium">
                    {entry.cylindersReturned} cylinders returned
                  </span>
                  <Badge className="ml-1">
                    {entry.status || 'completed'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(entry.date)}
                </div>
                {entry.notes && (
                  <p className="text-sm mt-2">{entry.notes}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Balance after return</div>
                <div className="font-medium text-amber-500">
                  {entry.cylindersOutstanding} cylinders remaining
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CylinderReturnHistory;