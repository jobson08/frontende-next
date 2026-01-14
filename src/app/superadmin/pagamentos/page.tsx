/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, Calendar, Search, Filter, AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { toast } from "sonner";

interface Pagamento {
  id: string;
  escolinha: string;
  plano: string;
  valor: number;
  dataPagamento: string | null;
  dataVencimento: string | null;
  status: string;
  metodo: string;
}

const PagamentosPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroPlano, setFiltroPlano] = useState("todos");
  const [mesSelecionado, setMesSelecionado] = useState("todos");

  const { data: response, isLoading, error } = useQuery<{ success: boolean; data: Pagamento[] }>({
    queryKey: ["pagamentos"],
    queryFn: async () => {
      console.log("[Pagamentos] Fazendo requisição ao backend...");
      const { data } = await api.get("http://localhost:4000/api/v1/superadmin/pagamentos");
      console.log("[Pagamentos] Resposta completa do backend:", data);
      return data;
    },
  });

  const pagamentos = response?.data || [];

  // Filtro completo
  const filtered = pagamentos.filter((p) => {
    const matchSearch = p.escolinha.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filtroStatus === "todos" || p.status.toLowerCase() === filtroStatus.toLowerCase();
    const matchPlano = filtroPlano === "todos" || p.plano.toLowerCase() === filtroPlano.toLowerCase();

    let matchMes = true;
    if (mesSelecionado !== "todos" && p.dataVencimento) {
      const dataVenc = new Date(p.dataVencimento);
      const mesAno = `${dataVenc.getFullYear()}-${String(dataVenc.getMonth() + 1).padStart(2, '0')}`;
      matchMes = mesAno === mesSelecionado;
    }

    return matchSearch && matchStatus && matchPlano && matchMes;
  });

  const totalRecebido = filtered
    .filter((p) => p.status.toLowerCase() === "confirmado" || p.status.toLowerCase() === "pago")
    .reduce((acc, p) => acc + p.valor, 0);

  const totalAtrasado = filtered
    .filter((p) => p.status.toLowerCase() === "pendente" || p.status.toLowerCase() === "atrasado")
    .reduce((acc, p) => acc + p.valor, 0);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmado":
      case "pago":
        return <Badge className="bg-green-600"><CheckCircle className="mr-1 h-3 w-3" /> Pago</Badge>;
      case "atrasado":
        return <Badge className="bg-red-600"><AlertCircle className="mr-1 h-3 w-3" /> Atrasado</Badge>;
      case "pendente":
        return <Badge className="bg-orange-600"><Calendar className="mr-1 h-3 w-3" /> Pendente</Badge>;
      case "cancelado":
        return <Badge variant="secondary"><XCircle className="mr-1 h-3 w-3" /> Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPlanoColor = (plano: string) => {
    switch (plano.toLowerCase()) {
      case "enterprise": return "bg-gradient-to-r from-purple-600 to-pink-600 text-white";
      case "pro": return "bg-gradient-to-r from-blue-600 to-cyan-600 text-white";
      case "basico": return "bg-gradient-to-r from-green-600 to-emerald-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  // Gerar opções de meses em português do Brasil (últimos 12 meses + "todos")
  const mesesDisponiveis = [
    { value: "todos", label: "Todos os meses" },
    ...Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const mes = format(date, "MMMM 'de' yyyy", { locale: ptBR });
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return { value, label: mes.charAt(0).toUpperCase() + mes.slice(1) }; // Capitaliza o primeiro caractere
    }),
  ];

  // Texto do mês selecionado (mostra na tela)
  const mesAtualTexto = mesSelecionado === "todos"
    ? "Todos os meses"
    : mesesDisponiveis.find(m => m.value === mesSelecionado)?.label || "Mês atual";

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <span className="ml-4 text-xl">Carregando pagamentos...</span>
      </div>
    );
  }

  if (error) {
    console.error("[Pagamentos] Erro na requisição:", error);
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Erro ao carregar pagamentos</h2>
        <p className="mt-2">{(error as any).message || "Tente novamente mais tarde"}</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <DollarSign className="h-10 w-10 text-green-600" />
          Pagamentos
        </h1>
        <p className="text-gray-600 text-lg mt-2">
          Acompanhe todos os pagamentos da plataforma FutElite
        </p>
      </div>

      {/* Cards de Totais */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Total Recebido
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
              Pagamentos ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {filtered.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="space-y-4 md:space-y-0 md:flex md:flex-row md:gap-4 md:items-end">
        {/* Mostrar o mês selecionado ou atual */}
        <div className="text-lg font-medium text-gray-700">
          {mesAtualTexto}
        </div>

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
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="atrasado">Atrasado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroPlano} onValueChange={setFiltroPlano}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Plano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os planos</SelectItem>
            <SelectItem value="basico">Básico</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro por mês */}
        <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            {mesesDisponiveis.map((mes) => (
              <SelectItem key={mes.value} value={mes.value}>
                {mes.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhum pagamento encontrado com os filtros aplicados.
            </div>
          ) : (
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
                    <TableCell>
                      {pagamento.dataVencimento
                        ? format(new Date(pagamento.dataVencimento), "dd/MM/yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {pagamento.dataPagamento
                        ? format(new Date(pagamento.dataPagamento), "dd/MM/yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell>{pagamento.metodo}</TableCell>
                    <TableCell>{getStatusBadge(pagamento.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PagamentosPage;