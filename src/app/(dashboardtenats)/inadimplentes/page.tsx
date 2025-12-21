// src/app/(dashboard)/inadimplentes/page.tsx
"use client";

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
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, Mail, Phone, Send } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import Link from "next/link";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  ChartLegend
);

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

interface Inadimplente {
  id: string;
  aluno: string;
  responsavel: string;
  telefone: string;
  email: string;
  valorDevido: number;
  mesesAtraso: number;
  ultimaMensalidade: string;
}

const inadimplentesMock: Record<string, Inadimplente[]> = {
  "2025-12": [
    { id: "1", aluno: "Lucas Oliveira", responsavel: "Maria Oliveira", telefone: "(11) 98765-4321", email: "maria@email.com", valorDevido: 850, mesesAtraso: 2, ultimaMensalidade: "Out/2025" },
    { id: "2", aluno: "Gabriel Santos", responsavel: "João Santos", telefone: "(11) 97654-3210", email: "joao@email.com", valorDevido: 1275, mesesAtraso: 3, ultimaMensalidade: "Set/2025" },
    { id: "3", aluno: "Matheus Costa", responsavel: "Ana Costa", telefone: "(11) 96543-2109", email: "ana@email.com", valorDevido: 425, mesesAtraso: 1, ultimaMensalidade: "Nov/2025" },
    { id: "4", aluno: "Enzo Gabriel", responsavel: "Paula Silva", telefone: "(11) 95432-1098", email: "paula@email.com", valorDevido: 1700, mesesAtraso: 4, ultimaMensalidade: "Ago/2025" },
    { id: "5", aluno: "Pedro Henrique", responsavel: "Carlos Henrique", telefone: "(11) 94321-0987", email: "carlos@email.com", valorDevido: 850, mesesAtraso: 2, ultimaMensalidade: "Out/2025" },
  ],
};

const InadimplentesPage = () => {       //inicio da função
   const [mesSelecionado, setMesSelecionado] = useState("2025-12");

  const inadimplentes = inadimplentesMock[mesSelecionado] || [];

  const totalDevido = inadimplentes.reduce((sum, i) => sum + i.valorDevido, 0);

  // Top 5 devedores para o gráfico
  const topDevedores = [...inadimplentes]
    .sort((a, b) => b.valorDevido - a.valorDevido)
    .slice(0, 5);

  const barChartData = {
    labels: topDevedores.map((d) => d.aluno),
    datasets: [
      {
        label: "Valor Devido",
        data: topDevedores.map((d) => d.valorDevido),
        backgroundColor: "#ef4444",
        borderColor: "#dc2626",
        borderWidth: 1,
      },
    ],
  };

 const barChartOptions: ChartOptions<"bar"> = {
  indexAxis: "y" as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.parsed?.x ?? 0;
          return `R$ ${Number(value).toLocaleString("pt-BR")}`;
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        callback: (value) => `R$ ${Number(value).toLocaleString("pt-BR")}`,
      },
    },
  },
};
    return ( 
<div className="p-4 lg:p-8 space-y-8">
  {/* Cabeçalho Responsivo */}
  <div className="space-y-4">
    {/* Botão Voltar + Título + Select alinhados */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <Button variant="outline" asChild className="self-start gap-2">
        <Link href="/financeiro">
          <ArrowLeft className="h-4 w-4" />
          Voltar Financeiro
        </Link>
      </Button>

      <div className="text-center flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold">Inadimplentes</h1>
        <p className="text-base sm:text-lg text-gray-600 mt-1">
           mensalidades pendentes —{" "}
          <span className="font-bold text-orange-600">
            {meses.find((m) => m.value === mesSelecionado)?.label || "Dezembro 2025"}
          </span>
        </p>
      </div>

      <div className="sm:w-40">
        <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
          <SelectTrigger>
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
    </div>
  </div>

  {/* Resumo Rápido — Centralizado e Responsivo */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
    <Card className="flex flex-col items-center justify-center text-center py-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Total Devido</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl sm:text-3xl font-bold text-red-600">
          R$ {totalDevido.toLocaleString("pt-BR")}
        </div>
      </CardContent>
    </Card>

    <Card className="flex flex-col items-center justify-center text-center py-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Inadimplentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl sm:text-3xl font-bold text-orange-600">
          {inadimplentes.length}
        </div>
        <p className="text-xs text-gray-600 mt-1">alunos/responsáveis</p>
      </CardContent>
    </Card>

    <Card className="flex flex-col items-center justify-center text-center py-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Média por Devedor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl sm:text-3xl font-bold">
          R$ {inadimplentes.length > 0 ? Math.round(totalDevido / inadimplentes.length).toLocaleString("pt-BR") : "0"}
        </div>
      </CardContent>
    </Card>
  </div>

  {/* Gráfico Top Devedores — Altura Responsiva */}
  <Card>
    <CardHeader>
      <CardTitle>Top 5 Maiores Devedores</CardTitle>
      <CardDescription>Valor devido por aluno</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-64 sm:h-80">
        <Bar data={barChartData} options={barChartOptions} />
      </div>
    </CardContent>
  </Card>

  {/* Lista de Inadimplentes — Totalmente Responsiva */}
  <Card>
    <CardHeader>
      <CardTitle>Lista Completa de Inadimplentes</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {inadimplentes.map((devedor) => (
          <div 
            key={devedor.id} 
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 bg-red-50 rounded-lg border border-red-200"
          >
            {/* Coluna esquerda: Avatar + Info do Aluno */}
            <div className="flex items-center gap-4 min-w-0">
              <Avatar className="h-14 w-14 shrink-0">
                <AvatarFallback className="bg-red-600 text-white text-lg">
                  {devedor.aluno.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-lg truncate">{devedor.aluno}</p>
                <p className="text-sm text-gray-600 truncate">
                  Responsável: {devedor.responsavel}
                </p>
                <p className="text-sm text-gray-600">
                  Última mensalidade: {devedor.ultimaMensalidade}
                </p>
              </div>
            </div>

            {/* Coluna direita: Valor + Ações */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="text-center sm:text-right">
                <p className="text-2xl font-bold text-red-600">
                  R$ {devedor.valorDevido.toLocaleString("pt-BR")}
                </p>
                <Badge variant="outline" className="text-red-600 border-red-600 mt-2">
                  {devedor.mesesAtraso} {devedor.mesesAtraso === 1 ? "mês atrasado" : "meses atrasados"}
                </Badge>
              </div>

              <div className="flex gap-3 justify-center sm:justify-end">
                <Button size="sm" variant="outline" className="px-3">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="px-3">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 px-4">
                  <Send className="h-4 w-4 mr-1" />
                  Cobrar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
</div>
     );
}
 
export default InadimplentesPage;