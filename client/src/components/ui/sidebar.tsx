import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  Home, 
  BarChart3, 
  Wallet, 
  Target, 
  FileText, 
  Calendar, 
  Bell, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChartLine
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, label, active, onClick }: NavItemProps) {
  return (
    <li>
      <Link href={href} className={cn(
        "flex items-center px-3 py-2 rounded-lg",
        active 
          ? "text-primary bg-blue-50 dark:bg-gray-800 font-medium" 
          : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-primary"
      )}>
        {React.cloneElement(icon as React.ReactElement, { 
          className: "mr-3 h-5 w-5" 
        })}
        <span>{label}</span>
      </Link>
    </li>
  );
}

const navItems = [
  { group: "Smart Budgeting", items: [
    { href: "/", icon: <Home />, label: "Dashboard" },
    { href: "/transactions", icon: <BarChart3 />, label: "Transactions" },
    { href: "/budgets", icon: <Wallet />, label: "Budgets" },
    { href: "/goals", icon: <Target />, label: "Goals" },
  ]},
  { group: "Bills & Subscriptions", items: [
    { href: "/bills", icon: <FileText />, label: "Bills" },
    { href: "/subscriptions", icon: <Calendar />, label: "Subscriptions" },
  ]},
  { group: "Account", items: [
    { href: "/settings", icon: <Settings />, label: "Settings" },
    { href: "/help", icon: <HelpCircle />, label: "Help & Support" },
  ]},
];

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { logoutMutation, user } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Generate user initials from name or username
  const userInitials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.username?.substring(0, 2).toUpperCase() || 'U';
  
  const userDisplayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.username;

  return (
    <aside className={cn("w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 pt-6 pb-8 flex flex-col h-full", className)}>
      <div className="px-6 mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <ChartLine className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">FinSmart</h1>
        </div>
        <ThemeToggle />
      </div>
      
      <div className="flex-1 overflow-y-auto px-6">
        {navItems.map((group, index) => (
          <div key={index} className={index > 0 ? "mt-8" : ""}>
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{group.group}</h2>
            <ul className="mt-3 space-y-1">
              {group.items.map((item, idx) => (
                <NavItem
                  key={idx}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={item.href === location}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="px-6 mt-auto border-t border-gray-200 dark:border-gray-800 pt-4">
        <div className="flex items-center mb-4 p-2">
          <div className="h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center mr-3">
            <span>{userInitials}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{userDisplayName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log Out</span>
        </Button>
      </div>
    </aside>
  );
}
