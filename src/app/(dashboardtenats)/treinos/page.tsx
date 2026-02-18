/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Search, Plus, Calendar, Users, Edit, Loader2, AlertCircle, LayoutGrid, Table as TableIcon } from "lucide-react";
import Link from "next/link";
import { Pagination } from "@/src/components/common/Pagination";

// Interface baseada no model Prisma Treino
interface Treino {
  id: string;
  nome: string;
  categoria: string;
  data: string; // já vem como "2026-02-20"
  horaInicio: string;
  horaFim: string;
  funcionarioTreinador: {
    nome: string;
  } | null;
  local: string;
  descricao?: string | null;
}

// Formatação de data (sem fuso)
const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "AGENDADO": return "bg-blue-600";
    case "EM_ANDAMENTO": return "bg-green-600";
    case "CONCLUIDO": return "bg-gray-600";
    case "CANCELADO": return "bg-red-600";
    default: return "bg-gray-600";
  }
};

const TreinosPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("TODAS");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [viewMode, setViewMode] = useState<"cards" | "table">(() => {
    const saved = localStorage.getItem("treinosViewMode");
    return (saved === "cards" || saved === "table") ? saved : "cards";
  });
    //Formata data
    const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

  // Estados de paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

  // Busca real de treinos
  const { 
    data: treinos = [], 
    isLoading, 
    error 
  } = useQuery<Treino[]>({
    queryKey: ["treinos-futebol"],
    queryFn: async () => {
      const res = await api.get("/tenant/treinos-futebol");
      return res.data.data || [];
    },
  });

  // Salva preferência de visualização
  useEffect(() => {
    localStorage.setItem("treinosViewMode", viewMode);
  }, [viewMode]);

  // Filtro local
  const filtered = treinos.filter(t => {
    const matchesSearch = t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.funcionarioTreinador?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategoria = filtroCategoria === "TODAS" || t.categoria === filtroCategoria;
    
    // Status calculado (exemplo - ajuste conforme sua lógica)
    const hoje = new Date();
    const dataTreino = new Date(t.data);
    const status = dataTreino < hoje ? "CONCLUIDO" : "AGENDADO";
    
    const matchesStatus = filtroStatus === "TODOS" || status === filtroStatus;
    
    return matchesSearch && matchesCategoria && matchesStatus;
  });

  // Paginação
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <span className="ml-4 text-xl">Carregando treinos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Erro ao carregar treinos</h2>
        <p className="mt-2">{(error as Error).message || "Tente novamente mais tarde"}</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Treinos</h1>
          <p className="text-gray-600">Gerencie todos os treinos da escolinha</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === "cards" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setViewMode("cards")}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            Cards
          </Button>
          <Button 
            variant={viewMode === "table" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="mr-2 h-4 w-4" />
            Tabela
          </Button>
          <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Link href="/treinos/novo">
              <Plus className="mr-2 h-5 w-5" />
              Novo Treino
            </Link>
          </Button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar treino ou treinador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11"
          />
        </div>

        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAS">Todas as categorias</SelectItem>
            <SelectItem value="Sub-9">Sub-9</SelectItem>
            <SelectItem value="Sub-11">Sub-11</SelectItem>
            <SelectItem value="Sub-13">Sub-13</SelectItem>
            <SelectItem value="Sub-15">Sub-15</SelectItem>
            <SelectItem value="Sub-17">Sub-17</SelectItem>
            <SelectItem value="Adulto">Adulto</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos os status</SelectItem>
            <SelectItem value="AGENDADO">Agendado</SelectItem>
            <SelectItem value="EM_ANDAMENTO">Em andamento</SelectItem>
            <SelectItem value="CONCLUIDO">Concluído</SelectItem>
            <SelectItem value="CANCELADO">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conteúdo card tabela 
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nenhum treino encontrado com os filtros aplicados
        </div>
        
      ) : (*/}
  {/* Conteúdo principal: Cards ou Tabela */}
      {viewMode === "cards" ? (
      <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paginatedItems.map((treino) => {
                const status = new Date(treino.data) < new Date() ? "CONCLUIDO" : "AGENDADO";

                return (
                  <Card key={treino.id} className="hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(status)}>
                          {status}
                        </Badge>
                      </div>
                      <div >
                        <CardTitle className="text-xl">{treino.nome}</CardTitle>
                        </div>
                          <p className="text-sm text-gray-600 mt-1">{treino.categoria}</p>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-orange-600 to-red-600 text-white">
                            {treino.funcionarioTreinador?.nome?.split(" ").map(n => n[0]).join("") || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs text-gray-600">Treinador</p>
                          <p className="font-medium">{treino.funcionarioTreinador?.nome || "—"}</p>
                        </div>
                      </div>
                        </CardHeader>

                        <CardContent className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">
                          {formatDate(treino.data)}
                        </span> 
                        <span>
                            {treino.horaInicio} às {treino.horaFim}
                        </span>
                      </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-gray-500" />
                          <span>0/0 alunos</span> {/* Adicione contagem real depois */}
                        </div>
                        <div className="flex items-center gap-2 text-right">
                          <p className="text-sm font-medium text-green-600">
                            Local: {treino.local}
                          </p>
                        </div>

                      <div className="pt-4 flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/treinos/${treino.id}`}>
                            Ver detalhes
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
        <CardContent className="p-0 md:p-6">
          {/* Tabela em desktop */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Treinador</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((treino) => {
                  const status = new Date(treino.data) < new Date() ? "CONCLUIDO" : "AGENDADO";

                  return (
                    <TableRow key={treino.id}>
                      <TableCell className="font-medium">{treino.nome}</TableCell>
                      <TableCell>{treino.categoria}</TableCell>
                      <TableCell>{formatDate(treino.data)}</TableCell>
                      <TableCell>{treino.horaInicio} - {treino.horaFim}</TableCell>
                      <TableCell>{treino.funcionarioTreinador?.nome || "—"}</TableCell>
                      <TableCell>{treino.local}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(status)}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/treinos/${treino.id}`}>
                              Ver detalhes
                            </Link>
                          </Button>
                          {/* Botão editar opcional */}
                          <Button size="sm" variant="outline" asChild>
                        {/*
                            <Link href={`/treinos/${treino.id}/editar`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                        */}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Cards verticais em mobile */}
          <div className="md:hidden space-y-4">
            {paginatedItems.map((treino) => {
              const status = new Date(treino.data) < new Date() ? "CONCLUIDO" : "AGENDADO";

              return (
                <Card key={treino.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{treino.nome}</CardTitle>
                        <p className="text-sm text-muted-foreground">{treino.categoria}</p>
                      </div>
                      <Badge className={getStatusColor(status)}>
                        {status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(treino.data)} - {treino.horaInicio} às {treino.horaFim}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{treino.funcionarioTreinador?.nome || "—"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Local:</span>
                      <span>{treino.local}</span>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/treinos/${treino.id}`}>
                          Ver detalhes
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        {/*
                        <Link href={`/treinos/${treino.id}/editar`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                        */}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
      )}
    </div>
  );
};

export default TreinosPage;