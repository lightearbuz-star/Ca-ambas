import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CepSearch } from "@/components/CepSearch";

interface PedidoForm {
  id?: number;
  numeroPedido: string;
  clienteId: number;
  cacambaId: number;
  motoristaId?: number;
  caminhaId?: number;
  localEntrega: string;
  enderecoEntrega?: string;
  numeroEntrega?: string;
  complementoEntrega?: string;
  bairroEntrega?: string;
  cidadeEntrega?: string;
  estadoEntrega?: string;
  cepEntrega?: string;
  latitudeEntrega?: number;
  longitudeEntrega?: number;
  dataEntrega: string;
  dataRetirada?: string;
  prazoVencimentoRetirada: string;
  valorLocacaoReais: string;
  observacoes?: string;
  status: "pendente" | "em_andamento" | "entregue" | "retirado" | "faturado" | "cancelado";
}

export default function Pedidos() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dados");
  const [form, setForm] = useState<PedidoForm>({
    numeroPedido: "",
    clienteId: 0,
    cacambaId: 0,
    localEntrega: "",
    dataEntrega: "",
    prazoVencimentoRetirada: "",
    valorLocacaoReais: "",
    status: "pendente",
  });

  const { data: pedidos = [], isLoading, refetch } = trpc.pedidos.list.useQuery();
  const { data: clientes = [] } = trpc.clientes.list.useQuery();
  const { data: cacambas = [] } = trpc.cacambas.list.useQuery();
  const { data: motoristas = [] } = trpc.motoristas.list.useQuery();
  const { data: caminhoes = [] } = trpc.caminhoes.list.useQuery();

  const createMutation = trpc.pedidos.create.useMutation();
  const updateMutation = trpc.pedidos.update.useMutation();
  const deleteMutation = trpc.pedidos.delete.useMutation();

  const handleAdd = () => {
    setForm({
      numeroPedido: "",
      clienteId: 0,
      cacambaId: 0,
      localEntrega: "",
      dataEntrega: "",
      prazoVencimentoRetirada: "",
      valorLocacaoReais: "",
      status: "pendente",
    });
    setActiveTab("dados");
    setOpen(true);
  };

  const handleEdit = (pedido: any) => {
    setForm({
      ...pedido,
      dataEntrega: new Date(pedido.dataEntrega).toISOString().split('T')[0],
      dataRetirada: pedido.dataRetirada ? new Date(pedido.dataRetirada).toISOString().split('T')[0] : "",
      prazoVencimentoRetirada: new Date(pedido.prazoVencimentoRetirada).toISOString().split('T')[0],
    });
    setActiveTab("dados");
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.numeroPedido || !form.clienteId || !form.cacambaId || !form.localEntrega || !form.dataEntrega || !form.prazoVencimentoRetirada || !form.valorLocacaoReais) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const pedidoData = {
        numeroPedido: form.numeroPedido,
        clienteId: Number(form.clienteId),
        cacambaId: Number(form.cacambaId),
        motoristaId: form.motoristaId ? Number(form.motoristaId) : undefined,
        caminhaId: form.caminhaId ? Number(form.caminhaId) : undefined,
        localEntrega: form.localEntrega,
        enderecoEntrega: form.enderecoEntrega || undefined,
        numeroEntrega: form.numeroEntrega || undefined,
        complementoEntrega: form.complementoEntrega || undefined,
        bairroEntrega: form.bairroEntrega || undefined,
        cidadeEntrega: form.cidadeEntrega || undefined,
        estadoEntrega: form.estadoEntrega || undefined,
        cepEntrega: form.cepEntrega || undefined,
        latitudeEntrega: form.latitudeEntrega ? Number(form.latitudeEntrega) : undefined,
        longitudeEntrega: form.longitudeEntrega ? Number(form.longitudeEntrega) : undefined,
        dataEntrega: new Date(form.dataEntrega),
        dataRetirada: form.dataRetirada ? new Date(form.dataRetirada) : undefined,
        prazoVencimentoRetirada: new Date(form.prazoVencimentoRetirada),
        valorLocacaoReais: String(parseFloat(String(form.valorLocacaoReais))),
        observacoes: form.observacoes || undefined,
        status: form.status,
      };

      console.log("Salvando pedido com dados completos:", {
        numeroPedido: pedidoData.numeroPedido,
        clienteId: pedidoData.clienteId,
        cacambaId: pedidoData.cacambaId,
        localEntrega: pedidoData.localEntrega,
        latitudeEntrega: pedidoData.latitudeEntrega,
        longitudeEntrega: pedidoData.longitudeEntrega,
        enderecoEntrega: pedidoData.enderecoEntrega,
        cepEntrega: pedidoData.cepEntrega,
        status: pedidoData.status,
        dataEntrega: pedidoData.dataEntrega,
        prazoVencimentoRetirada: pedidoData.prazoVencimentoRetirada,
        valorLocacaoReais: pedidoData.valorLocacaoReais
      });
      console.log("Form state completo:", form);

      if (form.id) {
        await updateMutation.mutateAsync({
          id: form.id,
          ...pedidoData,
        });
        toast.success("Pedido atualizado com sucesso");
      } else {
        await createMutation.mutateAsync(pedidoData);
        toast.success("Pedido criado com sucesso");
      }
      setOpen(false);
      refetch();
    } catch (error: any) {
      toast.error("Erro ao salvar pedido: " + (error?.message || "Erro desconhecido"));
      console.error("Erro completo:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este pedido?")) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Pedido deletado com sucesso");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar pedido");
      console.error(error);
    }
  };

  const handleLocationSelected = (data: any) => {
    setForm({
      ...form,
      cepEntrega: data.cep,
      enderecoEntrega: data.endereco,
      numeroEntrega: data.numero,
      complementoEntrega: data.complemento,
      bairroEntrega: data.bairro,
      cidadeEntrega: data.cidade,
      estadoEntrega: data.estado,
      latitudeEntrega: data.latitude,
      longitudeEntrega: data.longitude,
      localEntrega: `${data.endereco}, ${data.numero} - ${data.bairro}, ${data.cidade}, ${data.estado}`,
    });
    setActiveTab("dados");
    toast.success("Localização de entrega confirmada com sucesso");
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="Pedidos"
        columns={[
          { key: "numeroPedido", label: "Número" },
          { key: "clienteId", label: "Cliente ID" },
          { key: "localEntrega", label: "Local de Entrega" },
          { key: "valorLocacaoReais", label: "Valor (R$)" },
          { 
            key: "status", 
            label: "Status",
            render: (value) => (
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                value === "pendente" ? "bg-yellow-100 text-yellow-800" :
                value === "em_andamento" ? "bg-blue-100 text-blue-800" :
                value === "entregue" ? "bg-green-100 text-green-800" :
                value === "retirado" ? "bg-purple-100 text-purple-800" :
                value === "faturado" ? "bg-green-100 text-green-800" :
                "bg-red-100 text-red-800"
              }`}>
                {value}
              </span>
            )
          },
        ]}
        data={pedidos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        loading={isLoading}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar Pedido" : "Novo Pedido"}</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dados">Dados Básicos</TabsTrigger>
              <TabsTrigger value="entrega">Endereço de Entrega</TabsTrigger>
              <TabsTrigger value="datas">Datas e Status</TabsTrigger>
            </TabsList>

            {/* Aba: Dados Básicos */}
            <TabsContent value="dados" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numeroPedido">Número do Pedido *</Label>
                  <Input
                    id="numeroPedido"
                    value={form.numeroPedido}
                    onChange={(e) => setForm({ ...form, numeroPedido: e.target.value })}
                    placeholder="PED-001"
                  />
                </div>

                <div>
                  <Label htmlFor="clienteId">Cliente *</Label>
                  <Select value={String(form.clienteId)} onValueChange={(value) => setForm({ ...form, clienteId: Number(value) })}>
                    <SelectTrigger id="clienteId">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Selecione um cliente</SelectItem>
                      {clientes.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.razaoSocial}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cacambaId">Caçamba *</Label>
                  <Select value={String(form.cacambaId)} onValueChange={(value) => setForm({ ...form, cacambaId: Number(value) })}>
                    <SelectTrigger id="cacambaId">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Selecione uma caçamba</SelectItem>
                      {cacambas.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.identificacao} - {c.tamanho}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="motoristaId">Motorista</Label>
                  <Select value={String(form.motoristaId || 0)} onValueChange={(value) => setForm({ ...form, motoristaId: value ? Number(value) : undefined })}>
                    <SelectTrigger id="motoristaId">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Selecione um motorista</SelectItem>
                      {motoristas.map((m: any) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="caminhaId">Caminhão</Label>
                  <Select value={String(form.caminhaId || 0)} onValueChange={(value) => setForm({ ...form, caminhaId: value ? Number(value) : undefined })}>
                    <SelectTrigger id="caminhaId">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Selecione um caminhão</SelectItem>
                      {caminhoes.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.placa} - {c.modelo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="valorLocacaoReais">Valor da Locação (R$) *</Label>
                  <Input
                    id="valorLocacaoReais"
                    type="number"
                    step="0.01"
                    value={form.valorLocacaoReais}
                    onChange={(e) => setForm({ ...form, valorLocacaoReais: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={form.observacoes || ""}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  placeholder="Observações adicionais"
                />
              </div>
            </TabsContent>

            {/* Aba: Endereço de Entrega */}
            <TabsContent value="entrega">
              <CepSearch
                onLocationSelected={handleLocationSelected}
                initialCep={form.cepEntrega || ""}
                initialEndereco={form.enderecoEntrega || ""}
              />
            </TabsContent>

            {/* Aba: Datas e Status */}
            <TabsContent value="datas" className="space-y-4">
              <div>
                <Label htmlFor="localEntrega">Local de Entrega (Resumo) *</Label>
                <Input
                  id="localEntrega"
                  value={form.localEntrega}
                  onChange={(e) => setForm({ ...form, localEntrega: e.target.value })}
                  placeholder="Endereço completo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataEntrega">Data de Entrega *</Label>
                  <Input
                    id="dataEntrega"
                    type="date"
                    value={form.dataEntrega}
                    onChange={(e) => setForm({ ...form, dataEntrega: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="dataRetirada">Data de Retirada</Label>
                  <Input
                    id="dataRetirada"
                    type="date"
                    value={form.dataRetirada || ""}
                    onChange={(e) => setForm({ ...form, dataRetirada: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="prazoVencimentoRetirada">Prazo de Vencimento da Retirada *</Label>
                <Input
                  id="prazoVencimentoRetirada"
                  type="date"
                  value={form.prazoVencimentoRetirada}
                  onChange={(e) => setForm({ ...form, prazoVencimentoRetirada: e.target.value })}
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
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                    <SelectItem value="retirado">Retirado</SelectItem>
                    <SelectItem value="faturado">Faturado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
