/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Search, Plus, Calendar, Users, Repeat } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Pagination } from "@/src/components/common/Pagination";

// Interfaces
interface Treino {
  id: string;
  nome: string;
  categoria: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  funcionarioTreinador: { nome: string } | null;
  local: string;
}

interface TreinoRecorrente {
  id: string;
  nome: string;
  categoria: string;
  diasSemana: number[];
  horaInicio: string;
  horaFim: string;
  local: string;
  funcionarioTreinador: { nome: string };
  ativo: boolean;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const TreinosPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("TODAS");
  const [activeTab, setActiveTab] = useState<"porData" | "recorrentes">("porData");

  // Paginação separada por aba
  const [currentPagePorData, setCurrentPagePorData] = useState(1);
  const [currentPageRecorrentes, setCurrentPageRecorrentes] = useState(1);
  const itemsPerPage = 9;

  // Busca Treinos por Data
  const { data: treinosPorData = [], isLoading: loadingPorData } = useQuery<Treino[]>({
    queryKey: ["treinos-futebol"],
    queryFn: async () => {
      const res = await api.get("/tenant/treinos-futebol");
      return res.data.data || [];
    },
  });

  // Busca Treinos Recorrentes
  const { data: treinosRecorrentes = [], isLoading: loadingRecorrentes } = useQuery<TreinoRecorrente[]>({
    queryKey: ["treinos-recorrentes"],
    queryFn: async () => {
      const res = await api.get("/tenant/treinos-recorrentes");
      return res.data.data || [];
    },
  });

  const isLoading = loadingPorData || loadingRecorrentes;

  // Filtros
  const filteredPorData = treinosPorData.filter(t => {
    const matchesSearch = t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.funcionarioTreinador?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = filtroCategoria === "TODAS" || t.categoria === filtroCategoria;
    return matchesSearch && matchesCategoria;
  });

  const filteredRecorrentes = treinosRecorrentes.filter(t =>
    t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginação
  const totalPagesPorData = Math.ceil(filteredPorData.length / itemsPerPage);
  const totalPagesRecorrentes = Math.ceil(filteredRecorrentes.length / itemsPerPage);

  const paginatedPorData = filteredPorData.slice(
    (currentPagePorData - 1) * itemsPerPage,
    currentPagePorData * itemsPerPage
  );

  const paginatedRecorrentes = filteredRecorrentes.slice(
    (currentPageRecorrentes - 1) * itemsPerPage,
    currentPageRecorrentes * itemsPerPage
  );

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Treinos</h1>
          <p className="text-gray-600">Gerencie todos os treinos da escolinha</p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/treinos/novo">
              <Plus className="mr-2 h-5 w-5" />
              Novo Treino
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/treinos/novo-recorrente">
              <Repeat className="mr-2 h-5 w-5" />
              Novo Recorrente
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "porData" | "recorrentes")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="porData">Treinos por Data</TabsTrigger>
          <TabsTrigger value="recorrentes">Treinos Recorrentes</TabsTrigger>
        </TabsList>

        {/* ==================== ABA: TREINOS POR DATA ==================== */}
        <TabsContent value="porData">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar treino ou treinador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11"
              />
            </div>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-48">
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
          </div>

          {filteredPorData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhum treino encontrado.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paginatedPorData.map((treino) => (
                <Card key={treino.id} className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between">
                      <Badge>{treino.categoria}</Badge>
                      <span className="text-sm text-gray-500">{formatDate(treino.data)}</span>
                    </div>
                    <CardTitle className="text-xl">{treino.nome}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4" />
                      {treino.horaInicio} - {treino.horaFim}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="h-4 w-4" />
                      {treino.funcionarioTreinador?.nome || "—"}
                    </div>
                    <div className="text-sm font-medium">Local: {treino.local}</div>

                    <div className="pt-4 flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/treinos/${treino.id}`}>
                          Ver detalhes
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Paginação - Por Data */}
          <Pagination
            currentPage={currentPagePorData}
            totalItems={filteredPorData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPagePorData}
            onItemsPerPageChange={(value) => {
              console.log("Itens por página alterado:", value);
              // Aqui você pode adicionar lógica se quiser mudar o tamanho
            }}
            className="mt-6"
          />
        </TabsContent>

        {/* ==================== ABA: TREINOS RECORRENTES ==================== */}
        <TabsContent value="recorrentes">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar treino recorrente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11"
              />
            </div>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-48">
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
          </div>

          {filteredRecorrentes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhum treino recorrente encontrado.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paginatedRecorrentes.map((treino) => (
                <Card key={treino.id} className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <Badge className="w-fit">{treino.categoria}</Badge>
                    <CardTitle className="text-xl">{treino.nome}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <strong>Dias:</strong>{" "}
                      {treino.diasSemana.map((d: number) =>
                        ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d]
                      ).join(", ")}
                    </div>
                    <div className="text-sm">
                      <strong>Horário:</strong> {treino.horaInicio} - {treino.horaFim}
                    </div>
                    <div className="text-sm">
                      <strong>Local:</strong> {treino.local}
                    </div>
                    <div className="text-sm">
                      <strong>Treinador:</strong> {treino.funcionarioTreinador.nome}
                    </div>

                    <div className="pt-4 flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/treinos/recorrentes/${treino.id}`}>
                          Ver detalhes
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Paginação - Recorrentes */}
          <Pagination
            currentPage={currentPageRecorrentes}
            totalItems={filteredRecorrentes.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPageRecorrentes}
            onItemsPerPageChange={(value) => {
              console.log("Itens por página alterado:", value);
            }}
            className="mt-6"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TreinosPage;