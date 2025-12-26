// src/app/superadmin/dashboard/page.tsx
"use client";

import { DollarSign, Users, Building2, TrendingUp, Activity, AlertCircle, Calendar, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";

const SuperAdminDashboardPage = () => {
  // Métricas mock (em produção vem do Supabase)
  const metricas = {
    totalEscolinhas: 48,
    escolinhasAtivas: 45,
    totalAlunos: 6842,
    receitaMensal: "R$ 185.420",
    receitaAnual: "R$ 2.225.040",
    crescimentoMensal: "+18.4%",
    ticketMedio: "R$ 271",
    taxaConversaoTeste: "78%",
    ultimaAtualizacao: "26/12/2025 às 14:30",
  };

  const recentes = [
    { nome: "Gol de Placa Academy", acao: "Novo cadastro", data: "Hoje às 13:45" },
    { nome: "Futebol Raiz Academy", acao: "Upgrade para Pro", data: "Hoje às 11:20" },
    { nome: "Pequenos Craques", acao: "Pagamento recebido", data: "Ontem às 18:10" },
    { nome: "Elite Futebol Infantil", acao: "Novo aluno cadastrado", data: "Ontem às 15:30" },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-4xl font-bold">Dashboard Geral</h1>
        <p className="text-gray-600 text-lg mt-2">
          Visão completa da plataforma FutElite • Última atualização: {metricas.ultimaAtualizacao}
        </p>
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
            <div className="text-3xl font-bold text-purple-600">{metricas.totalEscolinhas}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-green-600">{metricas.escolinhasAtivas} ativas</Badge>
              <Badge variant="secondary">{metricas.totalEscolinhas - metricas.escolinhasAtivas} inativas</Badge>
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
            <div className="text-3xl font-bold text-blue-600">{metricas.totalAlunos.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              {metricas.crescimentoMensal} vs mês anterior
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
            <div className="text-3xl font-bold text-green-600">{metricas.receitaMensal}</div>
            <p className="text-xs text-gray-600 mt-2">
              Ticket médio: {metricas.ticketMedio}
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
            <div className="text-3xl font-bold text-orange-600">{metricas.receitaAnual}</div>
            <p className="text-xs text-gray-600 mt-2">
              Conversão de teste: {metricas.taxaConversaoTeste}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Atividade Recente + Destaques */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Atividade Recente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentes.map((item, i) => (
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
              ))}
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
    </div>
  );
};

export default SuperAdminDashboardPage;