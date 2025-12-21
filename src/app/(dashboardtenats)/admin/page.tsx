// src/app/(dashboard)/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  Activity,
} from "lucide-react";

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

// Tipos
interface DadosDoMes {
  totalAlunos: number;
  alunosAtivos: number;
  receitaMes: string;
  aulasHoje: number;
  pagamentosPendentes: number;
  crescimentoMes: string;
}
// Dados mock por mês (você pode expandir depois)
const dadosPorMes: Record<string, DadosDoMes> = {
  "2025-12": {
    totalAlunos: 248,
    alunosAtivos: 215,
    receitaMes: "R$ 42.800,00",
    aulasHoje: 28,
    pagamentosPendentes: 12,
    crescimentoMes: "+14%",
  },
  // Adicione outros meses aqui
};

const  AdminDashboardPage = () => {   //inicio da função
 
  const [mesSelecionado, setMesSelecionado] = useState("2025-12");

  const mesLabel = meses.find((m) => m.value === mesSelecionado)?.label || "Dezembro 2025";

 const stats = dadosPorMes[mesSelecionado] || dadosPorMes["2025-12"];

  const proximasAulas = [
    { hora: "09:00", aula: "Musculação - Turma A", professor: "Mariana Costa", alunos: 12 },
    { hora: "10:00", aula: "Cross Training", professor: "Rafael Lima", alunos: 15 },
    { hora: "18:00", aula: "Natação Infantil", professor: "Beatriz Souza", alunos: 8 },
  ];

  const aniversariantes = [
    { nome: "Enzo Gabriel Silva", idade: 8 },
    { nome: "Maria Luiza Costa", idade: 6 },
  ];
    return ( 
      <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho com mês atual/selecionado e filtro */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard da escolinha</h1>
          <p className="text-gray-600 text-lg mt-2">
            Visão geral da sua unidade —{" "}
            <span className="font-bold text-blue-600">{mesLabel}</span>
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o mês" />
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

      {/* Cards Principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAlunos}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-600 font-medium">{stats.alunosAtivos} ativos</span> este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.receitaMes}</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              {stats.crescimentoMes} vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aulas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aulasHoje}</div>
            <p className="text-xs text-gray-500 mt-1">programadas</p>
          </CardContent>
        </Card>

        <Card className={stats.pagamentosPendentes > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            {stats.pagamentosPendentes > 0 ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <Activity className="h-4 w-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.pagamentosPendentes > 0 ? "text-red-600" : "text-green-600"}`}>
              {stats.pagamentosPendentes}
            </div>
            <p className="text-xs text-gray-500 mt-1">mensalidades em aberto</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção Rápida */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Próximas Aulas */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Aulas Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proximasAulas.map((aula, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{aula.aula}</p>
                    <p className="text-xs text-gray-600">{aula.hora} - {aula.professor}</p>
                  </div>
                  <Badge variant="secondary">{aula.alunos} alunos</Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/funcionarios">Ver agenda completa</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Aniversariantes do Dia */}
        <Card>
          <CardHeader>
            <CardTitle>Aniversariantes Hoje 🎉</CardTitle>
          </CardHeader>
          <CardContent>
            {aniversariantes.length > 0 ? (
              <div className="space-y-4">
                {aniversariantes.map((a, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-linear-to-r from-purple-100 to-pink-100 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                      {a.idade}
                    </div>
                    <div>
                      <p className="font-medium">{a.nome}</p>
                      <p className="text-xs text-gray-600">Faz {a.idade} anos hoje!</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Nenhum aniversariante hoje</p>
            )}
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/alunos/novo">
                <Users className="mr-2 h-4 w-4" />
                Novo Aluno
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/funcionario/novo">
                Novo Funcionário
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/financeiro">
                Ver Financeiro Completo
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
     );
}
 
export default AdminDashboardPage ;