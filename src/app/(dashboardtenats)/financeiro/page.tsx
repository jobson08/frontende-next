// src/app/(dashboard)/financeiro/page.tsx
"use client";
// @ts-nocheck

import { useEscolinhaConfig } from "@/src/context/EscolinhaConfigContext";
import { useState } from "react";
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
import { Line, Doughnut } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { TrendingUp, Activity} from "lucide-react";
import { ResponsiveContainer, LineChart, Line as RechartsLine, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend } from "recharts";

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

// === DADOS E TIPOS ===
interface StatusMensalidade {
  name: string;
  value: number;
}

interface EvolucaoMensal {
  mes: string;
  receita: number;
}

interface DadosMensais {
  receitaReal: number;
  metaReceita: number;
  inadimplencia: number;
  alunosPagantes: number;
  alunosTotais: number;
  statusMensalidades: StatusMensalidade[];
  evolucaoMensal: EvolucaoMensal[];
}

interface FinanceiroPageProps {
  configEscolinha?: {
    aulasExtrasAtivas: boolean;
    crossfitAtivo: boolean;
  };
}

const dadosMensais: Record<string, DadosMensais> = {
  "2025-12": {
    receitaReal: 42800,
    metaReceita: 45000,
    inadimplencia: 6200,
    alunosPagantes: 215,
    alunosTotais: 248,
    statusMensalidades: [
      { name: "Pagas", value: 215 },
      { name: "Pendentes", value: 20 },
      { name: "Atrasadas", value: 13 },
    ],
    evolucaoMensal: [
      { mes: "Jan", receita: 35000 },
      { mes: "Fev", receita: 38000 },
      { mes: "Mar", receita: 40000 },
      { mes: "Abr", receita: 39000 },
      { mes: "Mai", receita: 42000 },
      { mes: "Jun", receita: 41000 },
      { mes: "Jul", receita: 43000 },
      { mes: "Ago", receita: 44000 },
      { mes: "Set", receita: 43000 },
      { mes: "Out", receita: 45000 },
      { mes: "Nov", receita: 44000 },
      { mes: "Dez", receita: 42800 },
    ],
  },
};

const meses = [
  { value: "2025-01", label: "Janeiro 2025" },
  { value: "2025-02", label: "Fevereiro 2025" },
  { value: "2025-03", label: "Março 2025" },
  { value: "2025-04", label: "Abril 2025" },
  { value: "2025-05", label: "Maio 2025" },
  { value: "2025-06", label: "Junho 2025" },
  { value: "2025-07", label: "Julho 2025" },
  { value: "2025-08", label: "Agosto 2025" },
  { value: "2025-09", label: "Setembro 2025" },
  { value: "2025-10", label: "Outubro 2025" },
  { value: "2025-11", label: "Novembro 2025" },
  { value: "2025-12", label: "Dezembro 2025" },
];

// Dados CrossFit vs Futebol (ano completo)
const receitaCrossFitVsFutebol = [
  { mes: "Jan", futebol: 35000, crossfit: 0 },
  { mes: "Fev", futebol: 38000, crossfit: 0 },
  { mes: "Mar", futebol: 40000, crossfit: 4500 },
  { mes: "Abr", futebol: 39000, crossfit: 8900 },
  { mes: "Mai", futebol: 42000, crossfit: 13400 },
  { mes: "Jun", futebol: 41000, crossfit: 17800 },
  { mes: "Jul", futebol: 43000, crossfit: 22300 },
  { mes: "Ago", futebol: 44000, crossfit: 26800 },
  { mes: "Set", futebol: 43000, crossfit: 31200 },
  { mes: "Out", futebol: 45000, crossfit: 35600 },
  { mes: "Nov", futebol: 44000, crossfit: 40100 },
  { mes: "Dez", futebol: 42800, crossfit: 44600 },
];

