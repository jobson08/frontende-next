// src/app/superadmin/relatorios/page.tsx
"use client";

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { DollarSign, Users, TrendingUp, Calendar } from "lucide-react";

// Dados mock (em produção vem do Supabase)
const receitaMensal = [
  { mes: "Jan", receita: 45000 },
  { mes: "Fev", receita: 62000 },
  { mes: "Mar", receita: 78000 },
  { mes: "Abr", receita: 95000 },
  { mes: "Mai", receita: 112000 },
  { mes: "Jun", receita: 128000 },
  { mes: "Jul", receita: 145000 },
  { mes: "Ago", receita: 162000 },
  { mes: "Set", receita: 178000 },
  { mes: "Out", receita: 192000 },
  { mes: "Nov", receita: 208000 },
  { mes: "Dez", receita: 225000 },
];

const novosAlunos = [
  { mes: "Jan", alunos: 320 },
  { mes: "Fev", alunos: 450 },
  { mes: "Mar", alunos: 580 },
  { mes: "Abr", alunos: 720 },
  { mes: "Mai", alunos: 890 },
  { mes: "Jun", alunos: 1050 },
  { mes: "Jul", alunos: 1220 },
  { mes: "Ago", alunos: 1380 },
  { mes: "Set", alunos: 1520 },
  { mes: "Out", alunos: 1680 },
  { mes: "Nov", alunos: 1820 },
  { mes: "Dez", alunos: 1980 },
];

const distribuicaoPlanos = [
  { nome: "Básico", valor: 18, fill: "#10b981" },
  { nome: "Pro", valor: 22, fill: "#3b82f6" },
  { nome: "Enterprise", valor: 8, fill: "#a855f7" },
];

const topEscolinhas = [
  { nome: "Futebol Raiz Academy", alunos: 289, receita: 12800 },
  { nome: "Gol de Placa Academy", alunos: 145, receita: 8420 },
  { nome: "Elite Futebol Infantil", alunos: 132, receita: 7800 },
  { nome: "Pequenos Craques", alunos: 68, receita: 3200 },
  { nome: "Futuros Campeões", alunos: 112, receita: 6500 },
];

const RelatoriosPage = () => {
  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <TrendingUp className="h-10 w-10 text-green-600" />
          Relatórios e Análises
        </h1>
        <p className="text-gray-600 text-lg mt-2">Acompanhe o crescimento e desempenho da plataforma FutElite</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Receita Total 2025
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ 2.225.040</div>
            <p className="text-xs text-gray-600 mt-2">+42% vs 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Total de Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">6.842</div>
            <p className="text-xs text-gray-600 mt-2">+28% vs ano anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Crescimento Médio Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">+18.4%</div>
            <p className="text-xs text-gray-600 mt-2">Receita</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Taxa de Retenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">94.2%</div>
            <p className="text-xs text-gray-600 mt-2">Escolinhas ativas</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Receita Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Evolução da Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={receitaMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />
                <Legend />
                <Line type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={3} name="Receita" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Novos Alunos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Crescimento de Novos Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={novosAlunos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="alunos" fill="#3b82f6" name="Novos Alunos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição de Planos + Top Escolinhas */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Distribuição de Planos */}
       <Card>
          <CardHeader>
            <CardTitle>Distribuição por Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribuicaoPlanos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({
                    index,
                  }) => {
                    const entry = distribuicaoPlanos[index];
                    return `${entry.nome}: ${entry.valor}`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {distribuicaoPlanos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} escolinhas`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top 5 Escolinhas */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Escolinhas por Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topEscolinhas.map((escolinha, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-400">#{i + 1}</div>
                    <div>
                      <p className="font-medium">{escolinha.nome}</p>
                      <p className="text-sm text-gray-600">{escolinha.alunos} alunos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      R$ {escolinha.receita.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-xs text-gray-600">/mês</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RelatoriosPage;