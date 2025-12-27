// src/app/dashboarduser/crossfit-dashboard/pagamentos/page.tsx
"use client";

import { format } from "date-fns";
import { DollarSign, Calendar, CheckCircle, AlertCircle, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";

interface Pagamento {
  id: string;
  dataVencimento: Date;
  dataPagamento: Date | null;
  valor: number;
  status: "Pago" | "Atrasado" | "Pendente";
  metodo: "PIX" | "Cartão" | "Boleto";
}

const PagamentosCrossFitPage = () => {
  // Dados do cliente (em produção vem do auth/Supabase)
  const cliente = {
    nome: "Carlos Silva",
    plano: "Mensal",
    valorMensal: 149,
    proximoVencimento: new Date(2026, 0, 10), // 10 de janeiro de 2026
    statusAtual: "Em Dia" as const,
  };

  // Histórico de pagamentos (mock)
  const pagamentos: Pagamento[] = [
    { id: "1", dataVencimento: new Date(2025, 11, 10), dataPagamento: new Date(2025, 11, 10), valor: 149, status: "Pago", metodo: "PIX" },
    { id: "2", dataVencimento: new Date(2025, 10, 10), dataPagamento: new Date(2025, 10, 8), valor: 149, status: "Pago", metodo: "Cartão" },
    { id: "3", dataVencimento: new Date(2025, 9, 10), dataPagamento: new Date(2025, 9, 12), valor: 149, status: "Pago", metodo: "PIX" },
    { id: "4", dataVencimento: new Date(2025, 8, 10), dataPagamento: new Date(2025, 8, 9), valor: 149, status: "Pago", metodo: "PIX" },
    { id: "5", dataVencimento: new Date(2025, 7, 10), dataPagamento: new Date(2025, 7, 11), valor: 149, status: "Pago", metodo: "Cartão" },
  ];

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
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <DollarSign className="h-10 w-10 text-green-600" />
          Meus Pagamentos
        </h1>
        <p className="text-gray-600 text-lg mt-2">Acompanhe o histórico e status da sua mensalidade CrossFit</p>
      </div>

      {/* Card de Status Atual */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Status Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="text-lg px-4 py-2 bg-green-600">
              <CheckCircle className="mr-2 h-5 w-5" />
              {cliente.statusAtual}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Plano Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{cliente.plano}</div>
            <p className="text-sm text-gray-600 mt-1">R$ {cliente.valorMensal}/mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Próximo Vencimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {format(cliente.proximoVencimento, "dd 'de' MMMM yyyy")}
            </div>
            <p className="text-sm text-gray-600 mt-1">R$ {cliente.valorMensal}</p>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Pagamentos */}
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

export default PagamentosCrossFitPage;