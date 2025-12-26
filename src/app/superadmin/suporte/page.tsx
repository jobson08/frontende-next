// src/app/superadmin/suporte/page.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MessageSquare, Search, Clock, AlertCircle, CheckCircle, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";

interface Ticket {
  id: string;
  escolinha: string;
  assunto: string;
  mensagem: string;
  prioridade: "Baixa" | "Média" | "Alta" | "Urgente";
  status: "Aberto" | "Em Andamento" | "Resolvido";
  dataAbertura: Date;
  ultimoUpdate: Date;
}

const ticketsMock: Ticket[] = [
  {
    id: "1",
    escolinha: "Gol de Placa Academy",
    assunto: "Problema no cadastro de alunos",
    mensagem: "Não consigo adicionar novos alunos, aparece erro 500.",
    prioridade: "Alta",
    status: "Aberto",
    dataAbertura: new Date(2025, 11, 25),
    ultimoUpdate: new Date(2025, 11, 25),
  },
  {
    id: "2",
    escolinha: "Futebol Raiz Academy",
    assunto: "Dúvida sobre plano Enterprise",
    mensagem: "Quais são os limites de armazenamento de vídeos no plano Enterprise?",
    prioridade: "Média",
    status: "Em Andamento",
    dataAbertura: new Date(2025, 11, 24),
    ultimoUpdate: new Date(2025, 11, 25),
  },
  {
    id: "3",
    escolinha: "Pequenos Craques",
    assunto: "Pagamento não reconhecido",
    mensagem: "Paguei via PIX mas o status continua pendente.",
    prioridade: "Urgente",
    status: "Aberto",
    dataAbertura: new Date(2025, 11, 23),
    ultimoUpdate: new Date(2025, 11, 23),
  },
  {
    id: "4",
    escolinha: "Futuros Campeões",
    assunto: "Solicitação de nova funcionalidade",
    mensagem: "Seria possível adicionar relatório de frequência por categoria?",
    prioridade: "Baixa",
    status: "Resolvido",
    dataAbertura: new Date(2025, 11, 20),
    ultimoUpdate: new Date(2025, 11, 22),
  },
];

const SuportePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState("todos");

  const filtered = ticketsMock.filter((t) => {
    const matchSearch = t.escolinha.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.assunto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filtroStatus === "todos" || t.status === filtroStatus;
    const matchPrioridade = filtroPrioridade === "todos" || t.prioridade === filtroPrioridade;
    return matchSearch && matchStatus && matchPrioridade;
  });

  const totalAbertos = filtered.filter(t => t.status === "Aberto").length;
  const totalUrgentes = filtered.filter(t => t.prioridade === "Urgente").length;

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade) {
      case "Urgente":
        return <Badge className="bg-red-600">Urgente</Badge>;
      case "Alta":
        return <Badge className="bg-orange-600">Alta</Badge>;
      case "Média":
        return <Badge className="bg-yellow-600">Média</Badge>;
      case "Baixa":
        return <Badge variant="secondary">Baixa</Badge>;
      default:
        return <Badge>{prioridade}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aberto":
        return <Badge className="bg-blue-600"><AlertCircle className="mr-1 h-3 w-3" /> Aberto</Badge>;
      case "Em Andamento":
        return <Badge className="bg-purple-600"><Clock className="mr-1 h-3 w-3" /> Em Andamento</Badge>;
      case "Resolvido":
        return <Badge className="bg-green-600"><CheckCircle className="mr-1 h-3 w-3" /> Resolvido</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <MessageSquare className="h-10 w-10 text-indigo-600" />
          Suporte
        </h1>
        <p className="text-gray-600 text-lg mt-2">Gerencie os tickets de suporte das escolinhas</p>
      </div>

      {/* Cards de Totais */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Tickets Abertos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalAbertos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Tickets Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{totalUrgentes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              Total de Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{filtered.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar por escolinha ou assunto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="Aberto">Aberto</SelectItem>
            <SelectItem value="Em Andamento">Em Andamento</SelectItem>
            <SelectItem value="Resolvido">Resolvido</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Todas as prioridades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as prioridades</SelectItem>
            <SelectItem value="Urgente">Urgente</SelectItem>
            <SelectItem value="Alta">Alta</SelectItem>
            <SelectItem value="Média">Média</SelectItem>
            <SelectItem value="Baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets de Suporte</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Escolinha</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Abertura</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-linear-to-br from-indigo-600 to-purple-600 text-white text-xs">
                        {ticket.escolinha.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {ticket.escolinha}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{ticket.assunto}</p>
                    <p className="text-xs text-gray-600 truncate max-w-xs">{ticket.mensagem}</p>
                  </TableCell>
                  <TableCell>{getPrioridadeBadge(ticket.prioridade)}</TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell>{format(ticket.dataAbertura, "dd/MM/yyyy")}</TableCell>
                  <TableCell>{format(ticket.ultimoUpdate, "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Responder
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuportePage;