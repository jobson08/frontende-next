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
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
import Link from "next/link";
import api from "@/src/lib/api";

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

  // Busca aluno + mensalidades
  const { data: aluno, isLoading, error } = useQuery<AlunoCrossfit>({
    queryKey: ["aluno-crossfit-pagamentos", alunoId],
    queryFn: async () => {
      const res = await api.get(`/tenant/alunos-crossfit/${alunoId}`);
      return res.data.data;
    },
    enabled: !!alunoId,
  });

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
            <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-600">
            <Link href={`/crossfit/${aluno.id}/pagamentos/novo`}>
              <DollarSign className="mr-2 h-4 w-4" />
              Gerar Mensalidade Manual
            </Link>
          </Button>
          </div>
          <CardTitle>Histórico de Mensalidades</CardTitle>
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

export default VerPagamentosCrossFitPage;