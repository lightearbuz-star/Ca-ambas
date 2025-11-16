import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface RotaForm {
  id?: number;
  pedidoId: number;
  motoristaId: number;
  caminhaId: number;
  dataRota: string;
  pontoPartida: string;
  pontoDestino: string;
  distanciaKm?: string;
  tempoEstimadoMinutos?: number;
  tempoRealMinutos?: number;
  rotaGeometria?: string;
  observacoes?: string;
}

export default function Rotas() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RotaForm>({
    pedidoId: 0,
    motoristaId: 0,
    caminhaId: 0,
    dataRota: new Date().toISOString().split('T')[0],
    pontoPartida: "",
    pontoDestino: "",
  });

  const { data: rotas = [], isLoading, refetch } = trpc.rotas.list.useQuery();
  const { data: pedidos = [] } = trpc.pedidos.list.useQuery();
  const { data: motoristas = [] } = trpc.motoristas.list.useQuery();
  const { data: caminhoes = [] } = trpc.caminhoes.list.useQuery();

  const createMutation = trpc.rotas.create.useMutation();
  const updateMutation = trpc.rotas.update.useMutation();
  const deleteMutation = trpc.rotas.delete.useMutation();

  const handleAdd = () => {
    setForm({
      pedidoId: 0,
      motoristaId: 0,
      caminhaId: 0,
      dataRota: new Date().toISOString().split('T')[0],
      pontoPartida: "",
      pontoDestino: "",
    });
    setOpen(true);
  };

  const handleEdit = (rota: any) => {
    setForm({
      ...rota,
      dataRota: new Date(rota.dataRota).toISOString().split('T')[0],
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.pedidoId || !form.motoristaId || !form.caminhaId || !form.pontoPartida || !form.pontoDestino) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (form.id) {
        await updateMutation.mutateAsync({
          id: form.id,
          ...form,
          pedidoId: Number(form.pedidoId),
          motoristaId: Number(form.motoristaId),
          caminhaId: Number(form.caminhaId),
          dataRota: new Date(form.dataRota),
        });
        toast.success("Rota atualizada com sucesso");
      } else {
        await createMutation.mutateAsync({
          ...form,
          pedidoId: Number(form.pedidoId),
          motoristaId: Number(form.motoristaId),
          caminhaId: Number(form.caminhaId),
          dataRota: new Date(form.dataRota),
        });
        toast.success("Rota criada com sucesso");
      }
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar rota");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta rota?")) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Rota deletada com sucesso");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar rota");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="Rotas"
        columns={[
          { key: "pedidoId", label: "Pedido ID" },
          { key: "pontoPartida", label: "Ponto de Partida" },
          { key: "pontoDestino", label: "Ponto de Destino" },
          { key: "distanciaKm", label: "Distância (km)" },
          { key: "tempoEstimadoMinutos", label: "Tempo Est. (min)" },
          { key: "tempoRealMinutos", label: "Tempo Real (min)" },
        ]}
        data={rotas}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        loading={isLoading}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar Rota" : "Nova Rota"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Label htmlFor="pedidoId">Pedido *</Label>
              <Select value={String(form.pedidoId)} onValueChange={(value) => setForm({ ...form, pedidoId: Number(value) })}>
                <SelectTrigger id="pedidoId">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Selecione um pedido</SelectItem>
                  {pedidos.map((p: any) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.numeroPedido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="motoristaId">Motorista *</Label>
              <Select value={String(form.motoristaId)} onValueChange={(value) => setForm({ ...form, motoristaId: Number(value) })}>
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

            <div>
              <Label htmlFor="caminhaId">Caminhão *</Label>
              <Select value={String(form.caminhaId)} onValueChange={(value) => setForm({ ...form, caminhaId: Number(value) })}>
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
              <Label htmlFor="dataRota">Data da Rota *</Label>
              <Input
                id="dataRota"
                type="date"
                value={form.dataRota}
                onChange={(e) => setForm({ ...form, dataRota: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="pontoPartida">Ponto de Partida *</Label>
              <Input
                id="pontoPartida"
                value={form.pontoPartida}
                onChange={(e) => setForm({ ...form, pontoPartida: e.target.value })}
                placeholder="Endereço de saída"
              />
            </div>

            <div>
              <Label htmlFor="pontoDestino">Ponto de Destino *</Label>
              <Input
                id="pontoDestino"
                value={form.pontoDestino}
                onChange={(e) => setForm({ ...form, pontoDestino: e.target.value })}
                placeholder="Endereço de chegada"
              />
            </div>

            <div>
              <Label htmlFor="distanciaKm">Distância (km)</Label>
              <Input
                id="distanciaKm"
                type="number"
                step="0.1"
                value={form.distanciaKm || ""}
                onChange={(e) => setForm({ ...form, distanciaKm: e.target.value })}
                placeholder="0.0"
              />
            </div>

            <div>
              <Label htmlFor="tempoEstimadoMinutos">Tempo Estimado (minutos)</Label>
              <Input
                id="tempoEstimadoMinutos"
                type="number"
                value={form.tempoEstimadoMinutos || ""}
                onChange={(e) => setForm({ ...form, tempoEstimadoMinutos: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="tempoRealMinutos">Tempo Real (minutos)</Label>
              <Input
                id="tempoRealMinutos"
                type="number"
                value={form.tempoRealMinutos || ""}
                onChange={(e) => setForm({ ...form, tempoRealMinutos: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={form.observacoes || ""}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                placeholder="Observações da rota"
              />
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
