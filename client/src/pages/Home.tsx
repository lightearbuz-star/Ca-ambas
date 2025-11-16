import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Users, Truck, Building2, Package, FileText, Clock, CheckCircle, AlertCircle, XCircle, Bell } from "lucide-react";
import { Link } from "wouter";
import { useMemo } from "react";

export default function Home() {
  const { user } = useAuth();
  const { data: motoristas = [] } = trpc.motoristas.list.useQuery();
  const { data: caminhoes = [] } = trpc.caminhoes.list.useQuery();
  const { data: clientes = [] } = trpc.clientes.list.useQuery();
  const { data: cacambas = [] } = trpc.cacambas.list.useQuery();
  const { data: pedidos = [] } = trpc.pedidos.list.useQuery();

  // Calcular status das caçambas
  const now = new Date();
  const cacambasStatus = useMemo(() => {
    return {
      nao_entregue: pedidos.filter((p: any) => p.status !== "entregue" && p.status !== "retirado").length,
      regular: pedidos.filter((p: any) => {
        const prazo = new Date(p.prazoVencimentoRetirada);
        return (p.status === "entregue" || p.status === "retirado") && prazo > now && (prazo.getTime() - now.getTime()) > 3 * 24 * 60 * 60 * 1000;
      }).length,
      alerta: pedidos.filter((p: any) => {
        const prazo = new Date(p.prazoVencimentoRetirada);
        return (p.status === "entregue" || p.status === "retirado") && prazo > now && (prazo.getTime() - now.getTime()) <= 3 * 24 * 60 * 60 * 1000;
      }).length,
      vencido: pedidos.filter((p: any) => {
        const prazo = new Date(p.prazoVencimentoRetirada);
        return (p.status === "entregue" || p.status === "retirado") && prazo < now;
      }).length,
    };
  }, [pedidos, now]);

  const stats = [
    {
      title: "Motoristas",
      value: motoristas.length,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Caminhões",
      value: caminhoes.length,
      icon: Truck,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Clientes",
      value: clientes.length,
      icon: Building2,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Caçambas",
      value: cacambas.length,
      icon: Package,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Pedidos",
      value: pedidos.length,
      icon: FileText,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header com KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status das Caçambas - Design conforme manual */}
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {/* Botão Sem Prazo */}
          <div className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md">
            <Bell className="w-5 h-5" />
            <span>Sem Prazo</span>
            <span className="bg-white text-purple-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
              0
            </span>
          </div>

          {/* Botão Novo Cliente */}
          <Link href="/clientes">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
              👤 NOVO CLIENTE
            </Button>
          </Link>

          {/* Botão Nova Locação */}
          <Link href="/pedidos">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
              📍 NOVA LOCAÇÃO
            </Button>
          </Link>
        </div>

        {/* Cards de Status - Layout em Grid com cores vibrantes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Não Entregue - Azul Ciano */}
          <Link href="/mapa?status=nao_entregue">
            <div className="bg-cyan-500 text-white rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow transform hover:scale-105">
              <div className="text-5xl font-bold mb-2">{cacambasStatus.nao_entregue}</div>
              <div className="text-lg font-semibold mb-3">Não Entregue</div>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <Clock className="w-4 h-4" />
                Ver Mais
              </div>
            </div>
          </Link>

          {/* Regular - Verde */}
          <Link href="/mapa?status=regular">
            <div className="bg-green-500 text-white rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow transform hover:scale-105">
              <div className="text-5xl font-bold mb-2">{cacambasStatus.regular}</div>
              <div className="text-lg font-semibold mb-3">Regular</div>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <CheckCircle className="w-4 h-4" />
                Ver Mais
              </div>
            </div>
          </Link>

          {/* Alerta - Amarelo/Laranja */}
          <Link href="/mapa?status=alerta">
            <div className="bg-yellow-500 text-white rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow transform hover:scale-105">
              <div className="text-5xl font-bold mb-2">{cacambasStatus.alerta}</div>
              <div className="text-lg font-semibold mb-3">Alerta</div>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <AlertCircle className="w-4 h-4" />
                Ver Mais
              </div>
            </div>
          </Link>

          {/* Vencido - Vermelho */}
          <Link href="/mapa?status=vencido">
            <div className="bg-red-500 text-white rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow transform hover:scale-105">
              <div className="text-5xl font-bold mb-2">{cacambasStatus.vencido}</div>
              <div className="text-lg font-semibold mb-3">Vencido</div>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <XCircle className="w-4 h-4" />
                Ver Mais
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Controle de Caçambas */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-6 h-6" />
            Controle de Cadastro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm opacity-90 mb-2">Caçambas Cadastradas</p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full bg-white bg-opacity-30 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full transition-all duration-300"
                    style={{ width: `${(cacambas.length / 50) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-semibold">{Math.round((cacambas.length / 50) * 100)}%</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">Caçambas: {cacambas.length}/50</p>
          </div>
        </CardContent>
      </Card>

      {/* Seções de Detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Últimos Pedidos</span>
              <Link href="/pedidos">
                <Button variant="ghost" size="sm">Ver Tudo</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pedidos.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum pedido registrado</p>
            ) : (
              <div className="space-y-2">
                {pedidos.slice(0, 5).map((pedido: any) => (
                  <div key={pedido.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{pedido.numeroPedido}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(pedido.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      pedido.status === "pendente" ? "bg-yellow-100 text-yellow-800" :
                      pedido.status === "em_andamento" ? "bg-blue-100 text-blue-800" :
                      pedido.status === "entregue" ? "bg-green-100 text-green-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {pedido.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Caçambas Disponíveis</span>
              <Link href="/cacambas">
                <Button variant="ghost" size="sm">Ver Tudo</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cacambas.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma caçamba registrada</p>
            ) : (
              <div className="space-y-2">
                {cacambas.filter((c: any) => c.statusDisponibilidade === "disponivel").slice(0, 5).map((cacamba: any) => (
                  <div key={cacamba.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{cacamba.identificacao}</p>
                      <p className="text-xs text-muted-foreground">{cacamba.tamanho}</p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      Disponível
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


