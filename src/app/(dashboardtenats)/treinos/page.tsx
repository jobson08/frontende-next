// src/app/(dashboard)/treinos/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Search, Plus, Calendar, Users} from "lucide-react";
import Link from "next/link";


interface Treino {
  id: string;
  nome: string;
  categoria: string;
  diaSemana: string;
  hora: string;
  treinador: string;
  alunosInscritos: number;
  alunosMax: number;
  status: "AGENDADO" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";
}

const treinosMock: Treino[] = [
  {
    id: "1",
    nome: "Técnica Individual Sub-11",
    categoria: "Sub-11",
    diaSemana: "Segunda",
    hora: "18:00",
    treinador: "Rafael Lima",
    alunosInscritos: 16,
    alunosMax: 20,
    status: "AGENDADO",
  },
  {
    id: "2",
    nome: "Jogo Coletivo Sub-13",
    categoria: "Sub-13",
    diaSemana: "Terça",
    hora: "17:30",
    treinador: "Mariana Costa",
    alunosInscritos: 18,
    alunosMax: 20,
    status: "AGENDADO",
  },
  {
    id: "3",
    nome: "Preparação Física Sub-15",
    categoria: "Sub-15",
    diaSemana: "Quarta",
    hora: "19:00",
    treinador: "Carlos Souza",
    alunosInscritos: 14,
    alunosMax: 15,
    status: "EM_ANDAMENTO",
  },
  {
    id: "4",
    nome: "Finalização Avançada",
    categoria: "Sub-17",
    diaSemana: "Quinta",
    hora: "18:30",
    treinador: "Rafael Lima",
    alunosInscritos: 12,
    alunosMax: 15,
    status: "AGENDADO",
  },
  {
    id: "5",
    nome: "Treino Livre Infantil",
    categoria: "Sub-9",
    diaSemana: "Sábado",
    hora: "09:00",
    treinador: "Beatriz Oliveira",
    alunosInscritos: 20,
    alunosMax: 20,
    status: "CONCLUIDO",
  },
];
const TreinosPage = () => {//Inicio da função

  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("TODAS");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");

  const filtered = treinosMock.filter(t => {
    const matchesSearch = t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.treinador.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = filtroCategoria === "TODAS" || t.categoria === filtroCategoria;
    const matchesStatus = filtroStatus === "TODOS" || t.status === filtroStatus;
    return matchesSearch && matchesCategoria && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AGENDADO": return "bg-blue-600";
      case "EM_ANDAMENTO": return "bg-green-600";
      case "CONCLUIDO": return "bg-gray-600";
      case "CANCELADO": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };
    return ( 
        <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Treinos</h1>
          <p className="text-gray-600">Gerencie todos os treinos da escolinha</p>
        </div>
        <Button asChild className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
          <Link href="/treinos/novo">
            <Plus className="mr-2 h-5 w-5" />
            Novo Treino
          </Link>
        </Button>
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

      {/* Lista de Treinos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((treino) => (
          <Card key={treino.id} className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{treino.nome}</CardTitle>
                <Badge className={getStatusColor(treino.status)}>
                  {treino.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">{treino.categoria}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{treino.diaSemana} - {treino.hora}</span>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-linear-to-br from-orange-600 to-red-600 text-white">
                    {treino.treinador.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{treino.treinador}</p>
                  <p className="text-xs text-gray-600">Treinador</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span>{treino.alunosInscritos}/{treino.alunosMax} alunos</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">
                    {Math.round((treino.alunosInscritos / treino.alunosMax) * 100)}% lotado
                  </p>
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/treinos/${treino.id}`}>
                    Ver detalhes
                  </Link>
                </Button>
                <Button size="sm" variant="outline">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
     );
}
 
export default TreinosPage;