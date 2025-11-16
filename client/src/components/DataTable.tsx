import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit2, Plus } from "lucide-react";
import { useState, useMemo } from "react";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: number }> {
  columns: Column<T>[];
  data: T[];
  onEdit: (item: T) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  title: string;
  loading?: boolean;
}

export function DataTable<T extends { id: number }>({
  columns,
  data,
  onEdit,
  onDelete,
  onAdd,
  title,
  loading = false,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(item =>
      columns.some(col => {
        const value = item[col.key];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Button onClick={onAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar
        </Button>
      </div>

      <Input
        placeholder="Pesquisar..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              {columns.map(col => (
                <th key={String(col.key)} className="px-4 py-2 text-left font-semibold">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-2 text-left font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-muted-foreground">
                  Carregando...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              filteredData.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                  {columns.map(col => (
                    <td key={String(col.key)} className="px-4 py-2">
                      {col.render ? col.render(item[col.key], item) : String(item[col.key])}
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(item)}
                        className="gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(item.id)}
                        className="gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
