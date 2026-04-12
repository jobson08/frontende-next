// src/app/(dashboard)/inadimplentes/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { ArrowLeft, Phone, Mail, Send, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import api from "@/src/lib/api";

interface Inadimplente {
  id: string;
  aluno: string;
  responsavel: string;
  telefone: string;
  email: string;
  valorDevido: number;
  mesesAtraso: number;
  ultimaMensalidade: string;
  alunoId: string;
  modalidade: "futebol" | "crossfit";   // Adicionado
}

const InadimplentesPage = () => {
  const [mesSelecionado, setMesSelecionado] = useState("2025-12");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ["inadimplentes", mesSelecionado],
    queryFn: async () => {
      const res = await api.get("/tenant/inadimplentes", {
        params: { mes: mesSelecionado },
      });
      return res.data;
    },
    enabled: !!mesSelecionado,
  });

  const inadimplentes: Inadimplente[] = response?.data || [];
  const totalDevido = response?.totalDevido || 0;

  // Paginação
  const totalPaginas = Math.ceil(inadimplentes.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const inadimplentesPaginados = inadimplentes.slice(inicio, inicio + itensPorPagina);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-600">Carregando inadimplentes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar</h2>
          <p className="text-gray-600 mb-6">Não foi possível carregar a lista de inadimplentes.</p>
          <Button onClick={() => refetch()}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 md:space-y-8 min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button variant="outline" asChild>
          <Link href="/financeiro" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Financeiro
          </Link>
        </Button>

        <div className="text-center flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Inadimplentes</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Mensalidades pendentes — <span className="font-semibold text-orange-600">{mesSelecionado}</span>
          </p>
        </div>

        <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
          <SelectTrigger className="w-full sm:w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => {
              const year = 2025;
              const month = String(12 - i).padStart(2, '0');
              return { value: `${year}-${month}`, label: `${month}/${year}` };
            }).map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Total Devido</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">R$ {totalDevido.toLocaleString("pt-BR")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Inadimplentes</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{inadimplentes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Média por Devedor</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              R$ {inadimplentes.length > 0 ? Math.round(totalDevido / inadimplentes.length).toLocaleString("pt-BR") : "0"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Inadimplentes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Inadimplentes</CardTitle>
          <CardDescription>
            Mostrando {inadimplentesPaginados.length} de {inadimplentes.length} registros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Modalidade</TableHead>
                  <TableHead className="hidden md:table-cell">Responsável</TableHead>
                  <TableHead className="hidden md:table-cell">Valor Devido</TableHead>
                  <TableHead className="hidden md:table-cell">Atraso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inadimplentesPaginados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      Nenhum inadimplente encontrado neste mês.
                    </TableCell>
                  </TableRow>
                ) : (
                  inadimplentesPaginados.map((devedor) => (
                    <TableRow key={devedor.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-red-600 text-white text-sm">
                              {devedor.aluno.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">{devedor.aluno}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            devedor.modalidade === "futebol"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }
                        >
                          {devedor.modalidade === "futebol" ? "⚽" : "🏋️"}
                        </Badge>
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-gray-600">
                        {devedor.responsavel}
                      </TableCell>

                      <TableCell className="hidden md:table-cell font-medium text-red-600">
                        R$ {devedor.valorDevido.toLocaleString("pt-BR")}
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary">
                          {devedor.mesesAtraso} {devedor.mesesAtraso === 1 ? "mês" : "meses"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button size="sm" className="bg-orange-600 hover:bg-orange-700 h-8 px-4 text-xs">
                            Cobrar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaAtual === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <span className="text-sm text-gray-600">
                Página {paginaAtual} de {totalPaginas}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
                disabled={paginaAtual === totalPaginas}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InadimplentesPage;