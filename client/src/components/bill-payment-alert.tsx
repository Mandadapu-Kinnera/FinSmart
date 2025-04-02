import React, { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Bell, AlertTriangle, X } from 'lucide-react';
import { Bill } from '@shared/schema';

interface BillPaymentAlertProps {
  bills: Bill[];
}

export function BillPaymentAlert({ bills }: BillPaymentAlertProps) {
  const [notifiedBills, setNotifiedBills] = useState<Record<number, boolean>>({});
  
  // Check bills that are due soon (within 3 days) or overdue
  useEffect(() => {
    if (!bills?.length) return;
    
    const alarmHours = 9; // Hour when alerts will be shown (9 AM)
    const nowHour = new Date().getHours();
    
    // Check that we're in the alert window (between 9-10 AM)
    // For demo purposes, we'll just show alerts any time
    // const isAlertWindow = nowHour >= alarmHours && nowHour < (alarmHours + 1);
    // if (!isAlertWindow) return;
    
    const checkDueBills = () => {
      const today = new Date();
      
      // Find bills that need notification
      bills.forEach(bill => {
        // Skip if already notified or paid
        if (notifiedBills[bill.id] || bill.isPaid) return;
        
        const dueDate = new Date(bill.dueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Alert for bills due within 3 days or overdue
        if (diffDays <= 3) {
          let title = '';
          let description = '';
          let variant: 'default' | 'destructive' = 'default';
          
          if (diffDays < 0) {
            // Overdue
            title = '⚠️ Bill Overdue!';
            description = `${bill.name} is overdue by ${Math.abs(diffDays)} days. Amount: $${bill.amount.toFixed(2)}`;
            variant = 'destructive';
          } else if (diffDays === 0) {
            // Due today
            title = '🔔 Bill Due Today!';
            description = `${bill.name} is due today. Amount: $${bill.amount.toFixed(2)}`;
            variant = 'destructive';
          } else {
            // Due soon
            title = '📅 Upcoming Bill';
            description = `${bill.name} is due in ${diffDays} days. Amount: $${bill.amount.toFixed(2)}`;
          }
          
          // Show toast notification with action buttons
          toast({
            title,
            description,
            variant,
            duration: 10000, // 10 seconds
            action: (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleMarkAsPaid(bill.id)}
                  className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Mark as Paid
                </button>
                <button 
                  onClick={() => handleDismiss(bill.id)}
                  className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ),
          });
          
          // Mark as notified to prevent duplicate notifications
          setNotifiedBills(prev => ({
            ...prev,
            [bill.id]: true
          }));
        }
      });
    };
    
    // Check immediately and then set up interval
    checkDueBills();
    
    // Reset notifications at midnight
    const resetNotifications = () => {
      setNotifiedBills({});
    };
    
    // Check for notifications daily
    const midnightToday = new Date();
    midnightToday.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnightToday.getTime() - Date.now();
    
    const resetTimer = setTimeout(resetNotifications, msUntilMidnight);
    
    return () => {
      clearTimeout(resetTimer);
    };
  }, [bills, notifiedBills]);
  
  const handleMarkAsPaid = (billId: number) => {
    // You'd implement the actual API call to mark bill as paid here
    // For now, we'll just log
    console.log(`Marking bill ${billId} as paid`);
    fetch(`/api/bills/${billId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isPaid: true }),
    })
      .then(response => response.json())
      .then(() => {
        toast({
          title: 'Bill marked as paid',
          description: 'The bill has been successfully marked as paid.',
        });
      })
      .catch(error => {
        console.error('Error marking bill as paid:', error);
        toast({
          title: 'Error',
          description: 'Failed to mark bill as paid.',
          variant: 'destructive',
        });
      });
  };
  
  const handleDismiss = (billId: number) => {
    // Just dismiss the notification
    console.log(`Dismissing bill notification for ${billId}`);
  };
  
  // This component doesn't render anything visible directly 
  // It just manages alert notifications
  return null;
}