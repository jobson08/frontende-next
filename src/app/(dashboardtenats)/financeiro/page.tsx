/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/financeiro/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import api from "@/src/lib/api";
import Link from "next/link";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FinanceiroMensal {
  mes: string;
  receitaReal: number;
  metaReceita: number;
  inadimplencia: number;
  alunosPagantes: number;
  alunosTotais: number;
  statusMensalidades: { name: string; value: number }[];
  evolucaoMensal: { mes: string; receita: number }[];
  evolucaoInadimplencia: { mes: string; valor: number }[];   // ← Novo campo
}

const FinanceiroPage = () => {
  const [mesSelecionado, setMesSelecionado] = useState(format(new Date(), "yyyy-MM"));

  const { data: dados, isLoading, error, refetch } = useQuery<FinanceiroMensal>({
    queryKey: ["financeiro", mesSelecionado],
    queryFn: async () => {
      const res = await api.get("/tenant/financeiro/mensal", {
        params: { mes: mesSelecionado },
      });
      return res.data.data;
    },
    retry: 2,
  });

  const meses = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy", { locale: ptBR }),
    };
  }).reverse();

  const porcentagemMeta = dados
    ? Math.round((dados.receitaReal / dados.metaReceita) * 100)
    : 0;

  // ==================== GRÁFICO DE LINHA ====================
  const lineChartData = {
    labels: dados?.evolucaoMensal.map((d) => d.mes) || [],
    datasets: [
      {
        label: "Receita Mensal",
        data: dados?.evolucaoMensal.map((d) => d.receita) || [],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        tension: 0.4,
        fill: true,
        borderWidth: 3,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" as const },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y ?? 0;
            return `R$ ${Number(value).toLocaleString("pt-BR")}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => {
            return `R$ ${Number(value).toLocaleString("pt-BR")}`;
          },
        },
      },
    },
  } as const; // ← Isso ajuda o TypeScript

  if ( isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-600">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  if (error || !dados) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar dados financeiros</h2>
        <p className="text-gray-600 mb-6">Não foi possível conectar com o servidor.</p>
        <Button onClick={() => refetch()}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-xl text-gray-600 mt-1">
            Visão completa —{" "}
            <span className="font-semibold text-blue-600">
              {meses.find((m) => m.value === mesSelecionado)?.label}
            </span>
          </p>
        </div>

        <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {meses.map((mes) => (
              <SelectItem key={mes.value} value={mes.value}>
                {mes.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cards Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              R$ {dados.receitaReal.toLocaleString("pt-BR")}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {porcentagemMeta}% da meta • R$ {dados.metaReceita.toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>

        <Link href="/inadimplentes" className="block">
          <Card className="hover:shadow-lg transition-all hover:border-orange-400 cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Inadimplência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                R$ {dados.inadimplencia.toLocaleString("pt-BR")}
              </div>
              <p className="text-xs text-gray-600 mt-1">Clique para ver detalhes →</p>
            </CardContent>
          </Card>
        </Link>

       {/* Alunos Pagantes - CORRIGIDO */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Alunos Pagantes Neste mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 text-3xl font-bold text-emerald-600">
              <p>Total: </p>
              {dados.alunosPagantes}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {dados.alunosTotais} alunos ativos
            </p>
            {/*<div className="mt-2 text-xs text-gray-500">
              {dados.alunosTotais > 0 
                ? Math.round((dados.alunosPagantes / dados.alunosTotais) * 100) 
                : 0}% pagaram em dia
            </div>*/}
          </CardContent>
        </Card>

          {/* Taxa de Adimplência - Substitua o card "Status Geral" */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                  Adimplência
                <Badge variant="secondary" className="text-xs">
                  Este mês
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-5xl font-bold text-emerald-600 mb-1">
                {dados.alunosTotais > 0 
                  ? Math.round((dados.alunosPagantes / dados.alunosTotais) * 100) 
                  : 0}%
              </div>
              
              <p className="text-sm text-gray-600">
                {dados.alunosPagantes} pagaram de {dados.alunosTotais} alunos
              </p>

              <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ 
                    width: `${dados.alunosTotais > 0 ? (dados.alunosPagantes / dados.alunosTotais) * 100 : 0}%` 
                  }}
                />
              </div>

              <p className="text-xs text-gray-500 mt-3">
                {dados.alunosTotais > 0 
                  ? `${dados.alunosTotais - dados.alunosPagantes} alunos pendentes/atrasados` 
                  : 'Nenhum aluno cadastrado'}
              </p>
            </CardContent>
          </Card>
        
      </div>

      {/* Gráficos */}
        <div className="gap-6">
         <Card>
          <CardHeader>
            <CardTitle>Status das Mensalidades</CardTitle>
            <CardDescription>
              {meses.find((m) => m.value === mesSelecionado)?.label}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <Doughnut
              data={{
                labels: dados.statusMensalidades.map((s) => s.name),
                datasets: [
                  {
                    data: dados.statusMensalidades.map((s) => s.value),
                    backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
                    borderColor: "#fff",
                    borderWidth: 3,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom" },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

     {/* Gráfico Avançado: Evolução da Receita + Inadimplência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolução da Receita e Inadimplência
          </CardTitle>
          <CardDescription>Últimos 12 meses — Comparativo</CardDescription>
        </CardHeader>
        <CardContent className="h-96">
          <Line 
            data={{
              labels: dados.evolucaoMensal.map((d) => d.mes),
              datasets: [
                {
                  label: "Receita Real",
                  data: dados.evolucaoMensal.map((d) => d.receita),
                  borderColor: "#10b981",
                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                  tension: 0.4,
                  fill: true,
                  borderWidth: 4,
                  pointRadius: 5,
                  pointHoverRadius: 7,
                },
                {
                  label: "Inadimplência",
                  data: dados.evolucaoInadimplencia?.map((d) => d.valor) || [],
                  borderColor: "#ef4444",
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                  tension: 0.3,
                  fill: true,
                  borderWidth: 3,
                  borderDash: [6, 4], // linha tracejada para destacar
                  pointRadius: 4,
                  pointHoverRadius: 6,
                },
              ],
            }} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: 'index',
                intersect: false,
              },
              plugins: {
                legend: { 
                  position: "bottom" as const,
                  labels: {
                    usePointStyle: true,
                    padding: 25,
                    font: { size: 13 },
                  }
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.85)',
                  titleFont: { size: 14 },
                  bodyFont: { size: 13 },
                  padding: 12,
                  callbacks: {
                    label: (context: any) => {
                      const value = context.parsed.y ?? 0;
                      return `${context.dataset.label}: R$ ${Number(value).toLocaleString("pt-BR")}`;
                    },
                  },
                },
              },
              scales: {
                x: {
                  grid: { color: 'rgba(0,0,0,0.05)' },
                },
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(0,0,0,0.05)' },
                  ticks: {
                    callback: (value: string | number) => `R$ ${Number(value).toLocaleString("pt-BR")}`,
                  },
                },
              },
            }} 
          />
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500 pt-8">
        Dados atualizados em: {new Date().toLocaleString("pt-BR")}
      </div>
    </div>
  );
};

export default FinanceiroPage;