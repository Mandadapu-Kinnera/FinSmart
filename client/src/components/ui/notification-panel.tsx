import { useState, useEffect } from "react";
import { X, Bell, PiggyBank, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: React.ReactNode;
  read: boolean;
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Budget Alert",
      message: "You've reached 85% of your Dining budget for this month.",
      time: "2 hours ago",
      icon: <Bell className="text-primary" />,
      read: false
    },
    {
      id: "2",
      title: "Savings Goal Progress",
      message: "You're 70% of the way to your Vacation savings goal!",
      time: "Yesterday",
      icon: <PiggyBank className="text-green-600" />,
      read: false
    },
    {
      id: "3",
      title: "Bill Due Soon",
      message: "Your electricity bill of $87.50 is due in 5 days.",
      time: "2 days ago",
      icon: <Receipt className="text-red-600" />,
      read: false
    }
  ]);

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true
      }))
    );
  };

  // Mark a single notification as read
  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Handle ESC key press to close the panel
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Prevent body scrolling when panel is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50">
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-primary text-white">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <Bell className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 ${notification.read ? 'opacity-70' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-10 w-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                        {notification.icon}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium text-gray-900">{notification.title}</p>
                        {!notification.read && (
                          <span className="h-2 w-2 ml-2 bg-primary rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t border-gray-200">
          <Button 
            variant="ghost" 
            className="w-full text-primary" 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
        </div>
      </div>
    </div>
  );
}
