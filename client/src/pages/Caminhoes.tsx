import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface CaminhaForm {
  id?: number;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  capacidadeToneladas?: string;
  crlv?: string;
  crlvValidade?: string;
  seguroValidade?: string;
  inspecaoTecnicaValidade?: string;
  status: "operacional" | "manutencao" | "inativo";
}

export default function Caminhoes() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CaminhaForm>({
    placa: "",
    marca: "",
    modelo: "",
    ano: new Date().getFullYear(),
    status: "operacional",
  });

  const { data: caminhoes = [], isLoading, refetch } = trpc.caminhoes.list.useQuery();
  const createMutation = trpc.caminhoes.create.useMutation();
  const updateMutation = trpc.caminhoes.update.useMutation();
  const deleteMutation = trpc.caminhoes.delete.useMutation();

  const handleAdd = () => {
    setForm({
      placa: "",
      marca: "",
      modelo: "",
      ano: new Date().getFullYear(),
      status: "operacional",
    });
    setOpen(true);
  };

  const handleEdit = (caminhao: any) => {
    setForm({
      ...caminhao,
      crlvValidade: caminhao.crlvValidade ? new Date(caminhao.crlvValidade).toISOString().split('T')[0] : "",
      seguroValidade: caminhao.seguroValidade ? new Date(caminhao.seguroValidade).toISOString().split('T')[0] : "",
      inspecaoTecnicaValidade: caminhao.inspecaoTecnicaValidade ? new Date(caminhao.inspecaoTecnicaValidade).toISOString().split('T')[0] : "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.placa || !form.marca || !form.modelo) {
      toast.error("Placa, marca e modelo são obrigatórios");
      return;
    }

    try {
      if (form.id) {
        await updateMutation.mutateAsync({
          id: form.id,
          ...form,
          crlvValidade: form.crlvValidade ? new Date(form.crlvValidade) : undefined,
          seguroValidade: form.seguroValidade ? new Date(form.seguroValidade) : undefined,
          inspecaoTecnicaValidade: form.inspecaoTecnicaValidade ? new Date(form.inspecaoTecnicaValidade) : undefined,
        });
        toast.success("Caminhão atualizado com sucesso");
      } else {
        await createMutation.mutateAsync({
          ...form,
          crlvValidade: form.crlvValidade ? new Date(form.crlvValidade) : undefined,
          seguroValidade: form.seguroValidade ? new Date(form.seguroValidade) : undefined,
          inspecaoTecnicaValidade: form.inspecaoTecnicaValidade ? new Date(form.inspecaoTecnicaValidade) : undefined,
        });
        toast.success("Caminhão criado com sucesso");
      }
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar caminhão");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este caminhão?")) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Caminhão deletado com sucesso");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar caminhão");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="Caminhões"
        columns={[
          { key: "placa", label: "Placa" },
          { key: "marca", label: "Marca" },
          { key: "modelo", label: "Modelo" },
          { key: "ano", label: "Ano" },
          { key: "capacidadeToneladas", label: "Capacidade (ton)" },
          { 
            key: "status", 
            label: "Status",
            render: (value) => (
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                value === "operacional" ? "bg-green-100 text-green-800" :
                value === "manutencao" ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }`}>
                {value === "operacional" ? "Operacional" : value === "manutencao" ? "Manutenção" : "Inativo"}
              </span>
            )
          },
        ]}
        data={caminhoes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        loading={isLoading}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar Caminhão" : "Novo Caminhão"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="placa">Placa *</Label>
              <Input
                id="placa"
                value={form.placa}
                onChange={(e) => setForm({ ...form, placa: e.target.value.toUpperCase() })}
                placeholder="ABC-1234"
              />
            </div>

            <div>
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                value={form.marca}
                onChange={(e) => setForm({ ...form, marca: e.target.value })}
                placeholder="Volvo, Scania, etc"
              />
            </div>

            <div>
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                placeholder="FH, R440, etc"
              />
            </div>

            <div>
              <Label htmlFor="ano">Ano *</Label>
              <Input
                id="ano"
                type="number"
                value={form.ano}
                onChange={(e) => setForm({ ...form, ano: parseInt(e.target.value) })}
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
                placeholder="20.5"
              />
            </div>

            <div>
              <Label htmlFor="crlv">CRLV</Label>
              <Input
                id="crlv"
                value={form.crlv || ""}
                onChange={(e) => setForm({ ...form, crlv: e.target.value })}
                placeholder="Número do CRLV"
              />
            </div>

            <div>
              <Label htmlFor="crlvValidade">Validade CRLV</Label>
              <Input
                id="crlvValidade"
                type="date"
                value={form.crlvValidade || ""}
                onChange={(e) => setForm({ ...form, crlvValidade: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="seguroValidade">Validade Seguro</Label>
              <Input
                id="seguroValidade"
                type="date"
                value={form.seguroValidade || ""}
                onChange={(e) => setForm({ ...form, seguroValidade: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="inspecaoTecnicaValidade">Validade Inspeção Técnica</Label>
              <Input
                id="inspecaoTecnicaValidade"
                type="date"
                value={form.inspecaoTecnicaValidade || ""}
                onChange={(e) => setForm({ ...form, inspecaoTecnicaValidade: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={form.status} onValueChange={(value: any) => setForm({ ...form, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operacional">Operacional</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
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
