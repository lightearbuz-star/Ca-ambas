import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

type Period = "dia" | "semana" | "mes" | "ano";

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("mes");
  const { data: transacoes = [] } = trpc.transacoes.list.useQuery();

  const getDateRange = (period: Period) => {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "dia":
        startDate.setDate(now.getDate() - 1);
        break;
      case "semana":
        startDate.setDate(now.getDate() - 7);
        break;
      case "mes":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "ano":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return { startDate, endDate: now };
  };

  const { startDate, endDate } = getDateRange(period);

  const filteredTransacoes = useMemo(() => {
    return transacoes.filter((t: any) => {
      const date = new Date(t.dataTransacao);
      return date >= startDate && date <= endDate;
    });
  }, [transacoes, startDate, endDate]);

  const receitas = filteredTransacoes.filter((t: any) => t.tipo === "receita");
  const despesas = filteredTransacoes.filter((t: any) => t.tipo === "despesa");

  const totalReceitas = receitas.reduce((sum: number, t: any) => sum + parseFloat(t.valorReais || 0), 0);
  const totalDespesas = despesas.reduce((sum: number, t: any) => sum + parseFloat(t.valorReais || 0), 0);
  const lucroLiquido = totalReceitas - totalDespesas;

  // Dados para gráfico de linha (evolução ao longo do tempo)
  const getLineChartData = () => {
    const data: { [key: string]: { receita: number; despesa: number } } = {};

    filteredTransacoes.forEach((t: any) => {
      const date = new Date(t.dataTransacao);
      let key = "";

      if (period === "dia") {
        key = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      } else if (period === "semana") {
        key = date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" });
      } else if (period === "mes") {
        key = date.toLocaleDateString("pt-BR", { day: "2-digit" });
      } else {
        key = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
      }

      if (!data[key]) {
        data[key] = { receita: 0, despesa: 0 };
      }

      if (t.tipo === "receita") {
        data[key].receita += parseFloat(t.valorReais || 0);
      } else {
        data[key].despesa += parseFloat(t.valorReais || 0);
      }
    });

    return Object.entries(data).map(([key, value]) => ({
      name: key,
      receita: parseFloat(value.receita.toFixed(2)),
      despesa: parseFloat(value.despesa.toFixed(2)),
    }));
  };

  // Dados para gráfico de pizza (distribuição por categoria)
  const getCategoryData = () => {
    const categoryMap: { [key: string]: number } = {};

    filteredTransacoes.forEach((t: any) => {
      const category = t.categoria || "Outros";
      categoryMap[category] = (categoryMap[category] || 0) + parseFloat(t.valorReais || 0);
    });

    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));
  };

  const COLORS = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
  ];

  const lineChartData = getLineChartData();
  const categoryData = getCategoryData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dia">Últimas 24 horas</SelectItem>
            <SelectItem value="semana">Últimos 7 dias</SelectItem>
            <SelectItem value="mes">Últimos 30 dias</SelectItem>
            <SelectItem value="ano">Últimos 12 meses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Total de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ {totalReceitas.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {receitas.length} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Total de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ {totalDespesas.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {despesas.length} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium ${lucroLiquido >= 0 ? "text-blue-600" : "text-orange-600"}`}>
              Lucro Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${lucroLiquido >= 0 ? "text-blue-700" : "text-orange-700"}`}>
              R$ {lucroLiquido.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Margem: {totalReceitas > 0 ? ((lucroLiquido / totalReceitas) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Linha - Evolução */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Receitas e Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            {lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="receita"
                    stroke="#10b981"
                    name="Receitas"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="despesa"
                    stroke="#ef4444"
                    name="Despesas"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível para este período
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: R$ ${value.toFixed(2)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível para este período
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Barras - Comparação */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Receitas vs Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          {lineChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="receita" fill="#10b981" name="Receitas" />
                <Bar dataKey="despesa" fill="#ef4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível para este período
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Transações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-2">Data</th>
                  <th className="text-left py-2 px-2">Tipo</th>
                  <th className="text-left py-2 px-2">Categoria</th>
                  <th className="text-left py-2 px-2">Descrição</th>
                  <th className="text-right py-2 px-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransacoes.slice(0, 10).map((t: any, idx) => (
                  <tr key={t.id} className={idx % 2 === 0 ? "bg-muted/50" : ""}>
                    <td className="py-2 px-2">
                      {new Date(t.dataTransacao).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        t.tipo === "receita" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {t.tipo === "receita" ? "Receita" : "Despesa"}
                      </span>
                    </td>
                    <td className="py-2 px-2">{t.categoria}</td>
                    <td className="py-2 px-2">{t.descricao}</td>
                    <td className={`py-2 px-2 text-right font-semibold ${
                      t.tipo === "receita" ? "text-green-600" : "text-red-600"
                    }`}>
                      {t.tipo === "receita" ? "+" : "-"} R$ {parseFloat(t.valorReais).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTransacoes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma transação neste período
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
