"use client"

import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Search, UserPlus, Phone, Calendar, UserCheck, Loader2, AlertCircle, Volleyball } from "lucide-react";
import { toast } from "sonner";

// Função para formatar telefone
const formatarTelefone = (phone: string | null) => {
  if (!phone) return "Não informado";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

// Função para calcular idade
const calcularIdade = (birthDate: string): number => {
  if (!birthDate) return 0;

  // Parse manual sem fuso horário (pega só a parte da data)
  const [ano, mes, dia] = birthDate.split("T")[0].split("-");
  const nascimento = new Date(Number(ano), Number(mes) - 1, Number(dia)); // mês -1 porque JS usa 0-11

  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();

  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
};

// Interface baseada no retorno real do backend
interface Aluno {
  id: string;
  nome: string;
  dataNascimento: string; // ou Date
  telefone: string | null;
  responsavel?: { nome: string } | null;
  status: "ATIVO" | "INATIVO" | "TRANCADO";
  email: string | null;
  userId: string | null; // para saber se tem login
  categoria: string | null; // ex: "Sub-13"
}

const AlunoPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Busca real de alunos de futebol
  const { data: alunos = [], isLoading, error } = useQuery<Aluno[]>({
    queryKey: ["alunos-futebol"],
    queryFn: async () => {
      const res = await api.get("/tenant/alunos");
      return res.data.data || []; // ajuste conforme o formato da sua resposta
    },
  });

  // Filtra localmente
  const filteredAlunos = alunos.filter(aluno =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (aluno.telefone && aluno.telefone.includes(searchTerm)) ||
    (aluno.responsavel?.nome?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-600">Carregando alunos de futebol...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-600">
        <AlertCircle className="h-12 w-12" />
        <p className="mt-4 font-medium">Erro ao carregar alunos</p>
        <p className="text-sm text-gray-500">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Alunos de Futebol</h1>
          <p className="text-gray-600">Gerencie todos os alunos cadastrados</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/aluno/novo">
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Aluno
          </Link>
        </Button>
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome, telefone ou responsável..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sem alunos */}
      {filteredAlunos.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchTerm ? "Nenhum aluno encontrado na busca" : "Nenhum aluno de futebol cadastrado ainda"}
        </div>
      )}

      {/* Grid de Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAlunos.map((aluno) => {
          const idade = calcularIdade(aluno.dataNascimento);
          const isMaior = idade >= 18;

          return (
            <Card key={aluno.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {aluno.nome.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                     </Avatar>
                      <CardTitle className="text-lg">{aluno.nome}</CardTitle>
                  </div>
                </div>
                  <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {aluno.dataNascimento 
                          ? aluno.dataNascimento.split("T")[0].split("-").reverse().join("/") 
                          : "Não informado"} • {calcularIdade(aluno.dataNascimento)} anos
                        {idade >= 18 && <Badge variant="outline" className="text-xs ml-1">Maior</Badge>}
                      </p>
                       {/* Badge de Futebol */}
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Volleyball className="h-3 w-3" />
                    Futebol
                  </Badge>
                  </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  {formatarTelefone(aluno.telefone)}
                </div>

                {aluno.responsavel && (
                  <div className="flex items-center gap-2 text-sm">
                    <UserCheck className="h-4 w-4 text-gray-500" />
                    {aluno.responsavel.nome}
                  </div>
                )}
                <div className="flex items-center justify-between">
                {/* Categoria (ex: Sub-13) */}
                <div className="pt-1">
                  <Badge variant="outline" className="text-xs">
                    {aluno.categoria || "Sem categoria informada"}
                  </Badge>
                </div>

                {/* Status */}
                <div>
                  <Badge 
                    variant={aluno.status === "ATIVO" ? "default" : aluno.status === "INATIVO" ? "secondary" : "destructive"}
                    className="text-xs bg-blue-400 text-white"
                  >
                    {aluno.status}
                  </Badge>
                </div>

                {/* Login */}
                {aluno.userId && (
                  <div className="pt-1">
                    <Badge className="text-xs bg-green-600 text-white">
                      Tem login
                    </Badge>
                  </div>
                )}
              </div>
                {/* Botão Ver detalhes */}
                <div className="pt-2 flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/aluno/${aluno.id}`}>
                      Ver detalhes
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default AlunoPage;