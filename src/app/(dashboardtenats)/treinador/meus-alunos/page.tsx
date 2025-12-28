// src/app/(dashboard)/treinador/meus-alunos/page.tsx
"use client";

import { useState } from "react";
import { Search, Star, TrendingUp, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import Link from "next/link";

interface Aluno {
  id: string;
  nome: string;
  categoria: string;
  idade: number;
  mediaAvaliacao: number;
  frequenciaMes: number;
  avaliadoEsseMes: boolean;
}

const MeusAlunosPage = () => {
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");

  const alunos: Aluno[] = [
    { id: "1", nome: "Enzo Gabriel", categoria: "Sub-11", idade: 10, mediaAvaliacao: 8.4, frequenciaMes: 92, avaliadoEsseMes: true },
    { id: "2", nome: "Pedro Silva", categoria: "Sub-11", idade: 11, mediaAvaliacao: 9.1, frequenciaMes: 96, avaliadoEsseMes: true },
    { id: "3", nome: "Lucas Oliveira", categoria: "Sub-13", idade: 12, mediaAvaliacao: 7.8, frequenciaMes: 88, avaliadoEsseMes: false },
    { id: "4", nome: "Maria Luiza", categoria: "Sub-11", idade: 10, mediaAvaliacao: 8.7, frequenciaMes: 100, avaliadoEsseMes: true },
    { id: "5", nome: "João Victor", categoria: "Sub-15", idade: 14, mediaAvaliacao: 8.2, frequenciaMes: 85, avaliadoEsseMes: false },
    { id: "6", nome: "Sophia Costa", categoria: "Sub-13", idade: 13, mediaAvaliacao: 9.3, frequenciaMes: 94, avaliadoEsseMes: true },
    { id: "7", nome: "Gabriel Santos", categoria: "Sub-15", idade: 15, mediaAvaliacao: 7.5, frequenciaMes: 80, avaliadoEsseMes: false },
    { id: "8", nome: "Isabella Pereira", categoria: "Sub-11", idade: 11, mediaAvaliacao: 8.9, frequenciaMes: 98, avaliadoEsseMes: true },
  ];

  const categoriasUnicas = ["Todas", ...Array.from(new Set(alunos.map(a => a.categoria)))];

  const alunosFiltrados = alunos.filter(aluno => {
    const matchesBusca = aluno.nome.toLowerCase().includes(busca.toLowerCase());
    const matchesCategoria = categoriaFiltro === "Todas" || aluno.categoria === categoriaFiltro;
    return matchesBusca && matchesCategoria;
  });

  const totalAlunos = alunos.length;
  const mediaGeralTurma = (alunos.reduce((acc, a) => acc + a.mediaAvaliacao, 0) / totalAlunos).toFixed(1);
  const frequenciaMediaTurma = Math.round(alunos.reduce((acc, a) => acc + a.frequenciaMes, 0) / totalAlunos);
  const alunosParaAvaliar = alunos.filter(a => !a.avaliadoEsseMes).length;

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-4">
          <Users className="h-12 w-12 text-blue-600" />
          Meus Alunos
        </h1>
        <p className="text-gray-600 text-lg mt-2">Acompanhe o desenvolvimento da sua turma</p>
      </div>

      {/* Resumo Geral da Turma */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAlunos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Média Geral da Turma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{mediaGeralTurma}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Frequência Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{frequenciaMediaTurma}%</div>
          </CardContent>
        </Card>

        <Card className={alunosParaAvaliar > 0 ? "border-orange-400 bg-orange-50" : "bg-green-50"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Para Avaliar Esse Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{alunosParaAvaliar}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar aluno por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-11 h-12"
          />
        </div>

        <select 
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="h-12 px-4 border border-gray-300 rounded-lg bg-white"
        >
          {categoriasUnicas.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Lista de Alunos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {alunosFiltrados.map((aluno) => (
          <Card 
            key={aluno.id} 
            className={`hover:shadow-xl transition-all ${!aluno.avaliadoEsseMes ? "ring-2 ring-orange-400" : ""}`}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-4 ring-white shadow-lg">
                  <AvatarFallback className="text-2xl font-bold bg-linear-to-br from-purple-600 to-blue-600 text-white">
                    {aluno.nome.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">{aluno.nome}</CardTitle>
                  <p className="text-gray-600">{aluno.categoria} • {aluno.idade} anos</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">Média</span>
                </div>
                <Badge className="text-lg px-4 py-1 bg-yellow-100 text-yellow-800">
                  {aluno.mediaAvaliacao.toFixed(1)}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Frequência</span>
                </div>
                <Badge className={`text-lg px-4 py-1 ${aluno.frequenciaMes >= 90 ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}>
                  {aluno.frequenciaMes}%
                </Badge>
              </div>

              {!aluno.avaliadoEsseMes && (
                <div className="pt-4 border-t border-orange-200">
                  <p className="text-sm text-orange-700 font-medium mb-3">
                    Ainda não avaliado esse mês
                  </p>
                </div>
              )}

              <Button asChild className="w-full" variant={aluno.avaliadoEsseMes ? "outline" : "default"}>
                <Link href={`/treinador/avaliar-aluno/${aluno.id}`}>
                  <Star className="mr-2 h-5 w-5" />
                  {aluno.avaliadoEsseMes ? "Ver Avaliações" : "Avaliar Agora"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MeusAlunosPage;