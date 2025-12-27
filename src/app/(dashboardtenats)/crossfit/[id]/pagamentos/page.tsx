// src/app/(dashboard)/crossfit/[id]/pagamentos/page.tsx
"use client";

import { useParams } from "next/navigation";
import { format } from "date-fns";
import { DollarSign, Calendar, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import Link from "next/link";

interface Pagamento {
  id: string;
  dataVencimento: Date;
  dataPagamento: Date | null;
  valor: number;
  status: "Pago" | "Atrasado" | "Pendente";
  metodo: "PIX" | "Cartão" | "Boleto";
}

interface Cliente {
  id: string;
  nome: string;
  plano: string;
  valorMensal: number;
}

// Mock (em produção vem do Supabase)
const clientesMock: Record<string, Cliente> = {
  "1": {
    id: "1",
    nome: "Carlos Silva",
    plano: "Mensal",
    valorMensal: 149,
  },
};

const pagamentosMock: Record<string, Pagamento[]> = {
  "1": [
    { id: "p1", dataVencimento: new Date(2025, 11, 10), dataPagamento: new Date(2025, 11, 10), valor: 149, status: "Pago", metodo: "PIX" },
    { id: "p2", dataVencimento: new Date(2025, 10, 10), dataPagamento: new Date(2025, 10, 8), valor: 149, status: "Pago", metodo: "Cartão" },
    { id: "p3", dataVencimento: new Date(2025, 9, 10), dataPagamento: null, valor: 149, status: "Atrasado", metodo: "PIX" },
    { id: "p4", dataVencimento: new Date(2025, 8, 10), dataPagamento: new Date(2025, 8, 12), valor: 149, status: "Pago", metodo: "PIX" },
  ],
};

const VerPagamentosCrossFitPage = () => {
  const { id } = useParams();
  const clienteId = id as string;
  const cliente = clientesMock[clienteId];
  const pagamentos = pagamentosMock[clienteId] || [];

  if (!cliente) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Cliente não encontrado</h1>
        <Button asChild className="mt-4">
          <Link href="/crossfit">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  const totalPago = pagamentos
    .filter(p => p.status === "Pago")
    .reduce((acc, p) => acc + p.valor, 0);

  const totalAtrasado = pagamentos
    .filter(p => p.status === "Atrasado" || p.status === "Pendente")
    .reduce((acc, p) => acc + p.valor, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pago":
        return <Badge className="bg-green-600"><CheckCircle className="mr-1 h-3 w-3" /> Pago</Badge>;
      case "Atrasado":
        return <Badge className="bg-red-600"><AlertCircle className="mr-1 h-3 w-3" /> Atrasado</Badge>;
      case "Pendente":
        return <Badge className="bg-orange-600"><Calendar className="mr-1 h-3 w-3" /> Pendente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Cabeçalho com voltar */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/crossfit">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Pagamentos - {cliente.nome}</h1>
          <p className="text-gray-600">Histórico completo de pagamentos do cliente CrossFit</p>
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
              R$ {totalPago.toLocaleString("pt-BR")}
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
              <DollarSign className="h-5 w-5 text-blue-600" />
              Valor Mensal Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              R$ {cliente.valorMensal.toLocaleString("pt-BR")}
            </div>
            <p className="text-sm text-gray-600 mt-1">Plano: {cliente.plano}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
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
              {pagamentos.map((pagamento) => (
                <TableRow key={pagamento.id}>
                  <TableCell>{format(pagamento.dataVencimento, "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    {pagamento.dataPagamento 
                      ? format(pagamento.dataPagamento, "dd/MM/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell className="font-medium">
                    R$ {pagamento.valor.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>{pagamento.metodo}</TableCell>
                  <TableCell>{getStatusBadge(pagamento.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerPagamentosCrossFitPage;