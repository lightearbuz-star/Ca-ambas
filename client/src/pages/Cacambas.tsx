import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface CacambaForm {
  id?: number;
  identificacao: string;
  tamanho: string;
  capacidadeToneladas?: string;
  tipoMaterial?: string;
  localizacaoAtual?: string;
  statusDisponibilidade: "disponivel" | "alugada" | "manutencao" | "inativa";
  dataAquisicao?: string;
  valorAquisicaoReais?: string;
}

export default function Cacambas() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CacambaForm>({
    identificacao: "",
    tamanho: "",
    statusDisponibilidade: "disponivel",
  });

  const { data: cacambas = [], isLoading, refetch } = trpc.cacambas.list.useQuery();
  const createMutation = trpc.cacambas.create.useMutation();
  const updateMutation = trpc.cacambas.update.useMutation();
  const deleteMutation = trpc.cacambas.delete.useMutation();

  const handleAdd = () => {
    setForm({
      identificacao: "",
      tamanho: "",
      statusDisponibilidade: "disponivel",
    });
    setOpen(true);
  };

  const handleEdit = (cacamba: any) => {
    setForm({
      ...cacamba,
      dataAquisicao: cacamba.dataAquisicao ? new Date(cacamba.dataAquisicao).toISOString().split('T')[0] : "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.identificacao || !form.tamanho) {
      toast.error("Identificação e tamanho são obrigatórios");
      return;
    }

    try {
      if (form.id) {
        await updateMutation.mutateAsync({
          id: form.id,
          ...form,
          dataAquisicao: form.dataAquisicao ? new Date(form.dataAquisicao) : undefined,
        });
        toast.success("Caçamba atualizada com sucesso");
      } else {
        await createMutation.mutateAsync({
          ...form,
          dataAquisicao: form.dataAquisicao ? new Date(form.dataAquisicao) : undefined,
        });
        toast.success("Caçamba criada com sucesso");
      }
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar caçamba");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta caçamba?")) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Caçamba deletada com sucesso");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar caçamba");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="Caçambas"
        columns={[
          { key: "identificacao", label: "Identificação" },
          { key: "tamanho", label: "Tamanho" },
          { key: "capacidadeToneladas", label: "Capacidade (ton)" },
          { key: "tipoMaterial", label: "Tipo de Material" },
          { 
            key: "statusDisponibilidade", 
            label: "Status",
            render: (value) => (
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                value === "disponivel" ? "bg-green-100 text-green-800" :
                value === "alugada" ? "bg-blue-100 text-blue-800" :
                value === "manutencao" ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }`}>
                {value === "disponivel" ? "Disponível" : 
                 value === "alugada" ? "Alugada" : 
                 value === "manutencao" ? "Manutenção" : 
                 "Inativa"}
              </span>
            )
          },
        ]}
        data={cacambas}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        loading={isLoading}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar Caçamba" : "Nova Caçamba"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="identificacao">Identificação *</Label>
              <Input
                id="identificacao"
                value={form.identificacao}
                onChange={(e) => setForm({ ...form, identificacao: e.target.value })}
                placeholder="CAÇ-001"
              />
            </div>

            <div>
              <Label htmlFor="tamanho">Tamanho *</Label>
              <Input
                id="tamanho"
                value={form.tamanho}
                onChange={(e) => setForm({ ...form, tamanho: e.target.value })}
                placeholder="6m³, 8m³, 10m³"
              />
            </div>

            <div>
              <Label htmlFor="capacidadeToneladas">Capacidade (toneladas)</Label>
              <Input
                id="capacidadeToneladas"
                type="number"
                step="0.1"
                value={form.capacidadeToneladas || ""}
                onChange={(e) => setForm({ ...form, capacidadeToneladas: e.target.value })}
                placeholder="10.5"
              />
            </div>

            <div>
              <Label htmlFor="tipoMaterial">Tipo de Material</Label>
              <Input
                id="tipoMaterial"
                value={form.tipoMaterial || ""}
                onChange={(e) => setForm({ ...form, tipoMaterial: e.target.value })}
                placeholder="Entulho, Sucata, Areia, etc"
              />
            </div>

            <div>
              <Label htmlFor="localizacaoAtual">Localização Atual</Label>
              <Input
                id="localizacaoAtual"
                value={form.localizacaoAtual || ""}
                onChange={(e) => setForm({ ...form, localizacaoAtual: e.target.value })}
                placeholder="Endereço ou referência"
              />
            </div>

            <div>
              <Label htmlFor="dataAquisicao">Data de Aquisição</Label>
              <Input
                id="dataAquisicao"
                type="date"
                value={form.dataAquisicao || ""}
                onChange={(e) => setForm({ ...form, dataAquisicao: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="valorAquisicaoReais">Valor de Aquisição (R$)</Label>
              <Input
                id="valorAquisicaoReais"
                type="number"
                step="0.01"
                value={form.valorAquisicaoReais || ""}
                onChange={(e) => setForm({ ...form, valorAquisicaoReais: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="statusDisponibilidade">Status *</Label>
              <Select value={form.statusDisponibilidade} onValueChange={(value: any) => setForm({ ...form, statusDisponibilidade: value })}>
                <SelectTrigger id="statusDisponibilidade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="alugada">Alugada</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="inativa">Inativa</SelectItem>
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
