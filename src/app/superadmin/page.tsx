/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/superadmin/dashboard/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, Users, Building2, TrendingUp, Activity, AlertCircle, Calendar, Trophy, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { toast } from "sonner";

interface DashboardData {
  totalEscolinhas: number;
  escolinhasAtivas: number;
  totalAlunos: number;
  receitaMensal: number;
  receitaAnual: number;
  crescimentoMensal: string;
  ticketMedio: string;
  ultimaAtualizacao: string;
  atividadeRecente: Array<{
    nome: string;
    acao: string;
    data: string;
  }>;
}

const SuperAdminDashboardPage = () => {
  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  const [mesSelecionado, setMesSelecionado] = useState(mesAtual);



  // Gera opções de meses (últimos 24 meses + "Todos")
  const mesesDisponiveis = [
    { value: "todos", label: "Todos os meses" },
    ...Array.from({ length: 24 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = format(date, "MMMM 'de' yyyy", { locale: ptBR });
      return { value, label: label.charAt(0).toUpperCase() + label.slice(1) };
    }),
  ];

    const mesAtualTexto = mesSelecionado === "todos"
    ? "Todos os meses"
    : mesesDisponiveis.find(m => m.value === mesSelecionado)?.label || "Mês atual";

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["superadmin-dashboard", mesSelecionado],
    queryFn: async () => {
      const params = mesSelecionado !== "todos" ? { mes: mesSelecionado } : {};
      const res = await api.get("/superadmin/dashboard", { params });
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
        <span className="ml-4 text-xl">Carregando dashboard...</span>
      </div>
    );
  }

  if (error) {
    toast.error("Erro ao carregar dashboard", {
      description: (error as any).message || "Tente novamente mais tarde",
    });

    return (
      <div className="text-center py-20">
        <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Erro ao carregar dados</h2>
        <p className="text-gray-600 mt-2">Verifique sua conexão ou permissões</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Nenhum dado disponível</h2>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho + Filtro de Mês */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold">Dashboard Geral</h1>
          <p className="text-gray-600 text-lg mt-2">
            Visão completa da plataforma FutElite • Última atualização: {data.ultimaAtualizacao}
          </p>
        </div>

        {/* Filtro por mês/ano */}
        <div className="w-full md:w-64">
          <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {mesesDisponiveis.map((mes) => (
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
        {/* Total Escolinhas */}
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Escolinhas</CardTitle>
            <Building2 className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{data.totalEscolinhas}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-green-600">{data.escolinhasAtivas} ativas</Badge>
              <Badge variant="secondary">{data.totalEscolinhas - data.escolinhasAtivas} inativas</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Total Alunos */}
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{data.totalAlunos.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              {data.crescimentoMensal} vs mês anterior
            </p>
          </CardContent>
        </Card>

        {/* Receita Mensal */}
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(data.receitaMensal)}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Ticket médio: {data.ticketMedio}
            </p>
          </CardContent>
        </Card>

        {/* Receita Anual Projetada */}
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Anual Projetada</CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(data.receitaAnual)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atividade Recente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            Atividade Recente ({mesAtualTexto})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.atividadeRecente.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Nenhuma atividade recente neste mês.</p>
            ) : (
              data.atividadeRecente.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm">
                      {item.nome.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.nome}</p>
                    <p className="text-xs text-gray-600">{item.acao} • {item.data}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Destaques e Avisos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Destaques e Avisos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <Trophy className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-medium">Meta batida!</p>
              <p className="text-sm text-gray-600">Receita mensal superou R$ 180k</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div>
              <p className="font-medium">3 pagamentos pendentes</p>
              <p className="text-sm text-gray-600">Total de R$ 1.797 em atraso</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium">+127 alunos esta semana</p>
              <p className="text-sm text-gray-600">Crescimento acima da média</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboardPage;