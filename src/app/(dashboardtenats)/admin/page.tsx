/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
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
import {
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  Activity,
  Loader2,
  CheckCircle,
  MoreVertical,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { format, isValid, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pagination } from "@/src/components/common/Pagination";

// Meses dinâmicos
const generateMeses = () => {
  return Array.from({ length: 13 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleString("pt-BR", { month: "long", year: "numeric" });
    return { value, label: label.charAt(0).toUpperCase() + label.slice(1) };
  });
};

interface Inadimplente {
  id: string;
  alunoNome: string;
  responsavelNome: string | null;
  valorDevido: number;
  dataVencimento: string;
  status: string;
  alunoId: string;
}

const meses = generateMeses();

const AdminDashboardPage = () => {
  const queryClient = useQueryClient();
  const [mesSelecionado, setMesSelecionado] = useState(meses[0].value);
  const [pagamentoToPay, setPagamentoToPay] = useState<string | null>(null);

// Persistência do modo cards/tabela
  const [viewMode, setViewMode] = useState<"cards" | "table">(() => {
    const saved = localStorage.getItem("dashboard-view-mode");
    return (saved === "cards" || saved === "table") ? saved : "table";
  });

  useEffect(() => {
    localStorage.setItem("dashboard-view-mode", viewMode);
  }, [viewMode]);

  // Paginação para inadimplentes
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dashboard geral
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-tenant", mesSelecionado],
    queryFn: async () => {
      const { data } = await api.get("/tenant/dashboard", {
        params: { mes: mesSelecionado },
      });
      return data.data;
    },
  });

  // Alunos inadimplentes (do mês selecionado)
