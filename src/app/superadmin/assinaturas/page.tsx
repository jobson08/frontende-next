// src/app/superadmin/assinaturas/page.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { DollarSign, Calendar, Search, Filter, MoreVertical, Edit, XCircle, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Assinatura {
  id: string;
  escolinha: string;
  plano: "Básico" | "Pro" | "Enterprise";
  valorMensal: number;
  dataInicio: Date;
  proximoVencimento: Date;
  status: "Ativa" | "Atrasada" | "Cancelada" | "Suspensa";
  ultimoPagamento: Date | null;
}

const assinaturasMock: Assinatura[] = [
  {
    id: "1",
    escolinha: "Gol de Placa Academy",
    plano: "Pro",
    valorMensal: 599,
    dataInicio: new Date(2024, 2, 15),
    proximoVencimento: new Date(2025, 11, 15),
    status: "Ativa",
    ultimoPagamento: new Date(2025, 11, 10),
  },
  {
    id: "2",
    escolinha: "Futebol Raiz Academy",
    plano: "Enterprise",
    valorMensal: 999,
    dataInicio: new Date(2023, 10, 20),
    proximoVencimento: new Date(2025, 11, 5),
    status: "Ativa",
    ultimoPagamento: new Date(2025, 11, 5),
  },
  {
    id: "3",
    escolinha: "Pequenos Craques",
    plano: "Básico",
    valorMensal: 299,
    dataInicio: new Date(2025, 0, 10),
    proximoVencimento: new Date(2025, 11, 12),
    status: "Atrasada",
    ultimoPagamento: new Date(2025, 10, 12),
  },
  {
    id: "4",
    escolinha: "Futuros Campeões",
    plano: "Pro",
    valorMensal: 599,
    dataInicio: new Date(2025, 5, 5),
    proximoVencimento: new Date(2025, 11, 1),
    status: "Suspensa",
    ultimoPagamento: new Date(2025, 9, 1),
  },
  {
    id: "5",
    escolinha: "Escola do Gol",
    plano: "Básico",
    valorMensal: 299,
    dataInicio: new Date(2024, 7, 22),
    proximoVencimento: new Date(2025, 11, 15),
    status: "Cancelada",
    ultimoPagamento: new Date(2025, 10, 15),
  },
];

const AssinaturasPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroPlano, setFiltroPlano] = useState("todos");

  const filtered = assinaturasMock.filter((a) => {
    const matchSearch = a.escolinha.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filtroStatus === "todos" || a.status === filtroStatus;
    const matchPlano = filtroPlano === "todos" || a.plano === filtroPlano;
    return matchSearch && matchStatus && matchPlano;
  });

  const totalAtivas = filtered.filter(a => a.status === "Ativa").length;
  const totalAtrasadas = filtered.filter(a => a.status === "Atrasada").length;
  const receitaMensalPrevista = filtered
    .filter(a => a.status === "Ativa" || a.status === "Atrasada")
    .reduce((acc, a) => acc + a.valorMensal, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ativa":
        return <Badge className="bg-green-600"><CheckCircle className="mr-1 h-3 w-3" /> Ativa</Badge>;
      case "Atrasada":
        return <Badge className="bg-red-600"><AlertCircle className="mr-1 h-3 w-3" /> Atrasada</Badge>;
      case "Suspensa":
        return <Badge className="bg-orange-600">Suspensa</Badge>;
      case "Cancelada":
        return <Badge variant="secondary"><XCircle className="mr-1 h-3 w-3" /> Cancelada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPlanoColor = (plano: string) => {
    switch (plano) {
      case "Enterprise": return "bg-gradient-to-r from-purple-600 to-pink-600 text-white";
      case "Pro": return "bg-gradient-to-r from-blue-600 to-cyan-600 text-white";
      case "Básico": return "bg-gradient-to-r from-green-600 to-emerald-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const handleAlterarPlano = (id: string) => {
    toast.success(`Plano alterado para assinatura ${id}`);
  };

  const handleCancelar = (id: string) => {
    toast.success(`Assinatura ${id} cancelada`);
  };

  const handleReativar = (id: string) => {
    toast.success(`Assinatura ${id} reativada`);
  };

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <DollarSign className="h-10 w-10 text-purple-600" />
          Assinaturas
        </h1>
        <p className="text-gray-600 text-lg mt-2">Gerencie todas as assinaturas da plataforma FutElite</p>
      </div>

      {/* Cards de Totais */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Assinaturas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalAtivas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Assinaturas Atrasadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{totalAtrasadas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Receita Mensal Prevista
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              R$ {receitaMensalPrevista.toLocaleString("pt-BR")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar por escolinha..."
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
            <SelectItem value="Ativa">Ativa</SelectItem>
            <SelectItem value="Atrasada">Atrasada</SelectItem>
            <SelectItem value="Suspensa">Suspensa</SelectItem>
            <SelectItem value="Cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroPlano} onValueChange={setFiltroPlano}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Todos os planos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os planos</SelectItem>
            <SelectItem value="Básico">Básico</SelectItem>
            <SelectItem value="Pro">Pro</SelectItem>
            <SelectItem value="Enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de Assinaturas */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Assinaturas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Escolinha</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Valor Mensal</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Próximo Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((assinatura) => (
                <TableRow key={assinatura.id}>
                  <TableCell className="font-medium">{assinatura.escolinha}</TableCell>
                  <TableCell>
                    <Badge className={getPlanoColor(assinatura.plano)}>
                      {assinatura.plano}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    R$ {assinatura.valorMensal.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>{format(assinatura.dataInicio, "dd/MM/yyyy")}</TableCell>
                  <TableCell>{format(assinatura.proximoVencimento, "dd/MM/yyyy")}</TableCell>
                  <TableCell>{getStatusBadge(assinatura.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAlterarPlano(assinatura.id)}>
                          <DollarSign className="mr-2 h-4 w-4" />
                          Alterar plano
                        </DropdownMenuItem>
                        {assinatura.status === "Ativa" && (
                          <DropdownMenuItem className="text-red-600" onClick={() => handleCancelar(assinatura.id)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar assinatura
                          </DropdownMenuItem>
                        )}
                        {(assinatura.status === "Atrasada" || assinatura.status === "Suspensa") && (
                          <DropdownMenuItem className="text-green-600" onClick={() => handleReativar(assinatura.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Reativar assinatura
                          </DropdownMenuItem>
                        )}
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

export default AssinaturasPage;