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
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pagination } from "@/src/components/common/Pagination";

// Interfaces de dados
interface DashboardData {
  aulasHoje: number;
  totalAlunos: number;
  alunosAtivos: number;
  receitaMensalEstimada: number;
  pagamentosPendentes: number;
  crescimentoMensal?: string;
}

interface Inadimplente {
  id: string;
  alunoNome: string;
  responsavelNome: string | null;
  valorDevido: number;
  dataVencimento: string;
  status: string;
  alunoId: string;
  modalidade: 'futebol' | 'crossfit';  // ← obrigatório agora
}

interface Aniversariante {
  nome: string;
  idade: number;
  dataAniversario: string;
  modalidade: 'futebol' | 'crossfit';  // ← adicione isso aqui
}

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

const meses = generateMeses();

const AdminDashboardPage = () => {
  const queryClient = useQueryClient();
  const [mesSelecionado, setMesSelecionado] = useState(meses[0].value);
  const [pagamentoToPay, setPagamentoToPay] = useState<string | null>(null);

// Formata data ISO ou string YYYY-MM-DD para DD/MM/YYYY (sem fuso)
const formatDateBR = (dateStr: string | Date | null | undefined): string => {
  if (!dateStr) return "—";

  let str = typeof dateStr === 'string' ? dateStr : dateStr.toISOString();

  // Pega apenas a parte YYYY-MM-DD
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }

  return "—";
};
  // Persistência do modo cards/tabela
  const [viewMode, setViewMode] = useState<"cards" | "table">(() => {
    const saved = localStorage.getItem("dashboard-view-mode");
    return saved === "cards" || saved === "table" ? saved : "table";
  });

  useEffect(() => {
    localStorage.setItem("dashboard-view-mode", viewMode);
  }, [viewMode]);

  // Paginação para inadimplentes
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dashboard geral
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["dashboard-tenant", mesSelecionado],
    queryFn: async () => {
      const res = await api.get("/tenant/dashboard", {
        params: { mes: mesSelecionado },
      });
      return res.data.data;
    },
  });

  // Busca quantidade de aulas de HOJE
const hoje = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

const { 
  data: aulasHoje = 0, 
  isLoading: isLoadingAulasHoje, 
  error: aulasHojeError 
} = useQuery<number>({
  queryKey: ["aulas-hoje"],
  queryFn: async () => {
    const res = await api.get("/tenant/treinos-futebol", {
      params: {
        dataInicio: hoje,
        dataFim: hoje,
      },
    });
    return res.data.data?.length || 0; // conta quantos treinos retornaram
  },
  staleTime: 5 * 60 * 1000, // cache 5 min
});

 // Busca de próximos treinos (hoje ou próximos dias)
const { 
  data: proximasAulas = [], 
  isLoading: isLoadingTreinos 
} = useQuery<Treino[]>({
  queryKey: ["proximas-aulas"],
  queryFn: async () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // zera hora local para evitar offset

    // Envia data em formato ISO sem hora (UTC)
    const hojeStr = hoje.toISOString().split('T')[0]; // "2026-02-20"

    const res = await api.get("/tenant/treinos-futebol", {
      params: {
        dataInicio: hojeStr,
        dataFim: hojeStr, // ou ajuste para próximos 7 dias
      },
    });

    // O backend já deve retornar data como string "YYYY-MM-DD"
    return res.data.data || [];
  },
  staleTime: 5 * 60 * 1000, // cache 5 minutos
});

  // Alunos inadimplentes
  const { 
    data: inadimplentes = [], 
    isLoading: isLoadingInadimplentes 
  } = useQuery<Inadimplente[]>({
    queryKey: ["inadimplentes", mesSelecionado],
    queryFn: async () => {
      const res = await api.get("/tenant/alunos-inadimplentes", {
        params: { mes: mesSelecionado },
      });
      return res.data.data || [];
    },
  });

  // Aniversariantes da semana
const { 
  data: aniversariantesSemana = [], 
  isLoading: isLoadingAniversariantes 
} = useQuery<Aniversariante[]>({
  queryKey: ["aniversariantes-semana", mesSelecionado],  // chave muda com o mês → refetch automático
  queryFn: async () => {
    const res = await api.get("/tenant/aniversariantes-semana", {
      params: { mes: mesSelecionado }  // ← ESSA LINHA RESOLVE TUDO
    });
    console.log("[DEBUG ANIVERSARIANTES] Dados recebidos para mês", mesSelecionado, ":", res.data.data);
    return res.data.data || [];
  },
  staleTime: 0,  // força sempre buscar dados frescos ao mudar o mês (opcional, mas ajuda)
});

  // Mock temporário para próximas aulas (substitua por rota real quando tiver)
 /* const proximasAulas = [
    { hora: "09:00", aula: "Musculação - Turma A", professor: "Mariana Costa", alunos: 12 },
    { hora: "10:00", aula: "Cross Training", professor: "Rafael Lima", alunos: 15 },
    { hora: "18:00", aula: "Natação Infantil", professor: "Beatriz Souza", alunos: 8 },
  ];
*/
  // Mutation para marcar pagamento como pago
 const marcarPagoMutation = useMutation({
  mutationFn: async (pagamentoId: string) => {
    await api.put(`/tenant/pagamentos/${pagamentoId}/marcar-pago`, {
      metodo: "DINHEIRO", // pode virar select no futuro
    });
  },
  onSuccess: () => {
    toast.success("Pagamento marcado como pago!");
   queryClient.refetchQueries({
  queryKey: ["inadimplentes", mesSelecionado],
  exact: true,
  type: 'active',
});
queryClient.refetchQueries({
  queryKey: ["dashboard-tenant", mesSelecionado],
  exact: true,
  type: 'active',
});
    setPagamentoToPay(null);
  },
  onError: (err: any) => {
    toast.error("Erro ao marcar como pago", {
      description: err.response?.data?.error || "Tente novamente",
    });
  },
});

// Na query de inadimplentes
useQuery<Inadimplente[]>({
  queryKey: ["inadimplentes", mesSelecionado],
  queryFn: async () => {
    const res = await api.get("/tenant/alunos-inadimplentes", { params: { mes: mesSelecionado } });
    return res.data.data || [];
  },
  staleTime: 0, // ← força sempre buscar dados frescos
});

// Na query de dashboard
useQuery<DashboardData>({
  queryKey: ["dashboard-tenant", mesSelecionado],
  queryFn: async () => {
    const res = await api.get("/tenant/dashboard", { params: { mes: mesSelecionado } });
    return res.data.data;
  },
  staleTime: 0,
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
            {isLoadingAulasHoje ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : aulasHojeError ? (
              <div className="text-center text-red-600 text-sm">
                Erro ao carregar aulas
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{aulasHoje ?? 0}</div>
                <p className="text-xs text-gray-500 mt-1">programadas para hoje</p>
              </>
            )}
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
            {/*porcentagem mes */}
              <div className="flex items-center gap-1 text-xs mt-1">
                <TrendingUp className="h-3 w-3" />
                <span className={
                  data?.crescimentoMensal?.startsWith('+') 
                    ? "text-green-600 font-medium" 
                    : data?.crescimentoMensal?.startsWith('-') 
                      ? "text-red-600 font-medium" 
                      : "text-gray-600"
                }>
                  {data?.crescimentoMensal || "0%"}
                </span>
              </div>
          </CardContent>
        </Card>

        <Card className={(data?.pagamentosPendentes ?? 0) > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            {(data?.pagamentosPendentes ?? 0) > 0 ? (
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
            <div className="space-y-2">
              {isLoadingTreinos ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  <span className="ml-3 text-sm text-gray-500">Carregando aulas...</span>
                </div>
              ) : proximasAulas.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma aula programada para hoje
                </p>
              ) : (
                proximasAulas.map((aula, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                    {/*
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                        {aula.horaInicio.split(':')[0]}
                      </div>
                      */}
                      <div>
                        <p className="font-medium text-sm">{aula.nome}</p>
                        <p className="text-xs text-gray-600">
                          {aula.funcionarioTreinador?.nome || "—"} • {aula.categoria}
                        </p>
                      </div>
                    </div>

                    {/* Data + horário usando formatDateBR */}
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-1">
                        {formatDateBR(aula.data)}
                      </Badge>
                      <p className="text-xs text-gray-500">
                        {aula.horaInicio} - {aula.horaFim}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/aulas">
                Ver agenda completa
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Aniversariantes da Semana */}
        <Card>
          <CardHeader>
            <CardTitle>Aniversariantes do mês 🎉</CardTitle> {/* ← adicionado "Atual" */}
          </CardHeader>
          <CardContent>
            {aniversariantesSemana.length > 0 ? (
              <div className="space-y-2">
                {aniversariantesSemana.map((a, i) => (
                  <div key={i} className="flex items-center gap-4 p-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                      {a.idade}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{a.nome}</p>
                        <Badge
                          variant="outline"
                          className={
                            a.modalidade === 'futebol'
                              ? "bg-blue-50 text-blue-700 border-blue-200 text-xs"
                              : "bg-purple-50 text-purple-700 border-purple-200 text-xs"
                          }
                        >
                          {a.modalidade === 'futebol' ? '⚽' : '🏋️'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-700">
                        Faz {a.idade} anos em {a.dataAniversario}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Nenhum aniversariante do mês
              </p>
            )}
          </CardContent>
        </Card>
        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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

      {/* Nova seção: Alunos Inadimplentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Alunos Inadimplentes ({totalInadimplentes})
            </div>
            <Badge variant="destructive" className="bg-red-600 text-sm text-white">
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
                    <TableHead>Modalidade</TableHead>
                    <TableHead className="hidden md:table-cell">Responsável</TableHead>
                    <TableHead className="hidden md:table-cell">Valor Devido</TableHead>
                    <TableHead className="hidden md:table-cell">Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInadimplentes.map((pagamento: Inadimplente) => (
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
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            pagamento.modalidade === 'futebol'
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }
                        >
                          {pagamento.modalidade === 'futebol' ? '⚽' : '🏋️ '}
                        </Badge>
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
                        <Badge className="bg-red-600 text-xs text-white" variant="destructive">
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
  );
};

export default AdminDashboardPage;