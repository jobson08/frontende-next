// src/app/superadmin/page.tsx
"use client";

import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Activity, AlertCircle, Building2, DollarSign, TrendingUp } from "lucide-react";

const SuperAdminPage = () => {  //inicio da função

    const stats = {
    totalAcademias: 52,
    academiasAtivas: 48,
    receitaMes: "R$ 32.640,00",
    mrr: "R$ 98.500,00",
    crescimento: "+22%",
    churn: "1.8%",
  };

  const topAcademias = [
    { nome: "Academia PowerFit", receita: "R$ 8.420", alunos: 312 },
    { nome: "Cross Elite Center", receita: "R$ 7.180", alunos: 289 },
    { nome: "Iron Body Gym", receita: "R$ 6.950", alunos: 265 },
    { nome: "Vida Ativa Fitness", receita: "R$ 5.800", alunos: 198 },
  ];
    return ( 
        <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-4xl font-bold">SuperAdmin - Controle Total do SaaS</h1>
        <p className="text-gray-600 text-lg mt-2">Gerencie todas as escolas da plataforma</p>
      </div>

      {/* Cards Principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de escolas</CardTitle>
            <Building2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAcademias}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-600 font-medium">{stats.academiasAtivas} ativas</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.receitaMes}</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              {stats.crescimento} vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.mrr}</div>
            <p className="text-xs text-gray-500 mt-1">Receita mensal recorrente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.churn}</div>
            <p className="text-xs text-gray-500 mt-1">escolas que cancelaram</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
            <Badge className="bg-green-600">Excelente</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Saudável</div>
            <p className="text-xs text-gray-500 mt-1">Crescimento acima da meta</p>
          </CardContent>
        </Card>
      </div>

      {/* Top escolas */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 escolas (Receita Mensal)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topAcademias.map((academia, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-linear-to-r from-gray-50 to-gray-100 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-linear-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-lg">{academia.nome}</p>
                    <p className="text-sm text-gray-600">{academia.alunos} alunos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{academia.receita}</p>
                  <Badge variant="secondary">Plano Enterprise</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    );
}
 
export default SuperAdminPage;