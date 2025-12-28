// src/app/(dashboard)/treinador/marcar-presenca/page.tsx (versão melhorada)
"use client";

import { useState } from "react";
import { Search, Users, CheckCircle, Calendar, Save, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { toast } from "sonner";

interface Aluno {
  id: string;
  nome: string;
  categoria: string;
  presente: boolean;
}

const MarcarPresencaPage = () => {
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");

  const [alunos, setAlunos] = useState<Aluno[]>([
    { id: "1", nome: "Enzo Gabriel", categoria: "Sub-11", presente: true },
    { id: "2", nome: "Pedro Silva", categoria: "Sub-11", presente: true },
    { id: "3", nome: "Lucas Oliveira", categoria: "Sub-11", presente: false },
    { id: "4", nome: "Maria Luiza", categoria: "Sub-11", presente: true },
    { id: "5", nome: "João Victor", categoria: "Sub-13", presente: false },
    { id: "6", nome: "Sophia Costa", categoria: "Sub-13", presente: true },
    { id: "7", nome: "Gabriel Santos", categoria: "Sub-15", presente: true },
    { id: "8", nome: "Isabella Pereira", categoria: "Sub-15", presente: false },
    { id: "9", nome: "Miguel Almeida", categoria: "Sub-11", presente: true },
    { id: "10", nome: "Valentina Rocha", categoria: "Sub-13", presente: false },
  ]);

  const treinoAtual = {
    nome: "Finalização Avançada",
    categoria: "Sub-15",
    data: "27/12/2025",
    hora: "18:30",
    local: "Campo 1",
  };

  const presentes = alunos.filter(a => a.presente).length;
  const total = alunos.length;
  const ausentes = total - presentes;

  const categoriasUnicas = ["Todas", ...Array.from(new Set(alunos.map(a => a.categoria)))];

  const alunosFiltrados = alunos.filter(aluno => {
    const matchesBusca = aluno.nome.toLowerCase().includes(busca.toLowerCase());
    const matchesCategoria = categoriaFiltro === "Todas" || aluno.categoria === categoriaFiltro;
    return matchesBusca && matchesCategoria;
  });

  const togglePresenca = (id: string) => {
    setAlunos(alunos.map(a => 
      a.id === id ? { ...a, presente: !a.presente } : a
    ));
  };

  const marcarTodosPresentes = () => {
    setAlunos(alunos.map(a => ({ ...a, presente: true })));
    toast.success("Todos marcados como presentes!");
  };

  const salvarPresenca = () => {
    toast.success("Presença salva com sucesso!", {
      description: (
        <div className="flex items-center gap-4">
          <div className="text-green-600 font-medium">{presentes} presentes</div>
          <div className="text-orange-600 font-medium">{ausentes} ausentes</div>
        </div>
      ),
      duration: 5000,
    });
  };

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho do Treino */}
      <div className="text-center lg:text-left">
        <h1 className="text-4xl font-bold flex items-center justify-center lg:justify-start gap-3">
          <Calendar className="h-10 w-10 text-blue-600" />
          Marcar Presença
        </h1>
        <div className="mt-6 space-y-2 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <p className="text-2xl font-bold text-blue-900">{treinoAtual.nome}</p>
          <p className="text-lg text-blue-700">
            {treinoAtual.data} • {treinoAtual.hora} • {treinoAtual.local}
          </p>
          <p className="text-blue-600 font-medium">{treinoAtual.categoria}</p>
        </div>
      </div>

      {/* Contador Grande */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="text-center bg-linear-to-br from-gray-50 to-gray-100">
          <CardContent className="pt-6">
            <Users className="h-12 w-12 mx-auto text-gray-600 mb-2" />
            <div className="text-4xl font-bold">{total}</div>
            <p className="text-gray-600">Total de Alunos</p>
          </CardContent>
        </Card>

        <Card className="text-center bg-linear-to-br from-green-50 to-green-100 border-green-300">
          <CardContent className="pt-6">
            <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-2" />
            <div className="text-4xl font-bold text-green-600">{presentes}</div>
            <p className="text-green-700">Presentes</p>
          </CardContent>
        </Card>

        <Card className="text-center bg-linear-to-br from-orange-50 to-orange-100 border-orange-300">
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-orange-600">{ausentes}</div>
            <p className="text-orange-700">Ausentes</p>
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

        <Button onClick={marcarTodosPresentes} variant="outline" className="h-12">
          <UserCheck className="mr-2 h-5 w-5" />
          Marcar Todos Presentes
        </Button>
      </div>

      {/* Lista de Alunos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Alunos do Treino</span>
            <span className="text-sm font-normal text-gray-600">
              {alunosFiltrados.length} de {total} exibidos
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alunosFiltrados.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum aluno encontrado</p>
            ) : (
              alunosFiltrados.map((aluno) => (
                <div 
                  key={aluno.id} 
                  className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all ${
                    aluno.presente 
                      ? "bg-green-50 border-green-400 shadow-sm" 
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <Checkbox
                      checked={aluno.presente}
                      onCheckedChange={() => togglePresenca(aluno.id)}
                      className="h-7 w-7"
                    />
                    <Avatar className="h-14 w-14 ring-4 ring-white shadow-md">
                      <AvatarFallback className="text-lg font-bold bg-linear-to-br from-purple-600 to-blue-600 text-white">
                        {aluno.nome.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xl font-semibold">{aluno.nome}</p>
                      <p className="text-sm text-gray-600">{aluno.categoria}</p>
                    </div>
                  </div>

                  <Badge className={`text-lg px-6 py-2 ${aluno.presente ? "bg-green-600" : "bg-gray-500"}`}>
                    {aluno.presente ? "Presente" : "Ausente"}
                  </Badge>
                </div>
              ))
            )}
          </div>

          {/* Botão Salvar Grande */}
          <div className="mt-10 flex justify-center">
            <Button 
              size="lg" 
              className="px-12 py-7 text-lg bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl"
              onClick={salvarPresenca}
            >
              <Save className="mr-3 h-6 w-6" />
              Salvar Presença ({presentes} presentes • {ausentes} ausentes)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarcarPresencaPage;