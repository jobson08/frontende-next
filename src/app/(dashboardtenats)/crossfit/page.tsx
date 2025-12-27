// src/app/(dashboard)/crossfit/page.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Activity, Search, DollarSign, Calendar, Phone, Mail, MoreVertical, Edit, Trash2, AlertCircle, Users, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import Link from "next/link";

import { toast } from "sonner";
import { AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger, } from "@/src/components/ui/alert-dialog";

interface ClienteCrossFit {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataInscricao: Date;
  ultimoPagamento: Date | null;
  statusPagamento: "Em Dia" | "Atrasado" | "Pendente";
  frequenciaSemanal: number; // média de aulas por semana
}

const clientesMock: ClienteCrossFit[] = [
  {
    id: "1",
    nome: "Carlos Silva",
    email: "carlos.silva@email.com",
    telefone: "(11) 98765-4321",
    dataInscricao: new Date(2025, 9, 15),
    ultimoPagamento: new Date(2025, 11, 10),
    statusPagamento: "Em Dia",
    frequenciaSemanal: 3,
  },
  {
    id: "2",
    nome: "Ana Oliveira",
    email: "ana.oliveira@email.com",
    telefone: "(11) 97654-3210",
    dataInscricao: new Date(2025, 8, 20),
    ultimoPagamento: new Date(2025, 10, 5),
    statusPagamento: "Atrasado",
    frequenciaSemanal: 2,
  },
  {
    id: "3",
    nome: "Roberto Santos",
    email: "roberto@email.com",
    telefone: "(11) 96543-2109",
    dataInscricao: new Date(2025, 11, 1),
    ultimoPagamento: null,
    statusPagamento: "Pendente",
    frequenciaSemanal: 0,
  },
  {
    id: "4",
    nome: "Juliana Costa",
    email: "juliana@email.com",
    telefone: "(11) 95432-1098",
    dataInscricao: new Date(2025, 7, 10),
    ultimoPagamento: new Date(2025, 11, 8),
    statusPagamento: "Em Dia",
    frequenciaSemanal: 4,
  },
];

const ClientesCrossFitPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clienteParaRemover, setClienteParaRemover] = useState<ClienteCrossFit | null>(null);

  const filtered = clientesMock.filter((cliente) =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalClientes = filtered.length;
  const emDia = filtered.filter(c => c.statusPagamento === "Em Dia").length;
  const atrasados = filtered.filter(c => c.statusPagamento === "Atrasado" || c.statusPagamento === "Pendente").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Em Dia":
        return <Badge className="bg-green-600">Em Dia</Badge>;
      case "Atrasado":
        return <Badge className="bg-red-600">Atrasado</Badge>;
      case "Pendente":
        return <Badge className="bg-orange-600">Pendente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleRemover = (cliente: ClienteCrossFit) => {
    setClienteParaRemover(cliente);
  };

  const confirmarRemocao = () => {
    if (clienteParaRemover) {
      // Aqui vai a lógica real de remoção (Supabase delete)
      console.log("Cliente removido:", clienteParaRemover.id);
      toast.success("Cliente removido com sucesso!", {
        description: `${clienteParaRemover.nome} foi excluído da lista CrossFit.`,
      });
      setClienteParaRemover(null);
      // Atualizar lista (em produção: refetch ou remove do state)
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Activity className="h-10 w-10 text-red-600" />
          Clientes CrossFit
        </h1>
        <p className="text-gray-600 text-lg mt-2">Gerencie os alunos adultos do CrossFit da sua escolinha</p>
      </div>

      {/* Cards de Totais */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-red-600" />
              Total de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{totalClientes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Em Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{emDia}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Atrasados/Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{atrasados}</div>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Buscar por nome ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-11 h-12"
        />
      </div>

      {/* Tabela de Clientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button asChild className="bg-linear-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
              <Link href="/crossfit/presenca">
                  <Calendar className="mr-2 h-4 w-4" />
                  Marca Presença
              </Link>
            </Button>
            {/* Botão novo aluno*/}
             <Button asChild className="bg-linear-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
              <Link href="/crossfit/novo">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Novo Aluno
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Inscrição</TableHead>
                <TableHead>Frequência Semanal</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-linear-to-br from-red-600 to-orange-600 text-white">
                        {cliente.nome.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {cliente.nome}
                  </TableCell>

                    <TableCell>  
                  <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-gray-500" />
                        {cliente.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-gray-500" />
                        {cliente.telefone}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{format(cliente.dataInscricao, "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{cliente.frequenciaSemanal} aulas/semana</Badge>
                  </TableCell>
                  <TableCell>
                    {cliente.ultimoPagamento 
                      ? format(cliente.ultimoPagamento, "dd/MM/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(cliente.statusPagamento)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* BOTÃO EDITAR AQUI */}
                        <DropdownMenuItem asChild>
                          <Link href={`/crossfit/${cliente.id}/editar`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar cliente
                          </Link>
                        </DropdownMenuItem>
                        {/* BOTÃO VER PAGAMENTOS AQUI */}
                        <DropdownMenuItem asChild>
                          <Link href={`/crossfit/${cliente.id}/pagamentos`}>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Ver pagamentos
                          </Link>
                        </DropdownMenuItem>
                    {/* BOTÃO MARCAR PRESENÇA AQUI */}
                        <DropdownMenuItem asChild>
                          <Link href="/crossfit/presenca">
                            <Calendar className="mr-2 h-4 w-4" />
                            Marcar presença
                          </Link>
                        </DropdownMenuItem>

                        {/* BOTÃO REMOVER COM MODAL */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onSelect={(e) => e.preventDefault()} // impede fechamento do dropdown
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remover cliente
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar remoção?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover <strong>{cliente.nome}</strong> da lista de clientes CrossFit?
                                <br />
                                Essa ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => {
                                  confirmarRemocao();
                                  // Fecha o modal (AlertDialogAction faz isso automaticamente)
                                }}
                              >
                                Sim, remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                      </DropdownMenuContent>
                    </DropdownMenu>
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

export default ClientesCrossFitPage;