/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/dashboarduser/aluno-futebol/treinos/page.tsx
"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Clock, MapPin, User, ChevronLeft, ChevronRight, Repeat } from "lucide-react";

const diasNomes = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

const TreinosPage = () => {
  const [mesSelecionado, setMesSelecionado] = useState(new Date());

  const { data: treinosGerados = [], isLoading } = useQuery({
    queryKey: ["treinos-aluno-mes", format(mesSelecionado, "yyyy-MM")],
    queryFn: async () => {
      const mesStr = format(mesSelecionado, "yyyy-MM");
      const res = await api.get(`/tenant/aluno-futebol/treinos-mes?mes=${mesStr}`);
      return res.data.data || [];
    },
  });

  const mudarMes = (direcao: number) => {
    setMesSelecionado(direcao > 0 
      ? new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth() + 1) 
      : new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth() - 1)
    );
  };

  if (isLoading) {
    return <div className="text-center py-20">Carregando seus treinos...</div>;
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Repeat className="h-8 w-8 text-green-600" />
            Meus Treinos
          </h1>
          <p className="text-gray-600">Treinos fixos por dia da semana</p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => mudarMes(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-xl font-medium min-w-[200px] text-center">
            {format(mesSelecionado, "MMMM yyyy", { locale: ptBR })}
          </span>
          <Button variant="outline" onClick={() => mudarMes(1)}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Treinos de {format(mesSelecionado, "MMMM yyyy", { locale: ptBR })}</CardTitle>
        </CardHeader>
        <CardContent>
          {treinosGerados.length === 0 ? (
            <p className="text-center text-gray-500 py-12">Nenhum treino agendado neste mês</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Dia da Semana</TableHead>
                  <TableHead>Treino</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Treinador</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treinosGerados.map((treino: any, index: number) => {
                  // CORREÇÃO: Adiciona 1 dia na data exibida
                  const dataOriginal = new Date(treino.data);
                  const dataCorrigida = addDays(dataOriginal, 1);

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {format(dataCorrigida, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {format(dataCorrigida, "EEEE", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-semibold">{treino.nome}</TableCell>
                      <TableCell>
                        {treino.horaInicio} - {treino.horaFim}
                      </TableCell>
                      <TableCell>{treino.local}</TableCell>
                      <TableCell>{treino.treinador}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-600">Confirmado</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TreinosPage;