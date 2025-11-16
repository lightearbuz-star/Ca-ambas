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

interface ClienteForm {
  id?: number;
  razaoSocial: string;
  cnpjCpf: string;
  contato?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
  tipoCliente: "pf" | "pj";
  limiteCreditoReais?: string | number;
  status: "ativo" | "inativo" | "bloqueado";
}

export default function Clientes() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ClienteForm>({
    razaoSocial: "",
    cnpjCpf: "",
    tipoCliente: "pj",
    status: "ativo",
  });
  const [activeTab, setActiveTab] = useState("dados");

  const { data: clientes = [], isLoading, refetch } = trpc.clientes.list.useQuery();
  const createMutation = trpc.clientes.create.useMutation();
  const updateMutation = trpc.clientes.update.useMutation();
  const deleteMutation = trpc.clientes.delete.useMutation();

  const handleAdd = () => {
    setForm({
      razaoSocial: "",
      cnpjCpf: "",
      tipoCliente: "pj",
      status: "ativo",
    });
    setActiveTab("dados");
    setOpen(true);
  };

  const handleEdit = (cliente: any) => {
    setForm(cliente);
    setActiveTab("dados");
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.razaoSocial || !form.cnpjCpf) {
      toast.error("Razão social e CNPJ/CPF são obrigatórios");
      return;
    }

    try {
      const limiteCreditoValue = form.limiteCreditoReais ? String(parseFloat(String(form.limiteCreditoReais))) : undefined;
      const cnpjValue = String(form.cnpjCpf).trim();
      
      // Converter null para undefined em campos opcionais
      const payload = {
        ...form,
        limiteCreditoReais: limiteCreditoValue,
        cnpjCpf: cnpjValue,
        contato: form.contato || undefined,
        telefone: form.telefone || undefined,
        email: form.email || undefined,
        endereco: form.endereco || undefined,
        numero: form.numero || undefined,
        complemento: form.complemento || undefined,
        bairro: form.bairro || undefined,
        cidade: form.cidade || undefined,
        estado: form.estado || undefined,
        cep: form.cep || undefined,
      };
      
      if (form.id) {
        await updateMutation.mutateAsync({
          id: form.id,
          ...payload,
        });
        toast.success("Cliente atualizado com sucesso");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Cliente criado com sucesso");
      }
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar cliente");
      console.error("Detalhes completos do erro:", (error as any).message, (error as any).response || error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este cliente?")) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Cliente deletado com sucesso");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar cliente");
      console.error(error);
    }
  };

  const handleLocationSelected = (data: any) => {
    setForm({
      ...form,
      cep: data.cep,
      endereco: data.endereco,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
      cidade: data.cidade,
      estado: data.estado,
      latitude: data.latitude,
      longitude: data.longitude,
    });
    setActiveTab("dados");
    toast.success("Localização confirmada com sucesso");
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="Clientes"
        columns={[
          { key: "razaoSocial", label: "Razão Social" },
          { key: "cnpjCpf", label: "CNPJ/CPF" },
          { key: "contato", label: "Contato" },
          { key: "telefone", label: "Telefone" },
          { key: "email", label: "Email" },
          { 
            key: "status", 
            label: "Status",
            render: (value) => (
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                value === "ativo" ? "bg-green-100 text-green-800" :
                value === "inativo" ? "bg-red-100 text-red-800" :
                "bg-orange-100 text-orange-800"
              }`}>
                {value === "ativo" ? "Ativo" : value === "inativo" ? "Inativo" : "Bloqueado"}
              </span>
            )
          },
        ]}
        data={clientes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        loading={isLoading}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dados">Dados Básicos</TabsTrigger>
              <TabsTrigger value="endereco">Localização</TabsTrigger>
            </TabsList>

            {/* Aba: Dados Básicos */}
            <TabsContent value="dados" className="space-y-4">
              <div>
                <Label htmlFor="tipoCliente">Tipo de Cliente *</Label>
                <Select value={form.tipoCliente} onValueChange={(value: any) => setForm({ ...form, tipoCliente: value })}>
                  <SelectTrigger id="tipoCliente">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pf">Pessoa Física</SelectItem>
                    <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="razaoSocial">Razão Social *</Label>
                <Input
                  id="razaoSocial"
                  value={form.razaoSocial}
                  onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })}
                  placeholder="Nome da empresa ou pessoa"
                />
              </div>

              <div>
                <Label htmlFor="cnpjCpf">{form.tipoCliente === "pj" ? "CNPJ" : "CPF"} *</Label>
                <Input
                  id="cnpjCpf"
                  value={form.cnpjCpf}
                  onChange={(e) => setForm({ ...form, cnpjCpf: e.target.value })}
                  placeholder={form.tipoCliente === "pj" ? "00.000.000/0000-00" : "000.000.000-00"}
                />
              </div>

              <div>
                <Label htmlFor="contato">Contato</Label>
                <Input
                  id="contato"
                  value={form.contato || ""}
                  onChange={(e) => setForm({ ...form, contato: e.target.value })}
                  placeholder="Nome do contato"
                />
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={form.telefone || ""}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="limiteCreditoReais">Limite de Crédito (R$)</Label>
                <Input
                  id="limiteCreditoReais"
                  type="number"
                  step="0.01"
                  value={form.limiteCreditoReais || ""}
                  onChange={(e) => setForm({ ...form, limiteCreditoReais: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={form.status} onValueChange={(value: any) => setForm({ ...form, status: value })}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="bloqueado">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Aba: Localização */}
            <TabsContent value="endereco">
              <CepSearch
                onLocationSelected={handleLocationSelected}
                initialCep={form.cep || ""}
                initialEndereco={form.endereco || ""}
              />
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
