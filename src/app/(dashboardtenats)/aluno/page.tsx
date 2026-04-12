/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/aluno/page.tsx
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Search,
  UserPlus,
  Phone,
  Calendar,
  UserCheck,
  Loader2,
  AlertCircle,
  Volleyball,
  MoreVertical,
  Edit,
  Trash2,
  LayoutGrid,
  Users,
  Mail,
  Table as TableIcon,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
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
import { useApiMutation } from "@/src/hooks/useApiMutation";

// Função para formatar telefone
const formatarTelefone = (phone: string | null) => {
  if (!phone) return "Não informado";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

// Função para calcular idade
const calcularIdade = (birthDate: string): number => {
  if (!birthDate) return 0;
  const [ano, mes, dia] = birthDate.split("T")[0].split("-");
  const nascimento = new Date(Number(ano), Number(mes) - 1, Number(dia));
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
};

interface Aluno {
  id: string;
  nome: string;
  dataNascimento: string;
  telefone: string | null;
  responsavel?: { nome: string } | null;
  status: "ATIVO" | "INATIVO" | "TRANCADO";
  email: string | null;
  userId: string | null;
  categoria: string | null;
  fotoUrl: string | null;
}

const AlunoPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [alunoParaRemover, setAlunoParaRemover] = useState<Aluno | null>(null);

  // Persistência do modo de visualização (igual ao CrossFit)
  const [viewMode, setViewMode] = useState<"cards" | "table">(() => {
    const saved = localStorage.getItem("futebol-view-mode");
    return (saved === "cards" || saved === "table") ? saved : "table";
  });

  useEffect(() => {
    localStorage.setItem("futebol-view-mode", viewMode);
  }, [viewMode]);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const queryClient = useQueryClient();

  const { data: alunos = [], isLoading, error } = useQuery<Aluno[]>({
    queryKey: ["alunos-futebol", searchTerm],
    queryFn: async () => {
      const res = await api.get("/tenant/alunos", {
        params: { search: searchTerm || undefined },
      });
      return res.data.data || [];
    },
  });

const deleteMutation = useMutation({
  mutationFn: async (id: string) => {
    return api.delete(`/tenant/alunos/${id}`);
  },

  onSuccess: () => {
    toast.success("Aluno removido com sucesso!");
    queryClient.invalidateQueries({ queryKey: ["alunos-futebol"] });   // atualiza a lista
    setAlunoParaRemover(null);                                 // fecha modal/confirmação
  },

  onError: (err: any) => {
    const message = err.response?.data?.error || err.message || "Erro desconhecido";

    // Tratamento específico por tipo de erro
    if (err.response?.status === 404) {
      toast.error("Aluno não encontrado");
    } else if (err.response?.status === 403) {
      toast.error("Você não tem permissão para excluir este aluno");
    } else {
      toast.error("Erro ao remover aluno", {
        description: message,
      });
    }

    console.error("Erro ao deletar aluno:", err);
  },
});

  const filteredAlunos = alunos.filter(
    (aluno) =>
      aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (aluno.telefone && aluno.telefone.includes(searchTerm)) ||
      (aluno.responsavel?.nome?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalItems = filteredAlunos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredAlunos.slice(startIndex, startIndex + itemsPerPage);

  const totalAlunos = filteredAlunos.length;
  // Se tiver statusPagamento no model, ajuste aqui
  const emDia = filteredAlunos.filter((a) => a.status === "ATIVO").length; // exemplo
  const atrasados = filteredAlunos.length - emDia;

  const handleRemover = (aluno: Aluno) => {
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-600">Carregando alunos de futebol...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-600">
        <AlertCircle className="h-12 w-12" />
        <p className="mt-4 font-medium">Erro ao carregar alunos</p>
        <p className="text-sm text-gray-500">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Cabeçalho + Botões de ação */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Alunos de Futebol</h1>
          <p className="text-gray-600">Gerencie todos os alunos cadastrados</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/aluno/novo">
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Aluno
            </Link>
          </Button>
        </div>
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome, telefone ou responsável..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Cards de Totais */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Total de Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalAlunos}</div>
          </CardContent>
        </Card>

        {/* Se tiver statusPagamento no model, ajuste aqui */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {filteredAlunos.filter(a => a.status === "ATIVO").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Inativos/Trancados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {filteredAlunos.filter(a => a.status !== "ATIVO").length}
            </div>
          </CardContent>
        </Card>
      </div>
 {/* Alternância de visualização */}
          <div className="flex items-center gap-2s p-1 rounded-lg">
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

      {/* Conteúdo principal: Cards ou Tabela */}
      {viewMode === "cards" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paginatedItems.map((aluno) => {
            const idade = calcularIdade(aluno.dataNascimento);
            const isMaior = idade >= 18;

            return (
              <Card key={aluno.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={aluno.fotoUrl|| undefined} />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {aluno.nome.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{aluno.nome}</CardTitle>
                        <p className="text-xs text-gray-500">
                          {aluno.dataNascimento
                            ? aluno.dataNascimento.split("T")[0].split("-").reverse().join("/")
                            : "Não informado"}{" "}
                          • {idade} anos {isMaior && <Badge variant="outline" className="text-xs ml-1">Maior</Badge>}
                        </p>
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
                          <Link href={`/aluno/${aluno.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Ver detalhes / Editar
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
                                Tem certeza que deseja remover <strong>{aluno.nome}</strong>?
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

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    {formatarTelefone(aluno.telefone)}
                  </div>

                  {aluno.responsavel && (
                    <div className="flex items-center gap-2 text-sm">
                      <UserCheck className="h-4 w-4 text-gray-500" />
                      {aluno.responsavel.nome}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <Badge variant="outline" className="text-xs">
                      {aluno.categoria || "Sem categoria"}
                    </Badge>

                    <Badge
                      variant="default"
                      className={`text-xs text-white ${
                        aluno.status === "ATIVO"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : aluno.status === "INATIVO"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-orange-600 hover:bg-orange-700"
                      }`}
                    >
                      {aluno.status}
                    </Badge>
                  </div>

                  {aluno.userId && (
                    <Badge className="text-xs bg-green-600 text-white">
                      Tem login
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead className="hidden md:table-cell">Contato</TableHead>
                  <TableHead className="hidden md:table-cell">Idade</TableHead>
                  <TableHead className="hidden md:table-cell">Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((aluno) => {
                  const idade = calcularIdade(aluno.dataNascimento);

                  return (
                    <TableRow key={aluno.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={aluno.fotoUrl|| undefined} />
                            <AvatarFallback className="bg-blue-600 text-white">
                              {aluno.nome.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span>{aluno.nome}</span>
                            <span className="text-xs text-gray-500 md:hidden">
                              {aluno.email || "Sem e-mail"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-gray-500" />
                            {aluno.email || "—"}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-gray-500" />
                            {formatarTelefone(aluno.telefone)}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        {idade} anos {idade >= 18 && <Badge variant="outline" className="ml-2 text-xs">Maior</Badge>}
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{aluno.categoria || "Sem categoria"}</Badge>
                      </TableCell>

                      <TableCell>
                      <Badge
                          variant="default"
                          className={`text-xs text-white ${
                            aluno.status === "ATIVO"
                              ? "bg-blue-600 hover:bg-blue-700"
                              : aluno.status === "INATIVO"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-orange-600 hover:bg-orange-700"
                          }`}
                        >
                          {aluno.status}
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
                              <Link href={`/aluno/${aluno.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Ver detalhes / Editar
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
                                    Tem certeza que deseja remover <strong>{aluno.nome}</strong>?
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
                  );
                })}
              </TableBody>
            </Table>

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
              Tem certeza que deseja remover <strong>{alunoParaRemover?.nome}</strong>?
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

export default AlunoPage;