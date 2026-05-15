/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Input } from "@/src/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { ArrowLeft, Phone, Mail, AlertTriangle, ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import Link from "next/link";
import api from "@/src/lib/api";
import { Pagination } from "@/src/components/common/Pagination";

// ==================== FUNÇÃO DE FORMATAÇÃO DE REAL ====================
const formatarReal = (valor: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
};

interface Inadimplente {
  id: string;
  aluno: string;
  alunoId: string;
  responsavel: string;
  telefone: string;
  email: string;
  valorDevido: number;
  mesesAtraso: number;
  ultimaMensalidade: string;
  modalidade: "futebol" | "crossfit";
  fotoUrl: string | null;
}

const InadimplentesPage = () => {
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear().toString());
  const [searchTerm, setSearchTerm] = useState("");

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ["inadimplentes", anoSelecionado],
    queryFn: async () => {
      const res = await api.get("/tenant/inadimplentes", {
        params: { ano: anoSelecionado },
      });
      return res.data;
    },
    enabled: !!anoSelecionado,
  });

  const inadimplentes: Inadimplente[] = response?.data || [];
  const totalDevido = response?.totalDevido || 0;

  // Filtro de busca
  const filteredInadimplentes = inadimplentes.filter((item) =>
    item.aluno.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginação
  const totalItems = filteredInadimplentes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredInadimplentes.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

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
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold">Inadimplentes</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Mensalidades pendentes — <span className="font-semibold text-orange-600">{anoSelecionado}</span>
          </p>
        </div>

        <Select value={anoSelecionado} onValueChange={setAnoSelecionado}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Devido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatarReal(totalDevido)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Inadimplentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{inadimplentes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Média por Devedor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {inadimplentes.length > 0 
                ? formatarReal(Math.round(totalDevido / inadimplentes.length)) 
                : "R$ 0,00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Inadimplentes com Busca e Paginação */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Lista de Inadimplentes</CardTitle>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por aluno ou responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <CardDescription>
            Mostrando {paginatedItems.length} de {filteredInadimplentes.length} registros
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
                {paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      Nenhum inadimplente encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((devedor) => (
                    <TableRow key={devedor.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={devedor.fotoUrl || undefined} />
                            <AvatarFallback className="bg-red-600 text-white text-sm">
                              {devedor.aluno.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <Link href={`/aluno/${devedor.alunoId}`} className="hover:underline">
                            {devedor.aluno}
                          </Link>
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
                          {devedor.modalidade === "futebol" ? "⚽ Futebol" : "🏋️ CrossFit"}
                        </Badge>
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-gray-600">
                        {devedor.responsavel}
                      </TableCell>

                      <TableCell className="hidden md:table-cell font-medium text-red-600">
                        {formatarReal(devedor.valorDevido)}
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-white">
                        <Badge variant="destructive">
                          {devedor.mesesAtraso} {devedor.mesesAtraso === 1 ? "mês" : "meses"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/aluno/${devedor.alunoId}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Mail className="h-4 w-4" />
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
    </div>
  );
};

export default InadimplentesPage;