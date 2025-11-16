import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface ManutencaoForm {
  id?: number;
  tipo: "caminhao" | "cacamba";
  tipoId: number;
  descricao: string;
  dataPrevista?: string;
  dataRealizada?: string;
  custoReais?: string;
  status: "agendada" | "realizada" | "cancelada";
}

export default function Manutencoes() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ManutencaoForm>({
    tipo: "caminhao",
    tipoId: 0,
    descricao: "",
    status: "agendada",
  });

  const { data: manutencoes = [], isLoading, refetch } = trpc.manutencoes.list.useQuery();
  const { data: caminhoes = [] } = trpc.caminhoes.list.useQuery();
  const { data: cacambas = [] } = trpc.cacambas.list.useQuery();

  const createMutation = trpc.manutencoes.create.useMutation();
  const updateMutation = trpc.manutencoes.update.useMutation();
  const deleteMutation = trpc.manutencoes.delete.useMutation();

  const handleAdd = () => {
    setForm({
      tipo: "caminhao",
      tipoId: 0,
      descricao: "",
      status: "agendada",
    });
    setOpen(true);
  };

  const handleEdit = (manutencao: any) => {
    setForm({
      ...manutencao,
      dataPrevista: manutencao.dataPrevista ? new Date(manutencao.dataPrevista).toISOString().split('T')[0] : "",
      dataRealizada: manutencao.dataRealizada ? new Date(manutencao.dataRealizada).toISOString().split('T')[0] : "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.tipoId || !form.descricao) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (form.id) {
        await updateMutation.mutateAsync({
          id: form.id,
          ...form,
          tipoId: Number(form.tipoId),
          dataPrevista: form.dataPrevista ? new Date(form.dataPrevista) : undefined,
          dataRealizada: form.dataRealizada ? new Date(form.dataRealizada) : undefined,
        });
        toast.success("Manutenção atualizada com sucesso");
      } else {
        await createMutation.mutateAsync({
          ...form,
          tipoId: Number(form.tipoId),
          dataPrevista: form.dataPrevista ? new Date(form.dataPrevista) : undefined,
          dataRealizada: form.dataRealizada ? new Date(form.dataRealizada) : undefined,
        });
        toast.success("Manutenção criada com sucesso");
      }
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar manutenção");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta manutenção?")) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Manutenção deletada com sucesso");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar manutenção");
      console.error(error);
    }
  };

  const items = form.tipo === "caminhao" ? caminhoes : cacambas;
  const itemLabel = form.tipo === "caminhao" ? "Caminhão" : "Caçamba";

  return (
    <div className="space-y-6">
      <DataTable
        title="Manutenções"
        columns={[
          { 
            key: "tipo", 
            label: "Tipo",
            render: (value) => (
              <span className="font-medium">
                {value === "caminhao" ? "Caminhão" : "Caçamba"}
              </span>
            )
          },
          { key: "descricao", label: "Descrição" },
          { key: "dataPrevista", label: "Data Prevista" },
          { key: "dataRealizada", label: "Data Realizada" },
          { key: "custoReais", label: "Custo (R$)" },
          { 
            key: "status", 
            label: "Status",
            render: (value) => (
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                value === "agendada" ? "bg-blue-100 text-blue-800" :
                value === "realizada" ? "bg-green-100 text-green-800" :
                "bg-red-100 text-red-800"
              }`}>
                {value === "agendada" ? "Agendada" : value === "realizada" ? "Realizada" : "Cancelada"}
              </span>
            )
          },
        ]}
        data={manutencoes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        loading={isLoading}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar Manutenção" : "Nova Manutenção"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={form.tipo} onValueChange={(value: any) => setForm({ ...form, tipo: value, tipoId: 0 })}>
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="caminhao">Caminhão</SelectItem>
                  <SelectItem value="cacamba">Caçamba</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tipoId">{itemLabel} *</Label>
              <Select value={String(form.tipoId)} onValueChange={(value) => setForm({ ...form, tipoId: Number(value) })}>
                <SelectTrigger id="tipoId">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Selecione um {itemLabel.toLowerCase()}</SelectItem>
                  {items.map((item: any) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {form.tipo === "caminhao" ? `${item.placa} - ${item.modelo}` : `${item.identificacao} - ${item.tamanho}`}
                    </SelectItem>
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
                placeholder="Descrição da manutenção"
              />
            </div>

            <div>
              <Label htmlFor="dataPrevista">Data Prevista</Label>
              <Input
                id="dataPrevista"
                type="date"
                value={form.dataPrevista || ""}
                onChange={(e) => setForm({ ...form, dataPrevista: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="dataRealizada">Data Realizada</Label>
              <Input
                id="dataRealizada"
                type="date"
                value={form.dataRealizada || ""}
                onChange={(e) => setForm({ ...form, dataRealizada: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="custoReais">Custo (R$)</Label>
              <Input
                id="custoReais"
                type="number"
                step="0.01"
                value={form.custoReais || ""}
                onChange={(e) => setForm({ ...form, custoReais: e.target.value })}
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
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="realizada">Realizada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
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