const { 
  data: inadimplentes = [], 
  isLoading: isLoadingInadimplentes 
} = useQuery<Inadimplente[]>({
  queryKey: ["inadimplentes", mesSelecionado],
  queryFn: async () => {
    const { data } = await api.get("/tenant/alunos-inadimplentes", {
      params: { mes: mesSelecionado },
    });
    return data.data || [];
  },
});
  // Mock temporário para seções que ainda não têm rota real
  const proximasAulas = [
    { hora: "09:00", aula: "Musculação - Turma A", professor: "Mariana Costa", alunos: 12 },
    { hora: "10:00", aula: "Cross Training", professor: "Rafael Lima", alunos: 15 },
    { hora: "18:00", aula: "Natação Infantil", professor: "Beatriz Souza", alunos: 8 },
  ];

  // Aniversariantes da semana (do servidor)
  const { 
    data: aniversariantesSemana = [], 
    isLoading: isLoadingAniversariantes 
  } = useQuery({
    queryKey: ["aniversariantes-semana"],
    queryFn: async () => {
      const { data } = await api.get("/tenant/aniversariantes-semana");
      return data.data || [];
    },
  });

  // Mutation para marcar pagamento como pago
  const marcarPagoMutation = useMutation({
    mutationFn: async (pagamentoId: string) => {
      await api.put(`/tenant/pagamentos/${pagamentoId}/marcar-pago`, {
        metodo: "DINHEIRO", // ou PIX, CARTAO, etc. — pode virar select depois
      });
    },
    onSuccess: () => {
      toast.success("Pagamento marcado como pago!", {
        description: "O status foi atualizado.",
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard-tenant"] });
      queryClient.invalidateQueries({ queryKey: ["inadimplentes"] });
      setPagamentoToPay(null);
    },
    onError: (err: any) => {
      toast.error("Erro ao marcar como pago", {
        description: err.response?.data?.error || "Tente novamente",
      });
    },
  });

  // Paginação local
  const totalInadimplentes = inadimplentes.length;
  const totalPages = Math.ceil(totalInadimplentes / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInadimplentes = inadimplentes.slice(startIndex, startIndex + itemsPerPage);

  const handleMarcarPago = (pagamentoId: string) => {
    setPagamentoToPay(pagamentoId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const mesLabel = meses.find((m) => m.value === mesSelecionado)?.label || "Mês atual";

  if (isLoading || isLoadingInadimplentes || isLoadingAniversariantes) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <span className="ml-4 text-xl">Carregando dashboard...</span>
      </div>
    );
  }

  if (error) {
    toast.error("Erro ao carregar dashboard", {
      description: (error as Error).message || "Tente novamente mais tarde",
    });
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Erro ao carregar dados</h2>
        <p className="mt-2">Tente novamente mais tarde</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard da Escolinha</h1>
          <p className="text-gray-600 text-lg mt-2">
            Visão geral — <span className="font-bold text-blue-600">{mesLabel}</span>
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {meses.map((mes) => (
                <SelectItem key={mes.value} value={mes.value}>
                  {mes.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards Principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aulas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.aulasHoje}</div>
            <p className="text-xs text-gray-500 mt-1">programadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalAlunos ?? 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-600 font-medium">{data?.alunosAtivos ?? 0} ativos</span> este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
            R$ {(data?.receitaMensalEstimada ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              {data.crescimentoMensal || "+0%"}
            </div>
          </CardContent>
        </Card>

        <Card className={data.pagamentosPendentes > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            {data.pagamentosPendentes > 0 ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <Activity className="h-4 w-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data?.pagamentosPendentes ?? 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">mensalidades em aberto</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção Rápida */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Próximas Aulas */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Aulas Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proximasAulas.map((aula, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{aula.aula}</p>
                    <p className="text-xs text-gray-600">{aula.hora} - {aula.professor}</p>
                  </div>
                  <Badge variant="secondary">{aula.alunos} alunos</Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/aulas">Ver agenda completa</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Aniversariantes do Dia */}
        <Card>
          <CardHeader>
            <CardTitle>Aniversariantes da Semana 🎉</CardTitle>
          </CardHeader>
          <CardContent>
            {aniversariantesSemana.length > 0 ? (
              <div className="space-y-4">
                {aniversariantesSemana.map((a: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                      {a.idade}
                    </div>
                    <div>
                      <p className="font-medium">{a.nome}</p>
                      <p className="text-xs text-gray-600">
                        Faz {a.idade} anos em {format(new Date(a.dataAniversario), "dd/MM", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Nenhum aniversariante esta semana</p>
            )}
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/alunos/novo">
                <Users className="mr-2 h-4 w-4" />
                Novo Aluno
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/funcionarios/novo">
                Novo Funcionário
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/financeiro">
                Ver Financeiro Completo
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
           {/* Nova seção: Alunos Inadimplentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Alunos Inadimplentes ({totalInadimplentes})
            </div>
            <Badge variant="destructive" className="text-sm">
              R$ {inadimplentes.reduce((acc: number, a: Inadimplente) => acc + (a.valorDevido || 0), 0)
                .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalInadimplentes === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhum aluno inadimplente neste mês.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead className="hidden md:table-cell">Responsável</TableHead>
                    <TableHead className="hidden md:table-cell">Valor Devido</TableHead>
                    <TableHead className="hidden md:table-cell">Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInadimplentes.map((pagamento) => (
                    <TableRow key={pagamento.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-red-600 text-white">
                              {pagamento.alunoNome?.split(" ").map(n => n[0]).join("") || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span>{pagamento.alunoNome || "—"}</span>
                            <span className="text-xs text-gray-500 md:hidden">
                              {pagamento.responsavelNome || "—"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        {pagamento.responsavelNome || "—"}
                      </TableCell>

                      <TableCell className="hidden md:table-cell font-medium text-red-600">
                        R$ {(pagamento.valorDevido || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        {pagamento.dataVencimento && isValid(new Date(pagamento.dataVencimento))
                          ? format(new Date(pagamento.dataVencimento), "dd/MM/yyyy", { locale: ptBR })
                          : "—"}
                      </TableCell>

                      <TableCell>
                        <Badge variant="destructive">
                          {pagamento.status || "Atrasado"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/aluno/${pagamento.alunoId}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Ver detalhes do aluno
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleMarcarPago(pagamento.id)}
                              className="text-green-600 focus:text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como pago
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination
                currentPage={currentPage}
                totalItems={totalInadimplentes}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                className="mt-6"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmação para marcar pago */}
      <AlertDialog open={!!pagamentoToPay} onOpenChange={() => setPagamentoToPay(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como pago?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja marcar este pagamento como pago? O status será atualizado imediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                if (pagamentoToPay) {
                  marcarPagoMutation.mutate(pagamentoToPay);
                }
              }}
            >
              Sim, marcar como pago
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> 
      </div>
    </div>
  );
};

export default AdminDashboardPage;