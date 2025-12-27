// src/app/dashboarduser/crossfit-dashboard/page.tsx
"use client";

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { Activity, Calendar, DollarSign, CheckCircle, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";

const CrossFitDashboardPage = () => {
  // Dados do cliente CrossFit (em produção vem do Supabase)
  const cliente = {
    nome: "Carlos Silva",
    plano: "Mensal",
    valorMensal: 149,
    statusPagamento: "Em Dia",
    frequenciaSemanalMedia: 3.2,
    totalAulasMes: 12,
    presencasMesAtual: 10,
    proximaAula: "Segunda-feira, 29/12 • 18:00 - 19:00",
    instrutor: "Professor Marcos",
  };

  // Calendário do mês atual com presenças
  const hoje = new Date();
  const inicioMes = startOfMonth(hoje);
  const fimMes = endOfMonth(hoje);
  const diasMes = eachDayOfInterval({ start: inicioMes, end: fimMes });

  // Mock de dias com presença (exemplo)
  const diasComPresenca = [
    new Date(2025, 11, 2),
    new Date(2025, 11, 4),
    new Date(2025, 11, 6),
    new Date(2025, 11, 9),
    new Date(2025, 11, 11),
    new Date(2025, 11, 13),
    new Date(2025, 11, 16),
    new Date(2025, 11, 18),
    new Date(2025, 11, 20),
    new Date(2025, 11, 23),
  ];

  const percentualPresenca = ((cliente.presencasMesAtual / cliente.totalAulasMes) * 100).toFixed(0);

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24 ring-4 ring-red-100">
          <AvatarFallback className="bg-gradient-to-br from-red-600 to-orange-600 text-white text-3xl font-bold">
            CS
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-bold">Bem-vindo, {cliente.nome}!</h1>
          <p className="text-gray-600 text-lg mt-1">Acompanhe seu progresso no CrossFit</p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Status do Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="text-lg px-4 py-2 bg-green-600">
              <CheckCircle className="mr-2 h-5 w-5" />
              {cliente.statusPagamento}
            </Badge>
            <p className="text-sm text-gray-600 mt-2">
              Plano {cliente.plano} • R$ {cliente.valorMensal}/mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-600" />
              Frequência Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {cliente.frequenciaSemanalMedia.toFixed(1)}
            </div>
            <p className="text-sm text-gray-600 mt-1">aulas por semana (média)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Presença Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{percentualPresenca}%</div>
            <p className="text-sm text-gray-600 mt-1">
              {cliente.presencasMesAtual} de {cliente.totalAulasMes} aulas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              Próxima Aula
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">{cliente.proximaAula}</div>
            <p className="text-sm text-gray-600 mt-1">Instrutor: {cliente.instrutor}</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendário de Presenças do Mês */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-red-600" />
            Presenças em {format(hoje, "MMMM yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600 mb-4">
            <div>Dom</div>
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sáb</div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {/* Espaços vazios antes do primeiro dia */}
            {Array.from({ length: inicioMes.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Dias do mês */}
            {diasMes.map((dia) => {
              const temPresenca = diasComPresenca.some(d => isSameDay(d, dia));
              const ehHoje = isSameDay(dia, hoje);

              return (
                <div
                  key={dia.toString()}
                  className={`
                    h-12 w-12 rounded-lg flex items-center justify-center text-sm font-medium
                    ${temPresenca ? "bg-green-600 text-white" : "bg-gray-100"}
                    ${ehHoje ? "ring-4 ring-red-400 ring-offset-2" : ""}
                  `}
                >
                  {format(dia, "d")}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-green-600 rounded"></div>
              <span>Presença confirmada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-100 rounded border"></div>
              <span>Sem aula / Ausente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded ring-4 ring-red-400 ring-offset-2"></div>
              <span>Hoje</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrossFitDashboardPage;