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

type StatusFiltro = "todos" | "pago" | "a_pagar" | "vencido";

interface ContaPagar {
  id: number;
  fornecedor: string;
  descricao: string;
  valor: number;
  dataVencimento: Date;
  dataPagamento?: Date;
  status: "pago" | "a_pagar" | "vencido";
  formaPagamento?: string;
  categoria: string;
}

export default function ContasPagar() {
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("todos");
  const [fornecedorFiltro, setFornecedorFiltro] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<ContaPagar | null>(null);

  const { data: manutencoes = [] } = trpc.manutencoes.list.useQuery();

  // Simular contas a pagar baseado em manutenções e transações
  const contasPagar = useMemo(() => {
    const now = new Date();
    const contas: ContaPagar[] = [];

    // Adicionar contas de manutenção
    manutencoes.forEach((manutencao: any) => {
      if (manutencao.custoReais) {
        const dataVencimento = new Date(manutencao.dataPrevista || new Date());
        let status: "pago" | "a_pagar" | "vencido" = "a_pagar";

        if (manutencao.status === "realizada") {
          status = "pago";
        } else if (dataVencimento < now) {
          status = "vencido";
        }

        contas.push({
          id: manutencao.id,
          fornecedor: "Fornecedor de Manutenção",
          descricao: manutencao.descricao,
          valor: parseFloat(manutencao.custoReais || 0),
          dataVencimento,
          dataPagamento: manutencao.status === "realizada" ? new Date() : undefined,
          status,
          categoria: "Manutenção",
        });
      }
    });

    // Adicionar algumas contas de exemplo
    const exemplos = [
      {
        id: 1001,
        fornecedor: "Combustível ABC",
        descricao: "Combustível - Mês de Novembro",
        valor: 1500.0,
        dataVencimento: new Date(2025, 10, 20),
        status: "a_pagar" as const,
        categoria: "Combustível",
      },
      {
        id: 1002,
        fornecedor: "Seguro Transportes",
        descricao: "Seguro Frota - Novembro",
        valor: 800.0,
        dataVencimento: new Date(2025, 10, 5),
        status: "vencido" as const,
        categoria: "Seguro",
      },
      {
        id: 1003,
        fornecedor: "Aluguel Garagem",
        descricao: "Aluguel - Novembro",
        valor: 2000.0,
        dataVencimento: new Date(2025, 10, 1),
        status: "pago" as const,
        dataPagamento: new Date(2025, 10, 1),
        categoria: "Aluguel",
      },
    ];

    return [...contas, ...exemplos];
  }, [manutencoes]);

  const filteredContas = useMemo(() => {
    return contasPagar.filter((conta) => {
      const statusMatch = statusFiltro === "todos" || conta.status === statusFiltro;
      const fornecedorMatch = !fornecedorFiltro || conta.fornecedor.toLowerCase().includes(fornecedorFiltro.toLowerCase());
      return statusMatch && fornecedorMatch;
    });
  }, [contasPagar, statusFiltro, fornecedorFiltro]);

  const totais = {
    pago: contasPagar
      .filter((c) => c.status === "pago")
      .reduce((sum, c) => sum + c.valor, 0),
    a_pagar: contasPagar
      .filter((c) => c.status === "a_pagar")
      .reduce((sum, c) => sum + c.valor, 0),
    vencido: contasPagar
      .filter((c) => c.status === "vencido")
      .reduce((sum, c) => sum + c.valor, 0),
  };

  const handleMarcarPago = (conta: ContaPagar) => {
    setSelectedConta({ ...conta, status: "pago", dataPagamento: new Date() });
    setOpen(true);
  };

  const handleSalvar = () => {
    if (selectedConta) {
      toast.success(`Conta de ${selectedConta.fornecedor} marcada como paga`);
      setOpen(false);
      setSelectedConta(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contas a Pagar</h1>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">R$ {totais.pago.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {contasPagar.filter((c) => c.status === "pago").length} contas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">A Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">R$ {totais.a_pagar.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {contasPagar.filter((c) => c.status === "a_pagar").length} contas
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
              {contasPagar.filter((c) => c.status === "vencido").length} contas
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
            <Label htmlFor="fornecedor-filtro">Fornecedor</Label>
            <Input
              id="fornecedor-filtro"
              placeholder="Buscar por fornecedor..."
              value={fornecedorFiltro}
              onChange={(e) => setFornecedorFiltro(e.target.value)}
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
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="a_pagar">A Pagar</SelectItem>
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
          <TabsTrigger value="pago">Pago ({contasPagar.filter((c) => c.status === "pago").length})</TabsTrigger>
          <TabsTrigger value="a_pagar">A Pagar ({contasPagar.filter((c) => c.status === "a_pagar").length})</TabsTrigger>
          <TabsTrigger value="vencido">Vencido ({contasPagar.filter((c) => c.status === "vencido").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-2">Fornecedor</th>
                      <th className="text-left py-2 px-2">Descrição</th>
                      <th className="text-left py-2 px-2">Categoria</th>
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
                          <td className="py-2 px-2 font-medium">{conta.fornecedor}</td>
                          <td className="py-2 px-2">{conta.descricao}</td>
                          <td className="py-2 px-2 text-xs">{conta.categoria}</td>
                          <td className="py-2 px-2 font-semibold">R$ {conta.valor.toFixed(2)}</td>
                          <td className="py-2 px-2">{conta.dataVencimento.toLocaleDateString("pt-BR")}</td>
                          <td className="py-2 px-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              conta.status === "pago" ? "bg-green-100 text-green-800" :
                              conta.status === "a_pagar" ? "bg-orange-100 text-orange-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {conta.status === "pago" ? "Pago" : conta.status === "a_pagar" ? "A Pagar" : "Vencido"}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            {conta.status !== "pago" && (
                              <Button size="sm" onClick={() => handleMarcarPago(conta)}>
                                Marcar Pago
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground">
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

        <TabsContent value="pago">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-2">Fornecedor</th>
                      <th className="text-left py-2 px-2">Descrição</th>
                      <th className="text-left py-2 px-2">Valor</th>
                      <th className="text-left py-2 px-2">Data Pagamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contasPagar.filter((c) => c.status === "pago").map((conta) => (
                      <tr key={conta.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 font-medium">{conta.fornecedor}</td>
                        <td className="py-2 px-2">{conta.descricao}</td>
                        <td className="py-2 px-2 font-semibold">R$ {conta.valor.toFixed(2)}</td>
                        <td className="py-2 px-2">{conta.dataPagamento?.toLocaleDateString("pt-BR") || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="a_pagar">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-2">Fornecedor</th>
                      <th className="text-left py-2 px-2">Descrição</th>
                      <th className="text-left py-2 px-2">Valor</th>
                      <th className="text-left py-2 px-2">Vencimento</th>
                      <th className="text-left py-2 px-2">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contasPagar.filter((c) => c.status === "a_pagar").map((conta) => (
                      <tr key={conta.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 font-medium">{conta.fornecedor}</td>
                        <td className="py-2 px-2">{conta.descricao}</td>
                        <td className="py-2 px-2 font-semibold">R$ {conta.valor.toFixed(2)}</td>
                        <td className="py-2 px-2">{conta.dataVencimento.toLocaleDateString("pt-BR")}</td>
                        <td className="py-2 px-2">
                          <Button size="sm" onClick={() => handleMarcarPago(conta)}>
                            Marcar Pago
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
                      <th className="text-left py-2 px-2">Fornecedor</th>
                      <th className="text-left py-2 px-2">Descrição</th>
                      <th className="text-left py-2 px-2">Valor</th>
                      <th className="text-left py-2 px-2">Vencimento</th>
                      <th className="text-left py-2 px-2">Dias Vencido</th>
                      <th className="text-left py-2 px-2">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contasPagar.filter((c) => c.status === "vencido").map((conta) => {
                      const diasVencido = Math.floor(
                        (new Date().getTime() - conta.dataVencimento.getTime()) / (1000 * 60 * 60 * 24)
                      );
                      return (
                        <tr key={conta.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2 font-medium">{conta.fornecedor}</td>
                          <td className="py-2 px-2">{conta.descricao}</td>
                          <td className="py-2 px-2 font-semibold">R$ {conta.valor.toFixed(2)}</td>
                          <td className="py-2 px-2">{conta.dataVencimento.toLocaleDateString("pt-BR")}</td>
                          <td className="py-2 px-2 font-semibold text-red-600">{diasVencido} dias</td>
                          <td className="py-2 px-2">
                            <Button size="sm" onClick={() => handleMarcarPago(conta)}>
                              Marcar Pago
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

      {/* Dialog para marcar como pago */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Marcar Conta como Paga</DialogTitle>
          </DialogHeader>

          {selectedConta && (
            <div className="space-y-4">
              <div>
                <Label>Fornecedor</Label>
                <p className="font-medium">{selectedConta.fornecedor}</p>
              </div>
              <div>
                <Label>Descrição</Label>
                <p className="font-medium">{selectedConta.descricao}</p>
              </div>
              <div>
                <Label>Valor</Label>
                <p className="font-medium">R$ {selectedConta.valor.toFixed(2)}</p>
              </div>
              <div>
                <Label htmlFor="data-pagamento">Data de Pagamento</Label>
                <Input
                  id="data-pagamento"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <Label htmlFor="forma-pagamento">Forma de Pagamento</Label>
                <Select defaultValue="transferencia">
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
