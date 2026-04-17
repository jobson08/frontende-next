/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/funcionario/page.tsx
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Search,
  UserPlus,
  Phone,
  Mail,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  Users,
  Loader2,
  LayoutGrid,
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

// Função para formatar telefone
const formatarTelefone = (phone: string | null) => {
  if (!phone) return "Não informado";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

interface Funcionario {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  cargo: "PROFESSOR" | "RECEPCAO" | "ADMINISTRATIVO" | "TREINADOR" | "GERENTE";
  observacoes: string | null;
  createdAt: string;
  fotoUrl: string | null;
  // Adicione mais campos se quiser (ex: salario, status, temLogin)
}

const FuncionariosPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [funcionarioParaRemover, setFuncionarioParaRemover] = useState<Funcionario | null>(null);

  // Persistência do modo de visualização
  const [viewMode, setViewMode] = useState<"cards" | "table">(() => {
    const saved = localStorage.getItem("funcionario-view-mode");
    return (saved === "cards" || saved === "table") ? saved : "table";
  });

  useEffect(() => {
    localStorage.setItem("funcionario-view-mode", viewMode);
  }, [viewMode]);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const queryClient = useQueryClient();

  const { data: funcionario = [], isLoading, error } = useQuery<Funcionario[]>({
    queryKey: ["funcionario", searchTerm],
    queryFn: async () => {
      const res = await api.get("/tenant/funcionarios", {
        params: { search: searchTerm || undefined },
      });
      return res.data.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tenant/funcionarios/${id}`);
    },
    onSuccess: () => {
      toast.success("Responsável removido com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["funcionario"] });
      setFuncionarioParaRemover(null);
    },
    onError: (err: any) => {
      toast.error("Erro ao remover responsável", {
        description: err.response?.data?.error || "Tente novamente",
      });
    },
  });

  const filtered = funcionario.filter(r =>
    r.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.telefone && r.telefone.includes(searchTerm)) ||
    (r.email && r.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const totalResponsaveis = filtered.length;
  const comLogin = filtered.filter(r => r.email).length;
  const semLogin = totalResponsaveis - comLogin;

  const handleRemover = (funcionario: Funcionario) => {
    setFuncionarioParaRemover(funcionario);
  };

  const confirmarRemocao = () => {
    if (funcionarioParaRemover) {
      deleteMutation.mutate(funcionarioParaRemover.id);
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
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <span className="ml-4 text-xl">Carregando Funcionario...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="h-16 w-16 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Erro ao carregar Funcionario</h2>
        <p className="mt-2">{(error as Error).message || "Tente novamente mais tarde"}</p>
        <Button className="mt-6" onClick={() => queryClient.refetchQueries({ queryKey: ["funcionario"] })}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Cabeçalho + Botões de ação */}
     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Funcionarios</h1>
          <p className="text-gray-600">Gerencie todos os Funcionarios</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/funcionario/novo">
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Funcionario
            </Link>
          </Button>
        </div>
      </div>

          {/* Busca */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, telefone ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

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

      {/* Conteúdo principal: Cards ou Tabela */}
      {viewMode === "cards" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paginatedItems.map((r) => (
            <Card key={r.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={r.fotoUrl|| undefined} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {r.nome.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{r.nome}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {r.cargo}
                      </Badge>
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
                        <Link href={`/funcionario/${r.id}`}>
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
                            Remover responsável
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar remoção?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover <strong>{r.nome}</strong>?
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
                  {formatarTelefone(r.telefone)}
                </div>
                {r.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {r.email}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionario</TableHead>
                  <TableHead className="hidden md:table-cell">Contato</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={r.fotoUrl|| undefined} />
                          <AvatarFallback className="bg-purple-600 text-white">
                            {r.nome.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span>{r.nome}</span>
                          <span className="text-xs text-gray-500 md:hidden">
                            {r.email || "Sem e-mail"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-gray-500" />
                          {r.email || "—"}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-gray-500" />
                          {formatarTelefone(r.telefone)}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      {r.cargo || "Não informado"}
                    </TableCell>

                    <TableCell>
                      {r.email ? (
                        <Badge className="bg-green-600 text-white">Tem login</Badge>
                      ) : (
                        <Badge variant="outline">Sem login</Badge>
                      )}
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
                            <Link href={`/funcionario/${r.id}`}>
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
                                Remover responsável
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar remoção?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover <strong>{r.nome}</strong>?
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
      <AlertDialog open={!!funcionarioParaRemover} onOpenChange={() => setFuncionarioParaRemover(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{funcionarioParaRemover?.nome}</strong>?
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

export default FuncionariosPage;