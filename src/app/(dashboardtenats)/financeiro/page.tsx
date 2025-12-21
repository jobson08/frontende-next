// src/app/(dashboard)/financeiro/page.tsx
"use client";
// @ts-nocheck

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
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  ChartTooltip,
  ChartLegend,
  Filler
);

// Tipos
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

// Dados
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
const FinanceiroPage = () => {      //Inicio da função

const [mesSelecionado, setMesSelecionado] = useState("2025-12");

  const dados = dadosMensais[mesSelecionado] || dadosMensais["2025-12"];

  const mesLabel = meses.find(m => m.value === mesSelecionado)?.label || "Dezembro 2025";

  const porcentagemMeta = Math.round((dados.receitaReal / dados.metaReceita) * 100);

  // Dados do Line Chart
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

  // Options com tipagem correta — ERRO RESOLVIDO!
 const lineChartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.dataset.label || "";
          if (label === "Receita") {
            const value = context.parsed?.y ?? 0;
            return `R$ ${Number(value).toLocaleString("pt-BR")}`;
          }
          const value = context.parsed ?? 0;
          return `${value} alunos`;
        },
      },
    },
  },
};

const doughnutOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
    },
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
    return (
<div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho com mês e botão para inadimplentes */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-xl text-gray-600">
            Visão completa das finanças —{" "}
            <span className="font-bold text-blue-600">{mesLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
            <SelectTrigger className="w-64">
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

          {/* BOTÃO PARA INADIMPLENTES */}
          <Button asChild className="bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
            <Link href="/inadimplentes">
              Ver Inadimplentes
            </Link>
          </Button>
        </div>
      </div>

      {/* Resumo Rápido */}
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
    <Card>
        <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="text-3xl font-bold text-green-600">
            R$ {dados.receitaReal.toLocaleString("pt-BR")}
        </div>
        <p className="text-xs text-gray-600 mt-1">
            {porcentagemMeta}% da meta (R$ {dados.metaReceita.toLocaleString("pt-BR")})
        </p>
        </CardContent>
  </Card>

  {/* CARD CLICÁVEL CORRIGIDO */}
  <Link href="/inadimplentes" className="block">
    <Card className="hover:shadow-lg transition-shadow hover:border-orange-400">
      <CardHeader className="pb-2">
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

  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">Alunos Pagantes</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">
        {dados.alunosPagantes}/{dados.alunosTotais}
      </div>
      <p className="text-xs text-gray-600 mt-1">alunos ativos</p>
    </CardContent>
  </Card>

  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
    </CardHeader>
    <CardContent>
      <Badge className={porcentagemMeta >= 100 ? "bg-green-600" : "bg-orange-600"}>
        {porcentagemMeta >= 100 ? "Meta Atingida!" : "Em Andamento"}
      </Badge>
    </CardContent>
  </Card>
</div>

      {/* Gráficos */}
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Receita 2025</CardTitle>
            <CardDescription>Comparação mês a mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status das Mensalidades</CardTitle>
            <CardDescription>{mesLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
     );
}
 
export default FinanceiroPage;