const totalFutebol = receitaCrossFitVsFutebol.reduce((acc, m) => acc + m.futebol, 0);
const totalCrossFit = receitaCrossFitVsFutebol.reduce((acc, m) => acc + m.crossfit, 0);
const totalGeral = totalFutebol + totalCrossFit;
const percentCrossFit = totalGeral > 0 ? ((totalCrossFit / totalGeral) * 100).toFixed(1) : "0";

const FinanceiroPage = () => {    //inivio da função
  const { crossfitAtivo } = useEscolinhaConfig();

  const [mesSelecionado, setMesSelecionado] = useState("2025-12");

  const dados = dadosMensais[mesSelecionado] ?? dadosMensais["2025-12"];
  const mesLabel = meses.find(m => m.value === mesSelecionado)?.label ?? "Dezembro 2025";
  const porcentagemMeta = Math.round((dados.receitaReal / dados.metaReceita) * 100);

  
  
  // Dados corretos para Recharts (array de objetos)
const receitaCrossFitData = receitaCrossFitVsFutebol.map(item => ({
  mes: item.mes,
  futebol: item.futebol,
  crossfit: item.crossfit,
}));

  // Dados do Line Chart original
  const lineChartData = {
    labels: dados.evolucaoMensal.map((d) => d.mes),
    datasets: [
      {
        label: "Receita",
        data: dados.evolucaoMensal.map((d) => d.receita),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y ?? 0;
            return `R$ ${Number(value).toLocaleString("pt-BR")}`;
          },
        },
      },
    },
  };

  // Dados do Doughnut Chart
  const doughnutData = {
    labels: dados.statusMensalidades.map((s) => s.name),
    datasets: [
      {
        data: dados.statusMensalidades.map((s) => s.value),
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        borderColor: "#fff",
        borderWidth: 3,
      },
    ],
  };

  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed ?? 0;
            return `${value} alunos`;
          },
        },
      },
    },
  };

  // Dados do gráfico CrossFit vs Futebol
  const crossFitChartData = {
    labels: receitaCrossFitVsFutebol.map(d => d.mes),
    datasets: [
      {
        label: "Futebol Infantil",
        data: receitaCrossFitVsFutebol.map(d => d.futebol),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "CrossFit Adultos",
        data: receitaCrossFitVsFutebol.map(d => d.crossfit),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };
    return (
<div className="p-4 lg:p-8 space-y-8">
  {/* Cabeçalho com mês e botão */}
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="text-center sm:text-left">
      <h1 className="text-2xl sm:text-3xl font-bold">Financeiro</h1>
      <p className="text-lg sm:text-xl text-gray-600 mt-1">
        Visão completa —{" "}
        <span className="font-bold text-blue-600">{mesLabel}</span>
      </p>
    </div>

    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
        <SelectTrigger className="w-full sm:w-48">
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

      <Button asChild className="w-full sm:w-auto bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
        <Link href="/inadimplentes">
          Inadimplentes
        </Link>
      </Button>
    </div>
  </div>

  {/* Resumo Rápido — RESPONSIVO E CENTRALIZADO */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {/* Receita do Mês */}
    <Card className="flex flex-col justify-center items-center text-center p-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl sm:text-2xl font-bold text-green-600">
          R$ {dados.receitaReal.toLocaleString("pt-BR")}
        </div>
        <p className="text-xs text-gray-600">
          {porcentagemMeta}% da meta
          <br />
          (R$ {dados.metaReceita.toLocaleString("pt-BR")})
        </p>
      </CardContent>
    </Card>

    {/* Inadimplência — CLICÁVEL */}
    <Link href="/inadimplentes" className="block">
      <Card className="flex flex-col justify-center items-center text-center p-6 hover:shadow-lg transition-shadow hover:border-orange-400">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Inadimplência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl sm:text-2xl font-bold text-orange-600">
            R$ {dados.inadimplencia.toLocaleString("pt-BR")}
          </div>
          <p className="text-xs text-gray-600">Clique para ver detalhes →</p>
        </CardContent>
      </Card>
    </Link>

    {/* Alunos Pagantes */}
    <Card className="flex flex-col justify-center items-center text-center p-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Alunos Pagantes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl sm:text-2xl font-bold">
          {dados.alunosPagantes}/{dados.alunosTotais}
        </div>
        <p className="text-xs text-gray-600">alunos ativos</p>
      </CardContent>
    </Card>

    {/* Status Geral */}
    <Card className="flex flex-col justify-center items-center text-center p-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge className={`text-sm px-4 py-2 ${porcentagemMeta >= 100 ? "bg-green-600" : "bg-orange-600"}`}>
          {porcentagemMeta >= 100 ? "Meta Atingida!" : "Em Andamento"}
        </Badge>
      </CardContent>
    </Card>
  </div>

  {/* Gráficos — RESPONSIVOS */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Evolução da Receita */}
    <Card>
      <CardHeader>
        <CardTitle>Evolução da Receita 2025</CardTitle>
        <CardDescription>Comparação mês a mês</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 sm:h-80">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </CardContent>
    </Card>

    {/* Status das Mensalidades */}
    <Card>
      <CardHeader>
        <CardTitle>Status das Mensalidades</CardTitle>
        <CardDescription>{mesLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 sm:h-80">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </CardContent>
    </Card>  
  </div>

  {crossfitAtivo && (
  <Card className="border-2 border-green-300 bg-linear-to-br from-green-50 to-emerald-50 hover:shadow-2xl transition-all cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-green-800 text-2xl">
            <TrendingUp className="h-8 w-8" />
            Impacto do CrossFit na Receita da Escolinha
          </CardTitle>
          <CardDescription className="text-green-700 text-lg">
            Veja como o CrossFit para adultos está impulsionando o faturamento em 2025
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Cards de Totais */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-800">
                  Receita Futebol Infantil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  R$ {totalFutebol.toLocaleString("pt-BR")}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Receita CrossFit Adultos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">
                  R$ {totalCrossFit.toLocaleString("pt-BR")}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-800">
                  Receita Total 2025
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800">
                  R$ {totalGeral.toLocaleString("pt-BR")}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-purple-800">
                  Participação CrossFit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-800">{percentCrossFit}%</div>
                <p className="text-sm text-purple-700">da receita total</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico  comparativo crossfit*/}
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={receitaCrossFitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <RechartsTooltip 
                  formatter={(value: number | undefined) => {
                    if (value === undefined) return "R$ 0";
                    return `R$ ${value.toLocaleString("pt-BR")}`;
                  }}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <RechartsLegend />
                <RechartsLine 
                  type="monotone" 
                  dataKey="futebol" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  name="Futebol Infantil" 
                  dot={{ fill: "#3b82f6" }}
                />
                <RechartsLine 
                  type="monotone" 
                  dataKey="crossfit" 
                  stroke="#ef4444" 
                  strokeWidth={4} 
                  name="CrossFit Adultos" 
                  dot={{ fill: "#ef4444" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Análise */}
          <div className="p-6 bg-green-100 rounded-lg border border-green-300">
            <h3 className="text-xl font-bold text-green-900 mb-3">Conclusão</h3>
            <p className="text-green-800 leading-relaxed">
              O módulo <strong>CrossFit para adultos</strong> gerou <strong>R$ {totalCrossFit.toLocaleString("pt-BR")}</strong> em receita adicional em 2025, representando <strong>{percentCrossFit}% do faturamento total</strong> da escolinha.
            </p>
            <p className="text-green-800 mt-3">
              Isso significa mais estabilidade financeira, fidelização das famílias e um modelo de negócio mais completo.
            </p>
            <p className="text-green-900 font-semibold mt-4">
              Resultado: A escolinha virou um verdadeiro centro esportivo familiar!
            </p>
          </div>
        </CardContent>
  </Card>
    )}
</div>
     );
}
 
export default FinanceiroPage;