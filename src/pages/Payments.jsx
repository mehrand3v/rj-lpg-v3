// src/pages/Payments.jsx
import { useState } from 'react';
import CustomerPaymentsView from '@/components/payments/CustomerPaymentsView';
import PaymentHistoryView from '@/components/payments/PaymentHistoryView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard,
  Clock
} from 'lucide-react';

const Payments = () => {
  const [activeTab, setActiveTab] = useState('customers');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="customers" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Outstanding Balances
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Payment History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="mt-0">
          <CustomerPaymentsView />
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <PaymentHistoryView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Payments;