// src/app/dashboarduser/aluno-dashboard/treinos/page.tsx
"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { Calendar, Clock, MapPin, User} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";

const TreinosPage = () => {
  const [mesSelecionado, setMesSelecionado] = useState(new Date());
  const [filtroTipo, setFiltroTipo] = useState("todos");

  // Mock de treinos do aluno
  const treinosMock = [
    {
      id: "1",
      data: new Date(2025, 11, 22), // 22/12/2025
      hora: "18:00 - 19:30",
      tipo: "Técnica Individual",
      treinador: "Rafael Lima",
      local: "Campo 1",
      status: "confirmado",
    },
    {
      id: "2",
      data: new Date(2025, 11, 23),
      hora: "17:30 - 19:00",
      tipo: "Jogo Coletivo",
      treinador: "Mariana Costa",
      local: "Campo 2",
      status: "confirmado",
    },
    {
      id: "3",
      data: new Date(2025, 11, 24),
      hora: "18:00 - 19:30",
      tipo: "Preparação Física",
      treinador: "Carlos Souza",
      local: "Academia",
      status: "pendente",
    },
    {
      id: "4",
      data: new Date(2025, 11, 27),
      hora: "09:00 - 11:00",
      tipo: "Amistoso",
      treinador: "Rafael Lima",
      local: "Campo Principal",
      status: "confirmado",
    },
    {
      id: "5",
      data: new Date(2025, 11, 29),
      hora: "18:00 - 19:30",
      tipo: "Tática",
      treinador: "Rafael Lima",
      local: "Campo 1",
      status: "confirmado",
    },
  ];

  // Filtra treinos do mês selecionado e pelo tipo
  const treinosFiltrados = treinosMock.filter((treino) => {
    const mesmoMes = treino.data.getMonth() === mesSelecionado.getMonth() && treino.data.getFullYear() === mesSelecionado.getFullYear();
    const tipoMatch = filtroTipo === "todos" || treino.tipo.toLowerCase().includes(filtroTipo.toLowerCase());
    return mesmoMes && tipoMatch;
  });

  // Gera dias do mês
  const diasDoMes = eachDayOfInterval({
    start: startOfMonth(mesSelecionado),
    end: endOfMonth(mesSelecionado),
  });

  const getTreinosDoDia = (dia: Date) => {
    return treinosFiltrados.filter(t => isSameDay(t.data, dia));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmado":
        return <Badge className="bg-green-600">Confirmado</Badge>;
      case "pendente":
        return <Badge className="bg-orange-600">Pendente</Badge>;
      case "cancelado":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold">Meus Treinos</h1>
        <p className="text-gray-600 text-lg mt-2">Acompanhe seu calendário de treinos</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={format(mesSelecionado, "MMMM yyyy")} onValueChange={(value) => setMesSelecionado(new Date(value))}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={format(new Date(2025, 10, 1), "MMMM yyyy")}>Novembro 2025</SelectItem>
            <SelectItem value={format(new Date(2025, 11, 1), "MMMM yyyy")}>Dezembro 2025</SelectItem>
            <SelectItem value={format(new Date(2026, 0, 1), "MMMM yyyy")}>Janeiro 2026</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os treinos</SelectItem>
            <SelectItem value="técnica">Técnica</SelectItem>
            <SelectItem value="física">Preparação Física</SelectItem>
            <SelectItem value="jogo">Jogo Coletivo</SelectItem>
            <SelectItem value="amistoso">Amistoso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Calendário Mensal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            {format(mesSelecionado, "MMMM yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
              <div key={dia} className="font-semibold text-sm text-gray-600 py-2">
                {dia}
              </div>
            ))}

            {diasDoMes.map((dia) => {
              const treinosDoDia = getTreinosDoDia(dia);
              const isHoje = isToday(dia);

              return (
                <div
                  key={dia.toString()}
                  className={cn(
                    "min-h-24 p-2 rounded-lg border",
                    isHoje && "border-blue-500 bg-blue-50",
                    treinosDoDia.length > 0 && "bg-green-50 border-green-300"
                  )}
                >
                  <div className="font-medium text-sm">{format(dia, "d")}</div>
                  {treinosDoDia.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {treinosDoDia.slice(0, 2).map((treino) => (
                        <Badge key={treino.id} variant="secondary" className="text-xs block">
                          {treino.hora.split(" - ")[0]}
                        </Badge>
                      ))}
                      {treinosDoDia.length > 2 && (
                        <p className="text-xs text-gray-600">+{treinosDoDia.length - 2} mais</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista Detalhada dos Treinos do Mês */}
      <Card>
        <CardHeader>
          <CardTitle>Treinos Detalhados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {treinosFiltrados.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum treino encontrado neste mês</p>
          ) : (
            treinosFiltrados.map((treino) => (
              <div key={treino.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{format(treino.data, "dd")}</p>
                    <p className="text-sm text-gray-600">{format(treino.data, "EEE")}</p>
                  </div>
                  <div>
                    <p className="font-semibold">{treino.tipo}</p>
                    <div className="text-sm text-gray-600 space-y-1 mt-1">
                      <p className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {treino.hora}
                      </p>
                      <p className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {treino.local}
                      </p>
                      <p className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {treino.treinador}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {getStatusBadge(treino.status)}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TreinosPage;