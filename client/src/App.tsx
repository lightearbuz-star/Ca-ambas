import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import { DashboardNav } from "./components/DashboardNav";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Motoristas from "./pages/Motoristas";
import Caminhoes from "./pages/Caminhoes";
import Clientes from "./pages/Clientes";
import Cacambas from "./pages/Cacambas";
import Pedidos from "./pages/Pedidos";
import Rotas from "./pages/Rotas";
import Transacoes from "./pages/Transacoes";
import Manutencoes from "./pages/Manutencoes";
import MapaOperacional from "./pages/MapaOperacional";
import ContasReceber from "./pages/ContasReceber";
import ContasPagar from "./pages/ContasPagar";
import { Loader2 } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/motoristas"} component={Motoristas} />
      <Route path={"/caminhoes"} component={Caminhoes} />
      <Route path={"/clientes"} component={Clientes} />
      <Route path={"/cacambas"} component={Cacambas} />
      <Route path={"/pedidos"} component={Pedidos} />
      <Route path={"/rotas"} component={Rotas} />
      <Route path={"/transacoes"} component={Transacoes} />
      <Route path={"/manutencoes"} component={Manutencoes} />
      <Route path={"/mapa"} component={MapaOperacional} />
      <Route path={"/contas-receber"} component={ContasReceber} />
      <Route path={"/contas-pagar"} component={ContasPagar} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Router />;
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardNav />
      <main className="flex-1 overflow-y-auto lg:ml-64 pt-20 lg:pt-0">
        <div className="p-6">
          <Router />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
