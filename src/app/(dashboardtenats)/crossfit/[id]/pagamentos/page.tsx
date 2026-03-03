/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/crossfit/[id]/pagamentos/page.tsx
"use client";

import { useParams } from "next/navigation";
import { format } from "date-fns";
import {
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Trash2,
  MoreVertical,
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
import Link from "next/link";
import api from "@/src/lib/api";
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
import { useState } from "react";

interface Mensalidade {
  id: string;
  dataVencimento: string;
  dataPagamento: string | null;
  valor: number;
  status: "pago" | "atrasado" | "pendente";
  metodoPagamento: string | null;
}

interface AlunoCrossfit {
  id: string;
  nome: string;
  email: string;
  mensalidades: Mensalidade[];
  valorMensalAtual?: number; // opcional, se você tiver esse campo no backend
  planoAtual?: string;       // opcional
}

const VerPagamentosCrossFitPage = () => {
  const { id } = useParams();
  const alunoId = id as string;
  const queryClient = useQueryClient();

  // Estados para exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pagamentoToDelete, setPagamentoToDelete] = useState<string | null>(null);

  // Busca aluno + mensalidades
  const { data: aluno, isLoading, error } = useQuery<AlunoCrossfit>({
    queryKey: ["aluno-crossfit-pagamentos", alunoId],
    queryFn: async () => {
      const res = await api.get(`/tenant/alunos-crossfit/${alunoId}`);
      return res.data.data;
    },
    enabled: !!alunoId,
  });

// Mutation para deletar pagamento
const deletarPagamentoMutation = useMutation({
  mutationFn: async (pagamentoId: string) => {
    await api.delete(`/tenant/alunos-crossfit/${id}/mensalidades/${pagamentoId}`);
  },
  onSuccess: () => {
    toast.success("Pagamento excluído com sucesso!");
    queryClient.invalidateQueries({ queryKey: ["aluno-crossfit-pagamentos", id] });
  },
  onError: (err: any) => {
    toast.error("Erro ao excluir pagamento", {
      description: err.response?.data?.error || "Tente novamente",
    });
  },
});

  // Função para abrir confirmação de exclusão
  const handleDeleteClick = (pagamentoId: string) => {
    setPagamentoToDelete(pagamentoId);
    setDeleteDialogOpen(true);
  };

  // Função para confirmar exclusão
  const confirmDelete = () => {
    if (pagamentoToDelete) {
      deletarPagamentoMutation.mutate(pagamentoToDelete);
    }
    setDeleteDialogOpen(false);
    setPagamentoToDelete(null);
  };

  // Calcula resumo
  const mensalidades = aluno?.mensalidades || [];
  const totalPago = mensalidades
    .filter((m) => m.status === "pago")
    .reduce((acc, m) => acc + m.valor, 0);

  const totalAtrasado = mensalidades
    .filter((m) => m.status === "atrasado" || m.status === "pendente")
    .reduce((acc, m) => acc + m.valor, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pago":
        return (
          <Badge className="bg-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Pago
          </Badge>
        );
      case "atrasado":
        return (
          <Badge className="bg-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Atrasado
          </Badge>
        );
      case "pendente":
        return (
          <Badge className="bg-orange-600 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Pendente
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
        <span className="ml-4 text-xl">Carregando pagamentos...</span>
      </div>
    );
  }

  if (error || !aluno) {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="h-16 w-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Aluno não encontrado</h1>
        <Button asChild className="mt-6">
          <Link href="/crossfit">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/crossfit">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Pagamentos - {aluno.nome}</h1>
          <p className="text-gray-600">Histórico completo de mensalidades e pagamentos</p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Total Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              R$ {totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
              R$ {totalAtrasado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Valor Mensal Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              R$ {(aluno.valorMensalAtual || 149).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Plano: {aluno.planoAtual || "Mensal"}
            </p>
          </CardContent>
        </Card>
      </div>

    {/* Tabela de Histórico */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Histórico de Mensalidades</CardTitle>
            <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-600">
              <Link href={`/crossfit/${aluno.id}/pagamentos/novo`}>
                <DollarSign className="mr-2 h-4 w-4" />
                Gerar Mensalidade Manual
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {mensalidades.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma mensalidade registrada ainda para este aluno.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mensalidades.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{format(new Date(m.dataVencimento), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      {m.dataPagamento
                        ? format(new Date(m.dataPagamento), "dd/MM/yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      R$ {m.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{m.metodoPagamento || "-"}</TableCell>
                    <TableCell>{getStatusBadge(m.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* Botão Excluir - só para pendente */}
                          {m.status === "pendente" && (
                            <DropdownMenuItem 
                              className="text-red-600 hover:text-red-700 cursor-pointer"
                              onClick={() => handleDeleteClick(m.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* AlertDialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
              disabled={deletarPagamentoMutation.isPending}
            >
              {deletarPagamentoMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VerPagamentosCrossFitPage;