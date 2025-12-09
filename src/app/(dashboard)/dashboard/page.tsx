"use client";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { AlertCircle, Building2, Calendar, DollarSign, TrendingUp, UserCheck, Users } from "lucide-react";

const DashboardPage = () => {
    
    // Simulação de dados — depois vem do useQuery
  const user = {
    name: "João Silva",
    role: "ADMIN", // Mude pra "SUPER_ADMIN" ou "ADMIN" pra ver a versão dele
  };

  const stats = {
    alunosAtivos: 248,
    responsaveis: 189,
    faturamentoMes: 124800,
    crescimento: 18.5,
    inadimplentes: 12,
    tenants: 24, // só Super Admin vê
  };

  const ultimosAlunos = [
    { name: "Enzo Gabriel", data: "05/04/2025", status: "ATIVO" },
    { name: "Maria Luiza", data: "04/04/2025", status: "ATIVO" },
    { name: "Lucas Andrade", data: "03/04/2025", status: "INATIVO" },
  ];

  const getWelcomeMessage = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Bom dia";
    if (hora < 18) return "Boa tarde";
    return "Boa noite";
  };
    return ( 
    <div className="space-y-8 p-4 lg:p-8">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getWelcomeMessage()}, {user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div> 

        {/* Cards Principais */}    
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Super Admin vê tenants */}
        {user.role === "SUPER_ADMIN" && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total de Academias</CardTitle>
              <Building2 className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{stats.tenants}</div>
              <p className="text-xs text-blue-600 mt-1">Ativas no sistema</p>
            </CardContent>
          </Card>
        )}

        {/* Alunos */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Alunos Ativos</CardTitle>
            <Users className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.alunosAtivos}</div>
            <p className="text-xs text-orange-600 mt-1">Matriculados este mês</p>
          </CardContent>
        </Card>

        {/* Faturamento */}
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Faturamento do Mês</CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">
              R$ {stats.faturamentoMes.toLocaleString("pt-BR")}
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
              <TrendingUp className="h-4 w-4" />
              +{stats.crescimento}% vs mês passado
            </div>
          </CardContent>
        </Card>

        {/* Inadimplentes */}
        <Card className={stats.inadimplentes > 0 ? "border-red-200 bg-red-50" : "border-gray-200"}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${stats.inadimplentes > 0 ? "text-red-700" : "text-gray-700"}`}>
              Inadimplentes
            </CardTitle>
            <AlertCircle className={`h-5 w-5 ${stats.inadimplentes > 0 ? "text-red-600" : "text-gray-500"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stats.inadimplentes > 0 ? "text-red-700" : "text-gray-700"}`}>
              {stats.inadimplentes}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.inadimplentes > 0 ? "Atenção necessária" : "Tudo em dia!"}
            </p>
          </CardContent>
        </Card>
        </div>   
       {/* Últimos Alunos + Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos alunos cadastrados */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos Alunos</CardTitle>
            <CardDescription>Novas matrículas recentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ultimosAlunos.map((aluno, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 border-2 border-dashed" />
                    <div>
                      <p className="font-medium">{aluno.name}</p>
                      <p className="text-xs text-gray-500">{aluno.data}</p>
                    </div>
                  </div>
                  <Badge variant={aluno.status === "ATIVO" ? "default" : "secondary"}>
                    {aluno.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6">
              Ver todos os alunos
            </Button>
          </CardContent>
        </Card>

        {/* Ações rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>O que você pode fazer agora</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Novo Aluno</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <UserCheck className="h-6 w-6" />
              <span>Novo Responsável</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              <span>Lançar Mensalidade</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span>Marcar Aula</span>
            </Button>
          </CardContent>
        </Card>
      </div>       
    </div>
  );
}
 
export default DashboardPage;