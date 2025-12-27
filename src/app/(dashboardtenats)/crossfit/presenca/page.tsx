// src/app/(dashboard)/crossfit/presenca/page.tsx
"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import Link from "next/link";

interface ClientePresenca {
  id: string;
  nome: string;
  presente: boolean;
  frequenciaSemanal: number;
}

const clientesMock: ClientePresenca[] = [
  { id: "1", nome: "Carlos Silva", presente: false, frequenciaSemanal: 3 },
  { id: "2", nome: "Ana Oliveira", presente: true, frequenciaSemanal: 2 },
  { id: "3", nome: "Roberto Santos", presente: false, frequenciaSemanal: 0 },
  { id: "4", nome: "Juliana Costa", presente: true, frequenciaSemanal: 4 },
  { id: "5", nome: "Pedro Almeida", presente: true, frequenciaSemanal: 3 },
];

const MarcacaoPresencaCrossFitPage = () => {
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [clientes, setClientes] = useState(clientesMock);

  const inicioMes = startOfMonth(dataSelecionada);
  const fimMes = endOfMonth(dataSelecionada);
  const diasMes = eachDayOfInterval({ start: inicioMes, end: fimMes });

  const handleMarcarPresenca = (id: string) => {
    setClientes(clientes.map(c => 
      c.id === id ? { ...c, presente: !c.presente } : c
    ));
  };

  const presentesHoje = clientes.filter(c => c.presente).length;
  const totalClientes = clientes.length;

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
     <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/crossfit">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Calendar className="h-10 w-10 text-red-600" />
          Marcação de Presença CrossFit
        </h1>
        <p className="text-gray-600 text-lg mt-2">Registre a presença dos alunos adultos nas aulas de CrossFit</p>
      </div>
      </div>

      {/* Navegação do Mês */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-red-600" />
              {format(dataSelecionada, "MMMM yyyy")}
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setDataSelecionada(subMonths(dataSelecionada, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setDataSelecionada(addMonths(dataSelecionada, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
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
            {Array.from({ length: inicioMes.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {diasMes.map((dia) => (
              <Button
                key={dia.toString()}
                variant={isSameDay(dia, new Date()) ? "default" : "outline"}
                className="h-12 w-12 p-0"
                onClick={() => setDataSelecionada(dia)}
              >
                {format(dia, "d")}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumo do Dia */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-red-600" />
              Presentes Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{presentesHoje}</div>
            <p className="text-sm text-gray-600 mt-1">de {totalClientes} clientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Frequência Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {(clientes.reduce((acc, c) => acc + c.frequenciaSemanal, 0) / totalClientes).toFixed(1)}
            </div>
            <p className="text-sm text-gray-600 mt-1">aulas por semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Data Selecionada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {format(dataSelecionada, "dd 'de' MMMM yyyy")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Clientes para Marcação */}
      <Card>
        <CardHeader>
          <CardTitle>Marque a presença dos alunos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Frequência Semanal</TableHead>
                <TableHead className="text-center">Presente Hoje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">
                    {cliente.nome}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{cliente.frequenciaSemanal} aulas/semana</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={cliente.presente}
                      onCheckedChange={() => handleMarcarPresenca(cliente.id)}
                      className="h-6 w-6"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 flex justify-end">
            <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
              Salvar Presenças do Dia
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarcacaoPresencaCrossFitPage;