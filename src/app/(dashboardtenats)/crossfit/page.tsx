/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/crossfit/page.tsx
"use client";

import { useState, useEffect } from "react"; // ← adicionei useEffect aqui
import { format } from "date-fns";
import {
  Activity,
  Search,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  Users,
  UserPlus,
  LayoutGrid,
  Table as TableIcon,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
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
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import api from "@/src/lib/api";
import { Pagination } from "@/src/components/common/Pagination";

// Função para formatar telefone
const formatarTelefone = (phone: string | null) => {
  if (!phone) return "Não informado";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

interface AlunoCrossfit {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  dataNascimento: string;
  observacoes: string | null;
  frequencia: number;
  status: string;
  createdAt: string;
  ultimoPagamento?: string | null;
  statusPagamento?: "Em Dia" | "Atrasado" | "Pendente";
}

const ClientesCrossFitPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [alunoParaRemover, setAlunoParaRemover] = useState<AlunoCrossfit | null>(null);

  // Recupera o modo salvo ou usa "table" como padrão
  const [viewMode, setViewMode] = useState<"cards" | "table">(() => {
    const saved = localStorage.getItem("crossfit-view-mode");
    return (saved === "cards" || saved === "table") ? saved : "table";
  });

  // Salva no localStorage sempre que mudar (no topo do componente!)
  useEffect(() => {
    localStorage.setItem("crossfit-view-mode", viewMode);
  }, [viewMode]);

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const queryClient = useQueryClient();

  const { data: alunos = [], isLoading, error } = useQuery<AlunoCrossfit[]>({
    queryKey: ["alunos-crossfit", searchTerm],
    queryFn: async () => {
      const res = await api.get("/tenant/alunos-crossfit", {
        params: { search: searchTerm || undefined },
      });
      return res.data.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tenant/alunos-crossfit/${id}`);
    },
    onSuccess: () => {
      toast.success("Aluno removido com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["alunos-crossfit"] });
      setAlunoParaRemover(null);
    },
    onError: (err: any) => {
      toast.error("Erro ao remover aluno", {
        description: err.response?.data?.error || "Tente novamente",
      });
    },
  });

  const filtered = alunos.filter(
    (aluno) =>
      aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const totalAlunos = filtered.length;
  const emDia = filtered.filter((a) => a.statusPagamento === "Em Dia").length;
  const atrasados = filtered.filter((a) => a.statusPagamento !== "Em Dia").length;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Em Dia":
        return <Badge className="bg-green-600">Em Dia</Badge>;
      case "Atrasado":
        return <Badge className="bg-red-600">Atrasado</Badge>;
      case "Pendente":
        return <Badge className="bg-orange-600">Pendente</Badge>;
      default:
        return <Badge variant="secondary">Indefinido</Badge>;
    }
  };

  const handleRemover = (aluno: AlunoCrossfit) => {
    setAlunoParaRemover(aluno);
  };

  const confirmarRemocao = () => {
    if (alunoParaRemover) {
      deleteMutation.mutate(alunoParaRemover.id);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
        <p className="ml-4 text-lg text-gray-600">Carregando alunos CrossFit...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="h-16 w-16 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Erro ao carregar alunos</h2>
        <p className="mt-2">{(error as Error).message || "Tente novamente mais tarde"}</p>
        <Button className="mt-6" onClick={() => queryClient.refetchQueries({ queryKey: ["alunos-crossfit"] })}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Activity className="h-10 w-10 text-red-600" />
            Alunos CrossFit
          </h1>
          <p className="text-gray-600 text-lg mt-2">Gerencie os alunos adultos do CrossFit da sua escolinha</p>
        </div>
      </div>

      {/* Cards de Totais */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-red-600" />
              Total de Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{totalAlunos}</div>
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

      {/* Busca + Botões de ação */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 h-12"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
            <Link href="/crossfit/presenca">
              <Calendar className="mr-2 h-4 w-4" />
              Marca Presença
            </Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
            <Link href="/crossfit/novo">
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Aluno
            </Link>
          </Button>

          {/* Alternância de visualização */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="gap-1"
            >
              <LayoutGrid className="h-4 w-4" />
              Cards
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="gap-1"
            >
              <TableIcon className="h-4 w-4" />
              Tabela
            </Button>
              </div>
            </div>
        </div>

      {/* Conteúdo principal: Cards ou Tabela */}
      {viewMode === "cards" ? (
      <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedItems.map((aluno) => (
              <Card key={aluno.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 bg-gradient-to-r from-red-50 to-orange-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-red-600 to-orange-600 text-white">
                          {aluno.nome.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{aluno.nome}</CardTitle>
                        <p className="text-sm text-gray-600 truncate">{aluno.email}</p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/crossfit/${aluno.id}/editar`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar aluno
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/crossfit/${aluno.id}/pagamentos`}>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Ver pagamentos
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/crossfit/presenca">
                            <Calendar className="mr-2 h-4 w-4" />
                            Marcar presença
                          </Link>
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remover aluno
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar remoção?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover <strong>{aluno.nome}</strong> da lista de alunos CrossFit?
                                <br />
                                Essa ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={confirmarRemocao}
                              >
                                Sim, remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-600" />
                    <span>{formatarTelefone(aluno.telefone || "Não informado")}</span>
                </div>
               <div>
                {/*  
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <span className="truncate">{aluno.email}</span>
                  </div>
                   <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-600" />
                      <span>{format(new Date(aluno.dataNascimento), "dd/MM/yyyy")}</span>
                  </div>
                  */}
                </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-gray-600" />
                      <Badge variant="outline">{aluno.frequencia} aulas/semana</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant={aluno.status === "ativo" ? "default" : "destructive"}>
                      {aluno.status === "ativo" ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Paginação no modo cards */}
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            className="mt-6"
          />
        </>
      ) : (
      <Card>
          <CardHeader>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {/* Coluna única para Aluno (avatar + nome) */}
                  <TableHead>Aluno</TableHead>
                  
                  {/* Colunas ocultas em mobile */}
                  <TableHead className="hidden md:table-cell">Contato</TableHead>
                  <TableHead className="hidden md:table-cell">Data de Nascimento</TableHead>
                  <TableHead className="hidden md:table-cell">Frequência Semanal</TableHead>
                  
                  {/* Sempre visíveis */}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((aluno) => (
                  <TableRow key={aluno.id}>
                    {/* Coluna Aluno: avatar + nome (em mobile fica mais compacto) */}
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-red-600 to-orange-600 text-white">
                            {aluno.nome.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{aluno.nome}</span>
                          {/* Em desktop mostra email/telefone como subtítulo */}
                          <span className="text-xs text-gray-500 md:hidden truncate">
                            {aluno.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Colunas extras (só desktop) */}
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-gray-500" />
                          {aluno.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-gray-500" />
                          {formatarTelefone(aluno.telefone || "Não informado")}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      {format(new Date(aluno.dataNascimento), "dd/MM/yyyy")}
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{aluno.frequencia} aulas/semana</Badge>
                    </TableCell>

                    {/* Status (sempre visível) */}
                    <TableCell>
                      <Badge variant={aluno.status === "ativo" ? "default" : "destructive"}>
                        {aluno.status === "ativo" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>

                    {/* Ações (sempre visível) */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/crossfit/${aluno.id}/editar`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar aluno
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/crossfit/${aluno.id}/pagamentos`}>
                              <DollarSign className="mr-2 h-4 w-4" />
                              Ver pagamentos
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/crossfit/presenca">
                              <Calendar className="mr-2 h-4 w-4" />
                              Marcar presença
                            </Link>
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remover aluno
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar remoção?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover <strong>{aluno.nome}</strong> da lista de alunos CrossFit?
                                  <br />
                                  Essa ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={confirmarRemocao}
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

              {/* Paginação */}
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                className="mt-6"
              />
            </CardContent>
        </Card>
      )}

      {/* AlertDialog de remoção */}
      <AlertDialog open={!!alunoParaRemover} onOpenChange={() => setAlunoParaRemover(null)}>
         <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{alunoParaRemover?.nome}</strong> da lista de alunos CrossFit?
              <br />
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmarRemocao}
            >
              Sim, remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientesCrossFitPage;