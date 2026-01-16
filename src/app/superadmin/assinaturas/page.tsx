/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { useState } from "react";
import { format } from "date-fns";
import { DollarSign, Calendar, Search, MoreVertical, Edit, XCircle, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Pagination } from "@/src/components/common/Pagination";

interface Assinatura {
  id: string;
  nome: string;
  planoSaaS: string;
  valorPlanoMensal: number;
  dataInicioPlano: string | null;
  dataProximoCobranca: string | null;
  statusPagamentoSaaS: string;
}

const AssinaturasPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroPlano, setFiltroPlano] = useState("todos");

  // Estados para paginação da atividade recente
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // padrão 10 itens

  // ÚNICA chamada useQuery da página
  const { 
    data: response, 
    isLoading, 
    error 
  } = useQuery<{ success: boolean; data: Assinatura[] }>({
    queryKey: ["assinaturas"],
    queryFn: async () => {
      const { data } = await api.get("/superadmin/escolinhas"); // ← rota correta com baseURL
      console.log("[Assinaturas] Resposta completa do backend:", data);
      return data;
    },
  });

  const assinaturas = response?.data || [];

  const filtered = assinaturas.filter((a) => {
    const matchSearch = a.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filtroStatus === "todos" || a.statusPagamentoSaaS.toLowerCase() === filtroStatus.toLowerCase();
    const matchPlano = filtroPlano === "todos" || a.planoSaaS.toLowerCase() === filtroPlano.toLowerCase();
    return matchSearch && matchStatus && matchPlano;
  });

  const totalAtivas = filtered.filter(a => a.statusPagamentoSaaS.toLowerCase() === "ativo").length;
  const totalAtrasadas = filtered.filter(a => a.statusPagamentoSaaS.toLowerCase() === "atrasado").length;
  const receitaMensalPrevista = filtered
    .filter(a => ["ativo", "atrasado"].includes(a.statusPagamentoSaaS.toLowerCase()))
    .reduce((acc, a) => acc + (a.valorPlanoMensal || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "ativo":
        return <Badge className="bg-green-600"><CheckCircle className="mr-1 h-3 w-3" /> Ativa</Badge>;
      case "atrasado":
        return <Badge className="bg-red-600"><AlertCircle className="mr-1 h-3 w-3" /> Atrasada</Badge>;
      case "suspenso":
        return <Badge className="bg-orange-600"><XCircle className="mr-1 h-3 w-3" /> Suspensa</Badge>;
      case "cancelado":
        return <Badge variant="secondary"><XCircle className="mr-1 h-3 w-3" /> Cancelada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Paginação aplicada na lista filtrada
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const getPlanoColor = (plano: string) => {
    switch (plano.toLowerCase()) {
      case "enterprise": return "bg-gradient-to-r from-purple-600 to-pink-600 text-white";
      case "pro": return "bg-gradient-to-r from-blue-600 to-cyan-600 text-white";
      case "basico": return "bg-gradient-to-r from-green-600 to-emerald-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const handleAlterarPlano = async (id: string, novoPlano: string) => {
    try {
      await api.put(`/superadmin/escolinhas/${id}`, { planoSaaS: novoPlano });
      toast.success(`Plano alterado com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ["assinaturas"] });
    } catch (err) {
      console.error("[AlterarPlano] Erro:", err);
      toast.error("Erro ao alterar plano");
    }
  };

  const handleCancelar = async (id: string) => {
    try {
      await api.put(`/superadmin/escolinhas/${id}`, { statusPagamentoSaaS: "cancelado" });
      toast.success(`Assinatura cancelada!`);
      queryClient.invalidateQueries({ queryKey: ["assinaturas"] });
    } catch {
      toast.error("Erro ao cancelar assinatura");
    }
  };

  const handleReativar = async (id: string) => {
    try {
      await api.put(`/superadmin/escolinhas/${id}`, { statusPagamentoSaaS: "ativo" });
      toast.success(`Assinatura reativada!`);
      queryClient.invalidateQueries({ queryKey: ["assinaturas"] });
    } catch {
      toast.error("Erro ao reativar assinatura");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        <span className="ml-4 text-xl">Carregando assinaturas...</span>
      </div>
    );
  }

  if (error) {
    console.error("[Assinaturas] Erro ao carregar:", error);
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Erro ao carregar assinaturas</h2>
        <p className="mt-2">{(error as any).message || "Tente novamente mais tarde"}</p>
      </div>
    );
  }

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
            <SelectItem value="ativo">Ativa</SelectItem>
            <SelectItem value="atrasado">Atrasada</SelectItem>
            <SelectItem value="suspenso">Suspensa</SelectItem>
            <SelectItem value="cancelado">Cancelada</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroPlano} onValueChange={setFiltroPlano}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Todos os planos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os planos</SelectItem>
            <SelectItem value="basico">Básico</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de Assinaturas */}
<Card>
  <CardHeader>
    <CardTitle>Todas as Assinaturas ({filtered.length})</CardTitle>
  </CardHeader>
  <CardContent>
    {filtered.length === 0 ? (
      <div className="text-center py-12 text-gray-500">
        Nenhuma assinatura encontrada com os filtros aplicados.
      </div>
    ) : (
      <>
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
            {paginated.map((assinatura) => (
              <TableRow key={assinatura.id}>
                <TableCell className="font-medium">{assinatura.nome}</TableCell>
                <TableCell>
                  <Badge className={getPlanoColor(assinatura.planoSaaS)}>
                    {assinatura.planoSaaS}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  R$ {assinatura.valorPlanoMensal?.toLocaleString("pt-BR") || "0,00"}
                </TableCell>
                <TableCell>
                  {assinatura.dataInicioPlano
                    ? format(new Date(assinatura.dataInicioPlano), "dd/MM/yyyy")
                    : "-"}
                </TableCell>
                <TableCell>
                  {assinatura.dataProximoCobranca
                    ? format(new Date(assinatura.dataProximoCobranca), "dd/MM/yyyy")
                    : "Não informado"}
                </TableCell>
                <TableCell>{getStatusBadge(assinatura.statusPagamentoSaaS)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.location.href = `/superadmin/tenants/${assinatura.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAlterarPlano(assinatura.id, "pro")}>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Alterar para Pro
                      </DropdownMenuItem>
                      {assinatura.statusPagamentoSaaS.toLowerCase() === "ativo" && (
                        <DropdownMenuItem className="text-red-600" onClick={() => handleCancelar(assinatura.id)}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancelar assinatura
                        </DropdownMenuItem>
                      )}
                      {(assinatura.statusPagamentoSaaS.toLowerCase() === "atrasado" || 
                        assinatura.statusPagamentoSaaS.toLowerCase() === "suspenso") && (
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

            {/* Paginação no final */}
            <Pagination
              currentPage={currentPage}
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(value) => {
                setItemsPerPage(value);
                setCurrentPage(1); // reseta para a primeira página
              }}
              className="mt-6"
            />
          </>
        )}
      </CardContent>
    </Card>
    </div>
  );
};

export default AssinaturasPage;