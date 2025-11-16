import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Truck, 
  Building2, 
  Package, 
  FileText, 
  Map, 
  Wrench,
  BarChart3,
  LogOut,
  Menu,
  X,
  MapPin,
  DollarSign
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { APP_TITLE, APP_LOGO } from "@/const";

const navItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/motoristas", label: "Motoristas", icon: Users },
  { href: "/caminhoes", label: "Caminhões", icon: Truck },
  { href: "/clientes", label: "Clientes", icon: Building2 },
  { href: "/cacambas", label: "Caçambas", icon: Package },
  { href: "/pedidos", label: "Pedidos", icon: FileText },
  { href: "/rotas", label: "Rotas", icon: Map },
  { href: "/transacoes", label: "Transações", icon: BarChart3 },
  { href: "/manutencoes", label: "Manutenções", icon: Wrench },
  { href: "/mapa", label: "Mapa Operacional", icon: Map },
  { href: "/contas-receber", label: "Contas a Receber", icon: BarChart3 },
  { href: "/contas-pagar", label: "Contas a Pagar", icon: BarChart3 },
];

export function DashboardNav() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-background border-b border-border z-50 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="w-8 h-8" />}
          <span className="font-bold text-sm">{APP_TITLE}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-background border-r border-border flex flex-col transition-transform lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } lg:z-0 z-40 pt-20 lg:pt-0`}>
        {/* Logo Section */}
        <div className="hidden lg:flex items-center gap-3 px-6 py-6 border-b border-border">
          {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="w-10 h-10" />}
          <div className="flex-1">
            <h1 className="font-bold text-lg">{APP_TITLE}</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-border p-4 space-y-3">
          <div className="text-sm">
            <p className="text-muted-foreground">Logado como:</p>
            <p className="font-semibold">{user?.name || "Usuário"}</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
