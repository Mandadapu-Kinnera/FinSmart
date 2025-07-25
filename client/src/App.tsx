import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Budgets from "@/pages/budgets";
import Goals from "@/pages/goals";
import Bills from "@/pages/bills";
import Subscriptions from "@/pages/subscriptions";
import Settings from "@/pages/settings";
import Help from "@/pages/help";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/transactions" component={Transactions} />
      <ProtectedRoute path="/budgets" component={Budgets} />
      <ProtectedRoute path="/goals" component={Goals} />
      <ProtectedRoute path="/bills" component={Bills} />
      <ProtectedRoute path="/subscriptions" component={Subscriptions} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/help" component={Help} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
