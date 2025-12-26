// src/app/superadmin/pagamentos/page.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { DollarSign, Calendar, Search, Filter, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";

interface Pagamento {
  id: string;
  escolinha: string;
  plano: "Básico" | "Pro" | "Enterprise";
  valor: number;
  dataPagamento: Date;
  dataVencimento: Date;
  status: "Pago" | "Atrasado" | "Pendente" | "Cancelado";
  metodo: "PIX" | "Boleto" | "Cartão";
}

const pagamentosMock: Pagamento[] = [
  {
    id: "1",
    escolinha: "Gol de Placa Academy",
    plano: "Pro",
    valor: 599,
    dataPagamento: new Date(2025, 11, 10),
    dataVencimento: new Date(2025, 11, 10),
    status: "Pago",
    metodo: "PIX",
  },
  {
    id: "2",
    escolinha: "Futebol Raiz Academy",
    plano: "Enterprise",
    valor: 999,
    dataPagamento: new Date(2025, 11, 5),
    dataVencimento: new Date(2025, 11, 5),
    status: "Pago",
    metodo: "Cartão",
  },
  {
    id: "3",
    escolinha: "Pequenos Craques",
    plano: "Básico",
    valor: 299,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataPagamento: null as any,
    dataVencimento: new Date(2025, 11, 12),
    status: "Atrasado",
    metodo: "PIX",
  },
  {
    id: "4",
    escolinha: "Futuros Campeões",
    plano: "Pro",
    valor: 599,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataPagamento: null as any,
    dataVencimento: new Date(2025, 11, 1),
    status: "Pendente",
    metodo: "Boleto",
  },
  // mais pagamentos...
];

const PagamentosPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroPlano, setFiltroPlano] = useState("todos");

  const filtered = pagamentosMock.filter((p) => {
    const matchSearch = p.escolinha.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filtroStatus === "todos" || p.status === filtroStatus;
    const matchPlano = filtroPlano === "todos" || p.plano === filtroPlano;
    return matchSearch && matchStatus && matchPlano;
  });

  const totalRecebido = filtered
    .filter(p => p.status === "Pago")
    .reduce((acc, p) => acc + p.valor, 0);

  const totalAtrasado = filtered
    .filter(p => p.status === "Atrasado" || p.status === "Pendente")
    .reduce((acc, p) => acc + p.valor, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pago":
        return <Badge className="bg-green-600"><CheckCircle className="mr-1 h-3 w-3" /> Pago</Badge>;
      case "Atrasado":
        return <Badge className="bg-red-600"><AlertCircle className="mr-1 h-3 w-3" /> Atrasado</Badge>;
      case "Pendente":
        return <Badge className="bg-orange-600"><Calendar className="mr-1 h-3 w-3" /> Pendente</Badge>;
      case "Cancelado":
        return <Badge variant="secondary"><XCircle className="mr-1 h-3 w-3" /> Cancelado</Badge>;
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

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <DollarSign className="h-10 w-10 text-green-600" />
          Pagamentos
        </h1>
        <p className="text-gray-600 text-lg mt-2">Acompanhe todos os pagamentos da plataforma FutElite</p>
      </div>

      {/* Cards de Totais */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Total Recebido Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              R$ {totalRecebido.toLocaleString("pt-BR")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Total Atrasado/Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              R$ {totalAtrasado.toLocaleString("pt-BR")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Pagamentos Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {filtered.filter(p => p.status === "Pago").length}
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
            <SelectItem value="Pago">Pago</SelectItem>
            <SelectItem value="Atrasado">Atrasado</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
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

      {/* Tabela de Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Escolinha</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((pagamento) => (
                <TableRow key={pagamento.id}>
                  <TableCell className="font-medium">{pagamento.escolinha}</TableCell>
                  <TableCell>
                    <Badge className={getPlanoColor(pagamento.plano)}>
                      {pagamento.plano}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    R$ {pagamento.valor.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>{format(pagamento.dataVencimento, "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    {pagamento.dataPagamento 
                      ? format(pagamento.dataPagamento, "dd/MM/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>{pagamento.metodo}</TableCell>
                  <TableCell>{getStatusBadge(pagamento.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PagamentosPage;