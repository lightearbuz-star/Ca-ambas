import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface TransacaoForm {
  id?: number;
  tipo: "receita" | "despesa";
  categoria: string;
  descricao: string;
  valorReais: string;
  pedidoId?: number;
  dataTransacao: string;
  dataRecebimentoPagamento?: string;
  formaPagamento?: string;
  comprovante?: string;
  status: "pendente" | "pago" | "cancelado";
}

export default function Transacoes() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TransacaoForm>({
    tipo: "receita",
    categoria: "",
    descricao: "",
    valorReais: "",
    dataTransacao: new Date().toISOString().split('T')[0],
    status: "pendente",
  });

  const { data: transacoes = [], isLoading, refetch } = trpc.transacoes.list.useQuery();
  const { data: pedidos = [] } = trpc.pedidos.list.useQuery();
  const createMutation = trpc.transacoes.create.useMutation();
  const updateMutation = trpc.transacoes.update.useMutation();
  const deleteMutation = trpc.transacoes.delete.useMutation();

  const categorias = form.tipo === "receita" 
    ? ["Locação", "Multa", "Serviço Adicional", "Outro"]
    : ["Manutenção", "Combustível", "Pedágio", "Seguro", "Aluguel", "Salário", "Outro"];

  const handleAdd = () => {
    setForm({
      tipo: "receita",
      categoria: "",
      descricao: "",
      valorReais: "",
      dataTransacao: new Date().toISOString().split('T')[0],
      status: "pendente",
    });
    setOpen(true);
  };

  const handleEdit = (transacao: any) => {
    setForm({
      ...transacao,
      dataTransacao: new Date(transacao.dataTransacao).toISOString().split('T')[0],
      dataRecebimentoPagamento: transacao.dataRecebimentoPagamento ? new Date(transacao.dataRecebimentoPagamento).toISOString().split('T')[0] : "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.categoria || !form.descricao || !form.valorReais || !form.dataTransacao) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (form.id) {
        await updateMutation.mutateAsync({
          id: form.id,
          ...form,
          pedidoId: form.pedidoId ? Number(form.pedidoId) : undefined,
          dataTransacao: new Date(form.dataTransacao),
          dataRecebimentoPagamento: form.dataRecebimentoPagamento ? new Date(form.dataRecebimentoPagamento) : undefined,
        });
        toast.success("Transação atualizada com sucesso");
      } else {
        await createMutation.mutateAsync({
          ...form,
          pedidoId: form.pedidoId ? Number(form.pedidoId) : undefined,
          dataTransacao: new Date(form.dataTransacao),
          dataRecebimentoPagamento: form.dataRecebimentoPagamento ? new Date(form.dataRecebimentoPagamento) : undefined,
        });
        toast.success("Transação criada com sucesso");
      }
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar transação");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta transação?")) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Transação deletada com sucesso");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar transação");
      console.error(error);
    }
  };

  const totalReceitas = transacoes
    .filter((t: any) => t.tipo === "receita")
    .reduce((sum: number, t: any) => sum + parseFloat(t.valorReais || 0), 0);

  const totalDespesas = transacoes
    .filter((t: any) => t.tipo === "despesa")
    .reduce((sum: number, t: any) => sum + parseFloat(t.valorReais || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">Total de Receitas</p>
          <p className="text-2xl font-bold text-green-700">R$ {totalReceitas.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600 font-medium">Total de Despesas</p>
          <p className="text-2xl font-bold text-red-700">R$ {totalDespesas.toFixed(2)}</p>
        </div>
        <div className={`border rounded-lg p-4 ${totalReceitas - totalDespesas >= 0 ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"}`}>
          <p className={`text-sm font-medium ${totalReceitas - totalDespesas >= 0 ? "text-blue-600" : "text-orange-600"}`}>Saldo</p>
          <p className={`text-2xl font-bold ${totalReceitas - totalDespesas >= 0 ? "text-blue-700" : "text-orange-700"}`}>
            R$ {(totalReceitas - totalDespesas).toFixed(2)}
          </p>
        </div>
      </div>

      <DataTable
        title="Transações"
        columns={[
          { 
            key: "tipo", 
            label: "Tipo",
            render: (value) => (
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                value === "receita" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {value === "receita" ? "Receita" : "Despesa"}
              </span>
            )
          },
          { key: "categoria", label: "Categoria" },
          { key: "descricao", label: "Descrição" },
          { key: "valorReais", label: "Valor (R$)" },
          { 
            key: "status", 
            label: "Status",
            render: (value) => (
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                value === "pendente" ? "bg-yellow-100 text-yellow-800" :
                value === "pago" ? "bg-green-100 text-green-800" :
                "bg-red-100 text-red-800"
              }`}>
                {value === "pendente" ? "Pendente" : value === "pago" ? "Pago" : "Cancelado"}
              </span>
            )
          },
        ]}
        data={transacoes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        loading={isLoading}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar Transação" : "Nova Transação"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={form.tipo} onValueChange={(value: any) => setForm({ ...form, tipo: value, categoria: "" })}>
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="categoria">Categoria *</Label>
              <Select value={form.categoria} onValueChange={(value) => setForm({ ...form, categoria: value })}>
                <SelectTrigger id="categoria">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Descrição da transação"
              />
            </div>

            <div>
              <Label htmlFor="valorReais">Valor (R$) *</Label>
              <Input
                id="valorReais"
                type="number"
                step="0.01"
                value={form.valorReais}
                onChange={(e) => setForm({ ...form, valorReais: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="dataTransacao">Data da Transação *</Label>
              <Input
                id="dataTransacao"
                type="date"
                value={form.dataTransacao}
                onChange={(e) => setForm({ ...form, dataTransacao: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="pedidoId">Pedido Associado</Label>
              <Select value={String(form.pedidoId || 0)} onValueChange={(value) => setForm({ ...form, pedidoId: value ? Number(value) : undefined })}>
                <SelectTrigger id="pedidoId">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Nenhum</SelectItem>
                  {pedidos.map((p: any) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.numeroPedido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dataRecebimentoPagamento">Data de Recebimento/Pagamento</Label>
              <Input
                id="dataRecebimentoPagamento"
                type="date"
                value={form.dataRecebimentoPagamento || ""}
                onChange={(e) => setForm({ ...form, dataRecebimentoPagamento: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
              <Input
                id="formaPagamento"
                value={form.formaPagamento || ""}
                onChange={(e) => setForm({ ...form, formaPagamento: e.target.value })}
                placeholder="Dinheiro, Cartão, Transferência"
              />
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={form.status} onValueChange={(value: any) => setForm({ ...form, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
