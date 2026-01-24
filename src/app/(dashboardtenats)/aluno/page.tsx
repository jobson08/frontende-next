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
import { Search, UserPlus, Phone, Calendar, UserCheck, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
// Função pra formatar telefone (opcional, deixa bonito)
const formatarTelefone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

// Função pra calcular idade (NUNCA DÁ ERRO)
const calcularIdade = (birthDate: string): number => {
  const hoje = new Date();
  const nascimento = new Date(birthDate);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesAtual = hoje.getMonth();
  const mesNasc = nascimento.getMonth();

  if (mesAtual < mesNasc || (mesAtual === mesNasc && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
};

interface Aluno {
  id: string;
  nome: string;
  dataNascimento: string;
  telefone: string;
  responsavel: string | null;
  status: "ATIVO" | "INATIVO" | "TRANCADO";
  temLogin: boolean;
  email: string | null;
  //modalidade: "futebol" | "crossfit"; // nova propriedade
  categoria?: string; // só para futebol
}

const alunosMock: Aluno[] = [
  { id: "1", nome: "Enzo Gabriel Silva", dataNascimento: "2018-05-12", telefone: "11988887777", responsavel: "Ana Silva", status: "ATIVO", temLogin: true, email: "enzo.gabriel@gmail.com" },
  { id: "2", nome: "Maria Luiza Costa", dataNascimento: "2019-02-20", telefone: "11977778888", responsavel: "Carlos Costa", status: "ATIVO", temLogin: false, email: "Carlos.costa@gmail.com" },
  { id: "3", nome: "Lucas Andrade", dataNascimento: "2005-11-30", telefone: "11966667777", responsavel: null, status: "ATIVO", temLogin: true, email: "lucas.andre@gmail.com" },
  { id: "4", nome: "Valentina Souza", dataNascimento: "2020-08-15", telefone: "11955556666", responsavel: "Juliana Souza", status: "INATIVO", temLogin: false, email: "valentina@gmail.com" },
  { id: "5", nome: "Pedro Henrique Lima", dataNascimento: "2008-03-22", telefone: "11944445555", responsavel: "Márcia Lima", status: "ATIVO", temLogin: true, email: null },
];

/*const calcularIdade = (dataNascimento: string) => {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return idade;
};*/

const AlunoPage = () => {   // inicio da função

  const [searchTerm, setSearchTerm] = useState("");
  //const [openModalId, setOpenModalId] = useState<string | null>(null);
 
  const filteredAlunos = alunosMock.filter(aluno =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.telefone.includes(searchTerm) ||
    aluno.responsavel?.toLowerCase().includes(searchTerm.toLowerCase())
 );

 /*const { data: aluno = [], isLoading, error } = useQuery<Aluno[]>({
    queryKey: ["alunos"],
    queryFn: async () => {
      const { data } = await api.get("/tenant/alunos");
      return data.data || [];
    },
  });
  const filteredAlunos = aluno.filter(aluno =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.telefone.includes(searchTerm) ||
    aluno.responsavel?.toLowerCase().includes(searchTerm.toLowerCase())
  );*/

   /* if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <span className="ml-4 text-xl">Carregando alunos...</span>
      </div>
    );
  }

  if (error) {
    toast.error("Erro ao carregar responsáveis");
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Erro ao carregar dados</h2>
        <p className="mt-2">Tente novamente mais tarde</p>
      </div>
    );
  }
*/
  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Alunos</h1>
          <p className="text-gray-600">Gerencie todos os alunos </p>
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
      {/* Grid de Cards */}
      {/* Calcular idade*/}
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {filteredAlunos.map((aluno) => {
          const idade = calcularIdade(aluno.dataNascimento);
          const isMaior = idade >= 18;
          {/* caso meno ou ingual a 18  */ }
          return (
            <Card key={aluno.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                
               {/* Badge fixo: todos têm login agora */}
               <div className="pt-2">
                <Badge className="text-xs bg-green-600 text-white">
                  Tem login
                </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {aluno.nome.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{aluno.nome}</CardTitle>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(aluno.dataNascimento).toLocaleDateString("pt-BR")}
                        {isMaior && <Badge variant="outline" className="text-xs">Maior</Badge>}
                      </p>
                    </div>
                  </div>
              </div>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-2 w-2 text-gray-500" />
                  {formatarTelefone(aluno.telefone)}
                </div>

                {aluno.responsavel && (
                  <div className="flex items-center gap-2 text-sm">
                    <UserCheck className="h-2 w-2 text-gray-500" />
                    {aluno.responsavel}
                  </div>
                )}

                {/* Status do aluno */}
                <div className="pt-2">
                  <Badge 
                    variant={aluno.status === "ATIVO" ? "default" : aluno.status === "INATIVO" ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {aluno.status}
                  </Badge>
                </div>
                
              {/* BOTÃO VER DETALHE */}
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