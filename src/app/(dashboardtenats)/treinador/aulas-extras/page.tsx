// src/app/(dashboard)/treinador/aulas-extras/page.tsx
"use client";

import { Trophy, Calendar, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";
import { useEscolinhaConfig } from "@/src/context/EscolinhaConfigContext";

interface AulaExtra {
  id: string;
  data: string;
  hora: string;
  aluno: string;
  tipo: string;
  valor: number;
  status: "agendada" | "realizada" | "cancelada" | "pendente_pagamento";
}

const AulasExtrasTreinadorPage = () => {
  const { aulasExtrasAtivas } = useEscolinhaConfig();

  // Se o módulo não estiver ativado, mostra mensagem
  if (!aulasExtrasAtivas) {
    return (
      <div className="p-4 lg:p-8 flex flex-col items-center justify-center min-h-screen">
        <Trophy className="h-24 w-24 text-gray-300 mb-8" />
        <h1 className="text-4xl font-bold text-gray-600">Módulo Aulas Extras Desativado</h1>
        <p className="text-xl text-gray-500 mt-4 text-center max-w-2xl">
          O administrador da escolinha ainda não ativou o módulo de aulas extras.
          Quando ativar, você verá aqui todas as suas aulas individuais agendadas.
        </p>
      </div>
    );
  }

  const aulasExtras: AulaExtra[] = [
    { id: "1", data: "27/12/2025", hora: "17:00", aluno: "Enzo Gabriel", tipo: "Finalização Individual", valor: 80, status: "agendada" },
    { id: "2", data: "28/12/2025", hora: "18:00", aluno: "Pedro Silva", tipo: "Condicionamento Físico", valor: 90, status: "pendente_pagamento" },
    { id: "3", data: "26/12/2025", hora: "16:30", aluno: "Lucas Oliveira", tipo: "Drible e Controle de Bola", valor: 80, status: "realizada" },
    { id: "4", data: "29/12/2025", hora: "19:00", aluno: "Maria Luiza", tipo: "Treino de Goleiro", valor: 100, status: "agendada" },
    { id: "5", data: "25/12/2025", hora: "15:00", aluno: "João Victor", tipo: "Cabeceio Ofensivo", valor: 70, status: "cancelada" },
  ];

  const aulasHoje = aulasExtras.filter(a => a.data === "27/12/2025").length;
  const aulasPendentes = aulasExtras.filter(a => a.status === "pendente_pagamento").length;
  const receitaMes = aulasExtras
    .filter(a => a.status === "realizada")
    .reduce((acc, a) => acc + a.valor, 0);

  const marcarComoRealizada = (id: string) => {
    toast.success("Aula marcada como realizada!", {
      description: "Parabéns pela aula extra concluída!",
    });
    // Em produção: atualizar no Supabase
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "realizada":
        return <Badge className="bg-green-600"><CheckCircle className="mr-1 h-3 w-3" /> Realizada</Badge>;
      case "agendada":
        return <Badge className="bg-blue-600"><Calendar className="mr-1 h-3 w-3" /> Agendada</Badge>;
      case "pendente_pagamento":
        return <Badge className="bg-orange-600"><DollarSign className="mr-1 h-3 w-3" /> Pendente</Badge>;
      case "cancelada":
        return <Badge className="bg-red-600"><XCircle className="mr-1 h-3 w-3" /> Cancelada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-4">
          <Trophy className="h-12 w-12 text-yellow-600" />
          Minhas Aulas Extras
        </h1>
        <p className="text-gray-600 text-lg mt-2">
          Gerencie suas aulas individuais e acompanhe a receita extra
        </p>
      </div>

      {/* Resumo Rápido */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-linear-to-r from-blue-50 to-cyan-50 border-blue-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Aulas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{aulasHoje}</div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-r from-orange-50 to-amber-50 border-orange-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              Pendentes de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">{aulasPendentes}</div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-r from-green-50 to-emerald-50 border-green-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Receita Este Mês (Realizadas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              R$ {receitaMes.toLocaleString("pt-BR")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Aulas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Aulas Agendadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {aulasExtras.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-500">Nenhuma aula extra agendada no momento</p>
                <p className="text-gray-400 mt-2">Quando os pais solicitarem, aparecerão aqui!</p>
              </div>
            ) : (
              aulasExtras.map((aula) => (
                <div 
                  key={aula.id} 
                  className={`p-6 rounded-xl border-2 transition-all ${
                    aula.status === "agendada" ? "bg-blue-50 border-blue-300" :
                    aula.status === "realizada" ? "bg-green-50 border-green-300" :
                    aula.status === "pendente_pagamento" ? "bg-orange-50 border-orange-300" :
                    "bg-red-50 border-red-300"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" /> {/* foto do aluno */}
                        <div>
                          <p className="text-xl font-bold">{aula.aluno}</p>
                          <p className="text-gray-600">{aula.tipo}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{aula.data}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{aula.hora}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>R$ {aula.valor}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                      {getStatusBadge(aula.status)}
                      {aula.status === "agendada" && (
                        <Button 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => marcarComoRealizada(aula.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Marcar como Realizada
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AulasExtrasTreinadorPage;