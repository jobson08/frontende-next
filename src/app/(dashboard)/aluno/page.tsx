"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

import { Search, UserPlus, Phone, Calendar, UserCheck } from "lucide-react";

import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { useState } from "react";
import { Badge } from "@/src/components/ui/badge";
import Link from "next/link";
import CreateLoginPopup from "@/src/components/common/CreateLoginPopup";


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
  name: string;
  birthDate: string;
  phone: string;
  responsavel: string | null;
  status: "ATIVO" | "INATIVO" | "TRANCADO";
  temLogin: boolean;
  email: string | null;
}

const alunosMock: Aluno[] = [
  { id: "1", name: "Enzo Gabriel Silva", birthDate: "2018-05-12", phone: "11988887777", responsavel: "Ana Silva", status: "ATIVO", temLogin: true, email: "enzo.gabriel@gmail.com" },
  { id: "2", name: "Maria Luiza Costa", birthDate: "2019-02-20", phone: "11977778888", responsavel: "Carlos Costa", status: "ATIVO", temLogin: false, email: "Carlos.costa@gmail.com" },
  { id: "3", name: "Lucas Andrade", birthDate: "2005-11-30", phone: "11966667777", responsavel: null, status: "ATIVO", temLogin: true, email: "lucas.andre@gmail.com" },
  { id: "4", name: "Valentina Souza", birthDate: "2020-08-15", phone: "11955556666", responsavel: "Juliana Souza", status: "INATIVO", temLogin: false, email: "valentina@gmail.com" },
  { id: "5", name: "Pedro Henrique Lima", birthDate: "2008-03-22", phone: "11944445555", responsavel: "Márcia Lima", status: "ATIVO", temLogin: true, email: null },
];

/*const calcularIdade = (birthDate: string) => {
  const hoje = new Date();
  const nascimento = new Date(birthDate);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return idade;
};*/

const AlunoPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openModalId, setOpenModalId] = useState<string | null>(null);

  const filteredAlunos = alunosMock.filter(aluno =>
    aluno.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.phone.includes(searchTerm) ||
    aluno.responsavel?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const alunoSelecionado = filteredAlunos.find(a => a.id === openModalId

  );
  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Alunos</h1>
          <p className="text-gray-600">Gerencie todos os alunos da sua academia</p>
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAlunos.map((aluno) => {
          const idade = calcularIdade(aluno.birthDate);
          const isMaior = idade >= 18;
          {/* caso meno ou ingual a 18  */ }
          return (
            <Card key={aluno.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {aluno.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{aluno.name}</CardTitle>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(aluno.birthDate).toLocaleDateString("pt-BR")}
                        {isMaior && <Badge variant="outline" className="text-xs">Maior</Badge>}
                      </p>
                    </div>
                  </div>
                  {aluno.temLogin ? (
                    <Badge className="bg-green-600">Tem login</Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      Sem login
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  {aluno.phone}
                </div>
                {aluno.responsavel && (
                  <div className="flex items-center gap-2 text-sm">
                    <UserCheck className="h-4 w-4 text-gray-500" />
                    {aluno.responsavel}
                  </div>
                )}

                <div className="pt-4 flex gap-2">
                 {/* BOTÃO VER DETALHE */}
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/aluno/${aluno.id}`}>
                      Ver detalhes
                    </Link>
                  </Button>

                  {/* BOTÃO QUE ABRE O MODAL — EXATAMENTE IGUAL AO RESPONSÁVEL */}
                  {!aluno.temLogin ? (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => setOpenModalId(aluno.id)}
                    >
                      Criar login
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setOpenModalId(aluno.id)}
                    >
                      Editar login
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* MODAL NO CENTRO DA TELA — FORA DE TUDO! */}
      {alunoSelecionado && (
        <CreateLoginPopup
          type="ALUNO"
          name={alunoSelecionado.name}
          currentEmail={alunoSelecionado.email}
          open={!!openModalId}
          onOpenChange={(open) => !open && setOpenModalId(null)}
        />
      )}
    </div>
  );
}

export default AlunoPage;