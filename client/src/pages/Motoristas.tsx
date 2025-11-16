import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface MotoristaForm {
  id?: number;
  nome: string;
  cpf: string;
  telefone?: string;
  email?: string;
  cnh?: string;
  cnhValidade?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  status: "ativo" | "inativo" | "afastado";
}

export default function Motoristas() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<MotoristaForm>({
    nome: "",
    cpf: "",
    status: "ativo",
  });

  const { data: motoristas = [], isLoading, refetch } = trpc.motoristas.list.useQuery();
  const createMutation = trpc.motoristas.create.useMutation();
  const updateMutation = trpc.motoristas.update.useMutation();
  const deleteMutation = trpc.motoristas.delete.useMutation();

  const handleAdd = () => {
    setForm({ nome: "", cpf: "", status: "ativo" });
    setOpen(true);
  };

  const handleEdit = (motorista: any) => {
    setForm({
      ...motorista,
      cnhValidade: motorista.cnhValidade ? new Date(motorista.cnhValidade).toISOString().split('T')[0] : "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.nome || !form.cpf) {
      toast.error("Nome e CPF são obrigatórios");
      return;
    }

    try {
      if (form.id) {
        await updateMutation.mutateAsync({
          id: form.id,
          ...form,
          cnhValidade: form.cnhValidade ? new Date(form.cnhValidade) : undefined,
        });
        toast.success("Motorista atualizado com sucesso");
      } else {
        await createMutation.mutateAsync({
          ...form,
          cnhValidade: form.cnhValidade ? new Date(form.cnhValidade) : undefined,
        });
        toast.success("Motorista criado com sucesso");
      }
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar motorista");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este motorista?")) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Motorista deletado com sucesso");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar motorista");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="Motoristas"
        columns={[
          { key: "nome", label: "Nome" },
          { key: "cpf", label: "CPF" },
          { key: "telefone", label: "Telefone" },
          { key: "email", label: "Email" },
          { 
            key: "status", 
            label: "Status",
            render: (value) => (
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                value === "ativo" ? "bg-green-100 text-green-800" :
                value === "inativo" ? "bg-red-100 text-red-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>
                {value === "ativo" ? "Ativo" : value === "inativo" ? "Inativo" : "Afastado"}
              </span>
            )
          },
        ]}
        data={motoristas}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        loading={isLoading}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar Motorista" : "Novo Motorista"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>

            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                placeholder="000.000.000-00"
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
              <Label htmlFor="cnh">CNH</Label>
              <Input
                id="cnh"
                value={form.cnh || ""}
                onChange={(e) => setForm({ ...form, cnh: e.target.value })}
                placeholder="Número da CNH"
              />
            </div>

            <div>
              <Label htmlFor="cnhValidade">Validade CNH</Label>
              <Input
                id="cnhValidade"
                type="date"
                value={form.cnhValidade || ""}
                onChange={(e) => setForm({ ...form, cnhValidade: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={form.endereco || ""}
                onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                placeholder="Rua, número"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={form.cidade || ""}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                  placeholder="Cidade"
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={form.estado || ""}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={form.cep || ""}
                onChange={(e) => setForm({ ...form, cep: e.target.value })}
                placeholder="00000-000"
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
                  <SelectItem value="afastado">Afastado</SelectItem>
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
