import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

type StatusFiltro = "todos" | "recebido" | "a_receber" | "vencido";

interface ContaReceber {
  id: number;
  pedidoId: number;
  numeroPedido: string;
  cliente: string;
  valor: number;
  dataVencimento: Date;
  dataRecebimento?: Date;
  status: "recebido" | "a_receber" | "vencido";
  formaPagamento?: string;
}

export default function ContasReceber() {
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("todos");
  const [clienteFiltro, setClienteFiltro] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<ContaReceber | null>(null);

  const { data: pedidos = [] } = trpc.pedidos.list.useQuery();
  const { data: clientes = [] } = trpc.clientes.list.useQuery();

  // Simular contas a receber baseado em pedidos
  const contasReceber = useMemo(() => {
    const now = new Date();
    return pedidos.map((pedido: any) => {
      const cliente = clientes.find((c: any) => c.id === pedido.clienteId);
      const dataVencimento = new Date(pedido.prazoVencimentoRetirada);
      let status: "recebido" | "a_receber" | "vencido" = "a_receber";

      if (pedido.status === "faturado") {
        status = "recebido";
      } else if (dataVencimento < now) {
        status = "vencido";
      }

      return {
        id: pedido.id,
        pedidoId: pedido.id,
        numeroPedido: pedido.numeroPedido,
        cliente: cliente?.razaoSocial || "Cliente desconhecido",
        valor: parseFloat(pedido.valorLocacaoReais || 0),
        dataVencimento,
        dataRecebimento: pedido.status === "faturado" ? new Date() : undefined,
        status,
        formaPagamento: "Não informado",
      };
    });
  }, [pedidos, clientes]);

  const filteredContas = useMemo(() => {
    return contasReceber.filter((conta) => {
      const statusMatch = statusFiltro === "todos" || conta.status === statusFiltro;
      const clienteMatch = !clienteFiltro || conta.cliente.toLowerCase().includes(clienteFiltro.toLowerCase());
      return statusMatch && clienteMatch;
    });
  }, [contasReceber, statusFiltro, clienteFiltro]);

  const totais = {
    recebido: contasReceber
      .filter((c) => c.status === "recebido")
      .reduce((sum, c) => sum + c.valor, 0),
    a_receber: contasReceber
      .filter((c) => c.status === "a_receber")
      .reduce((sum, c) => sum + c.valor, 0),
    vencido: contasReceber
      .filter((c) => c.status === "vencido")
      .reduce((sum, c) => sum + c.valor, 0),
  };

  const handleMarcarRecebido = (conta: ContaReceber) => {
    setSelectedConta({ ...conta, status: "recebido", dataRecebimento: new Date() });
    setOpen(true);
  };

  const handleSalvar = () => {
    if (selectedConta) {
      toast.success(`Conta ${selectedConta.numeroPedido} marcada como recebida`);
      setOpen(false);
      setSelectedConta(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contas a Receber</h1>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Recebido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">R$ {totais.recebido.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {contasReceber.filter((c) => c.status === "recebido").length} parcelas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">A Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">R$ {totais.a_receber.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {contasReceber.filter((c) => c.status === "a_receber").length} parcelas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Vencido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">R$ {totais.vencido.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {contasReceber.filter((c) => c.status === "vencido").length} parcelas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="cliente-filtro">Cliente</Label>
            <Input
              id="cliente-filtro"
              placeholder="Buscar por cliente..."
              value={clienteFiltro}
              onChange={(e) => setClienteFiltro(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="status-filtro">Status</Label>
            <Select value={statusFiltro} onValueChange={(value: any) => setStatusFiltro(value)}>
              <SelectTrigger id="status-filtro">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="recebido">Recebido</SelectItem>
                <SelectItem value="a_receber">A Receber</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabelas por Status */}
      <Tabs defaultValue="todos" className="w-full">
        <TabsList>
          <TabsTrigger value="todos">Todos ({filteredContas.length})</TabsTrigger>
          <TabsTrigger value="recebido">Recebido ({contasReceber.filter((c) => c.status === "recebido").length})</TabsTrigger>
          <TabsTrigger value="a_receber">A Receber ({contasReceber.filter((c) => c.status === "a_receber").length})</TabsTrigger>
          <TabsTrigger value="vencido">Vencido ({contasReceber.filter((c) => c.status === "vencido").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-2">Pedido</th>
                      <th className="text-left py-2 px-2">Cliente</th>
                      <th className="text-left py-2 px-2">Valor</th>
                      <th className="text-left py-2 px-2">Vencimento</th>
                      <th className="text-left py-2 px-2">Status</th>
                      <th className="text-left py-2 px-2">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContas.length > 0 ? (
                      filteredContas.map((conta) => (
                        <tr key={conta.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2 font-medium">{conta.numeroPedido}</td>
                          <td className="py-2 px-2">{conta.cliente}</td>
                          <td className="py-2 px-2 font-semibold">R$ {conta.valor.toFixed(2)}</td>
                          <td className="py-2 px-2">{conta.dataVencimento.toLocaleDateString("pt-BR")}</td>
                          <td className="py-2 px-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              conta.status === "recebido" ? "bg-green-100 text-green-800" :
                              conta.status === "a_receber" ? "bg-blue-100 text-blue-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {conta.status === "recebido" ? "Recebido" : conta.status === "a_receber" ? "A Receber" : "Vencido"}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            {conta.status !== "recebido" && (
                              <Button size="sm" onClick={() => handleMarcarRecebido(conta)}>
                                Marcar Recebido
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhuma conta encontrada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recebido">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-2">Pedido</th>
                      <th className="text-left py-2 px-2">Cliente</th>
                      <th className="text-left py-2 px-2">Valor</th>
                      <th className="text-left py-2 px-2">Data Recebimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contasReceber.filter((c) => c.status === "recebido").map((conta) => (
                      <tr key={conta.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 font-medium">{conta.numeroPedido}</td>
                        <td className="py-2 px-2">{conta.cliente}</td>
                        <td className="py-2 px-2 font-semibold">R$ {conta.valor.toFixed(2)}</td>
                        <td className="py-2 px-2">{conta.dataRecebimento?.toLocaleDateString("pt-BR") || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="a_receber">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-2">Pedido</th>
                      <th className="text-left py-2 px-2">Cliente</th>
                      <th className="text-left py-2 px-2">Valor</th>
                      <th className="text-left py-2 px-2">Vencimento</th>
                      <th className="text-left py-2 px-2">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contasReceber.filter((c) => c.status === "a_receber").map((conta) => (
                      <tr key={conta.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 font-medium">{conta.numeroPedido}</td>
                        <td className="py-2 px-2">{conta.cliente}</td>
                        <td className="py-2 px-2 font-semibold">R$ {conta.valor.toFixed(2)}</td>
                        <td className="py-2 px-2">{conta.dataVencimento.toLocaleDateString("pt-BR")}</td>
                        <td className="py-2 px-2">
                          <Button size="sm" onClick={() => handleMarcarRecebido(conta)}>
                            Marcar Recebido
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vencido">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-2">Pedido</th>
                      <th className="text-left py-2 px-2">Cliente</th>
                      <th className="text-left py-2 px-2">Valor</th>
                      <th className="text-left py-2 px-2">Vencimento</th>
                      <th className="text-left py-2 px-2">Dias Vencido</th>
                      <th className="text-left py-2 px-2">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contasReceber.filter((c) => c.status === "vencido").map((conta) => {
                      const diasVencido = Math.floor(
                        (new Date().getTime() - conta.dataVencimento.getTime()) / (1000 * 60 * 60 * 24)
                      );
                      return (
                        <tr key={conta.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2 font-medium">{conta.numeroPedido}</td>
                          <td className="py-2 px-2">{conta.cliente}</td>
                          <td className="py-2 px-2 font-semibold">R$ {conta.valor.toFixed(2)}</td>
                          <td className="py-2 px-2">{conta.dataVencimento.toLocaleDateString("pt-BR")}</td>
                          <td className="py-2 px-2 font-semibold text-red-600">{diasVencido} dias</td>
                          <td className="py-2 px-2">
                            <Button size="sm" onClick={() => handleMarcarRecebido(conta)}>
                              Marcar Recebido
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para marcar como recebido */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Marcar Conta como Recebida</DialogTitle>
          </DialogHeader>

          {selectedConta && (
            <div className="space-y-4">
              <div>
                <Label>Pedido</Label>
                <p className="font-medium">{selectedConta.numeroPedido}</p>
              </div>
              <div>
                <Label>Cliente</Label>
                <p className="font-medium">{selectedConta.cliente}</p>
              </div>
              <div>
                <Label>Valor</Label>
                <p className="font-medium">R$ {selectedConta.valor.toFixed(2)}</p>
              </div>
              <div>
                <Label htmlFor="data-recebimento">Data de Recebimento</Label>
                <Input
                  id="data-recebimento"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <Label htmlFor="forma-pagamento">Forma de Pagamento</Label>
                <Select defaultValue="dinheiro">
                  <SelectTrigger id="forma-pagamento">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleSalvar} className="flex-1">
                  Confirmar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
