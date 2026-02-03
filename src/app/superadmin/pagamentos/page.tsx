/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { useState } from "react";
import { format, isValid, subMonths, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, Calendar, Search, AlertCircle, CheckCircle, XCircle, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Button } from "@/src/components/ui/button";
import { Pagination } from "@/src/components/common/Pagination"; // ajuste o caminho

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
  const queryClient = useQueryClient();

  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroPlano, setFiltroPlano] = useState("todos");

 // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // padrão 10 cards por página


  // Mês/ano atual como padrão
  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  const [mesSelecionado, setMesSelecionado] = useState(mesAtual);

  const [pagamentoToPay, setPagamentoToPay] = useState<string | null>(null);

  // Gera opções de meses (últimos 36 meses + "Todos")
  const mesesDisponiveis = [
    { value: "todos", label: "Todos os meses" },
    ...Array.from({ length: 36 }, (_, i) => {
      const date = subMonths(hoje, i);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = format(date, "MMMM 'de' yyyy", { locale: ptBR });
      return { value, label: label.charAt(0).toUpperCase() + label.slice(1) };
    }),
  ];

  const mesAtualTexto = mesSelecionado === "todos"
    ? "Todos os meses"
    : mesesDisponiveis.find(m => m.value === mesSelecionado)?.label || "Mês atual";

  // Requisição com filtro de mês (passa ?mes=YYYY-MM ou omite)
  const { data: response, isLoading, error } = useQuery<{ success: boolean; data: Pagamento[] }>({
    queryKey: ["pagamentos-superadmin", mesSelecionado],
    queryFn: async () => {
      const params = mesSelecionado !== "todos" ? { mes: mesSelecionado } : {};
      const { data } = await api.get("/superadmin/pagamentos", { params });
      return data;
    },
  });

  const pagamentos = response?.data || [];

  // Filtro local (apenas busca, status, plano)
  const filtered = pagamentos.filter((p) => {
    const matchSearch = (p.escolinha || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filtroStatus === "todos" || (p.status || "").toLowerCase() === filtroStatus.toLowerCase();
    const matchPlano = filtroPlano === "todos" || (p.plano || "").toLowerCase() === filtroPlano.toLowerCase();

    return matchSearch && matchStatus && matchPlano;
  });

 // Paginação aplicada na lista filtrada
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
        const totalPages = Math.ceil(filtered.length / itemsPerPage);


  const totalRecebido = filtered
    .filter((p) => ["confirmado", "pago"].includes((p.status || "").toLowerCase()))
    .reduce((acc, p) => acc + (p.valor || 0), 0);

  const totalAtrasado = filtered
    .filter((p) => ["pendente", "atrasado"].includes((p.status || "").toLowerCase()))
    .reduce((acc, p) => acc + (p.valor || 0), 0);

  const mutationMarcarPago = useMutation({
    mutationFn: async (pagamentoId: string) => {
      return api.put(`/superadmin/pagamentos/${pagamentoId}/marcar-pago`, {
        metodo: "DINHEIRO",
      });
    },

    onSuccess: () => {
      toast.success("Pagamento marcado como pago!", {
        description: "O status foi atualizado para 'Confirmado'.",
      });
      queryClient.invalidateQueries({ queryKey: ["pagamentos-superadmin"] });
      setPagamentoToPay(null);
    },

    onError: (err: any) => {
      toast.error("Erro ao marcar como pago", {
        description: err.response?.data?.error || "Tente novamente",
      });
    },
  });

  const handleMarcarPago = (pagamentoId: string) => {
    setPagamentoToPay(pagamentoId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // reseta para página 1
  };

  // Navegação rápida com setas (próximo e anterior)
  const handlePrevMonth = () => {
    if (mesSelecionado === "todos") return;
    const [ano, mes] = mesSelecionado.split('-').map(Number);
    const novaData = subMonths(new Date(ano, mes - 1, 1), 1);
    const novoMes = `${novaData.getFullYear()}-${String(novaData.getMonth() + 1).padStart(2, '0')}`;
    setMesSelecionado(novoMes);
    setCurrentPage(1);
  };

  const handleNextMonth = () => {
    if (mesSelecionado === "todos") return;
    const [ano, mes] = mesSelecionado.split('-').map(Number);
    const novaData = addMonths(new Date(ano, mes - 1, 1), 1);
    const novoMes = `${novaData.getFullYear()}-${String(novaData.getMonth() + 1).padStart(2, '0')}`;
    setMesSelecionado(novoMes);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string = "pendente") => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    let extraClasses = "flex items-center gap-1";

    switch (status.toLowerCase()) {
      case "confirmado":
      case "pago":
        variant = "default";
        extraClasses += " bg-green-600 text-white";
        return (
          <Badge variant={variant} className={extraClasses}>
            <CheckCircle className="h-3 w-3" /> Pago
          </Badge>
        );
      case "atrasado":
        variant = "destructive";
        return (
          <Badge variant={variant} className={extraClasses}>
            <AlertCircle className="h-3 w-3" /> Atrasado
          </Badge>
        );
      case "pendente":
        variant = "secondary";
        extraClasses += " bg-orange-600 text-white";
        return (
          <Badge variant={variant} className={extraClasses}>
            <Calendar className="h-3 w-3" /> Pendente
          </Badge>
        );
      case "cancelado":
        variant = "outline";
        return (
          <Badge variant={variant} className={extraClasses}>
            <XCircle className="h-3 w-3" /> Cancelado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanoColor = (plano: string = "desconhecido") => {
    switch (plano.toLowerCase()) {
      case "enterprise": return "bg-gradient-to-r from-purple-600 to-pink-600 text-white";
      case "pro": return "bg-gradient-to-r from-blue-600 to-cyan-600 text-white";
      case "basico": return "bg-gradient-to-r from-green-600 to-emerald-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <span className="ml-4 text-xl">Carregando pagamentos...</span>
      </div>
    );
  }

  if (error) {
    console.error("[Pagamentos] Erro:", error);
    toast.error("Erro ao carregar pagamentos", {
      description: (error as any).message || "Tente novamente mais tarde",
    });

    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Erro ao carregar pagamentos</h2>
        <p className="mt-2">Verifique sua conexão ou permissões</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <DollarSign className="h-10 w-10 text-green-600" />
          Pagamentos da Plataforma
        </h1>
        <p className="text-gray-600 text-lg mt-2">
          Visão completa de todos os pagamentos (SaaS + mensalidades) – {mesAtualTexto}
        </p>
         {/* Navegação rápida de mês */}
       {/*} <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} disabled={mesSelecionado === "todos"}>
            <ChevronUp className="h-5 w-5" />
          </Button>
          <div className="text-lg font-medium text-gray-700 min-w-[180px] text-center">
            {mesAtualTexto}
          </div>
          <Button variant="ghost" size="icon" onClick={handleNextMonth} disabled={mesSelecionado === "todos"}>
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>*/}

        {/* Filtro por mês/ano */}
        <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
          <SelectTrigger className="w-full md:w-56">
            <SelectValue placeholder="Filtrar por mês" />
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
              R$ {(totalRecebido || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
              R$ {(totalAtrasado || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Total Pagamentos ({filtered.length})
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
      <div className="space-y-4 md:space-y-0 md:flex md:flex-row md:gap-4 md:items-end flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
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
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="atrasado">Atrasado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroPlano} onValueChange={setFiltroPlano}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Plano/Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="saas">SaaS</SelectItem>
            <SelectItem value="mensalidade_futebol">Futebol</SelectItem>
            <SelectItem value="mensalidade_crossfit">CrossFit</SelectItem>
            <SelectItem value="aula_extra">Aula Extra</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela com Paginação */}
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
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Escolinha</TableHead>
                    <TableHead>Plano/Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((pagamento) => (
                    <TableRow key={pagamento.id}>
                      <TableCell className="font-medium">{pagamento.escolinha || "—"}</TableCell>
                      <TableCell>
                        <Badge className={getPlanoColor(pagamento.plano || "desconhecido")}>
                          {pagamento.plano || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {(pagamento.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        {pagamento.dataVencimento && isValid(new Date(pagamento.dataVencimento))
                          ? format(new Date(pagamento.dataVencimento), "dd/MM/yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {pagamento.dataPagamento && isValid(new Date(pagamento.dataPagamento))
                          ? format(new Date(pagamento.dataPagamento), "dd/MM/yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell>{pagamento.metodo || "—"}</TableCell>
                      <TableCell>{getStatusBadge(pagamento.status || "pendente")}</TableCell>
                      <TableCell className="text-right">
                        {["pendente", "atrasado"].includes((pagamento.status || "").toLowerCase()) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                            onClick={() => handleMarcarPago(pagamento.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marcar como Pago
                          </Button>
                        ) : (
                          <Badge variant="secondary">Já pago</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              <Pagination
            currentPage={currentPage}
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(value) => {
                setItemsPerPage(value);
                setCurrentPage(1); // reseta para primeira página ao mudar o limite
              }}
            className="mt-8"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmação */}
      <AlertDialog open={!!pagamentoToPay} onOpenChange={() => setPagamentoToPay(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como pago em dinheiro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação marcará o pagamento como Confirmado com método DINHEIRO e data atual.
              Não será possível desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pagamentoToPay) {
                  mutationMarcarPago.mutate(pagamentoToPay);
                }
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Sim, marcar como pago
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PagamentosPage;