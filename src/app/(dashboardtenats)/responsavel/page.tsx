// src/app/(dashboard)/responsaveis/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Mail, Phone, Search, UserPlus, Users, Loader2, AlertCircle } from "lucide-react";
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

interface Responsavel {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cpf: string | null;
  observacoes: string | null;
  filhos: { id: string; nome: string }[]; // alunos vinculados
}

const ResponsaveisPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: responsaveis = [], isLoading, error } = useQuery<Responsavel[]>({
    queryKey: ["responsaveis"],
    queryFn: async () => {
      const { data } = await api.get("/tenant/responsaveis");
      return data.data || [];
    },
  });

  const filtered = responsaveis.filter(r =>
    r.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.telefone && r.telefone.includes(searchTerm)) ||
    (r.email && r.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <span className="ml-4 text-xl">Carregando responsáveis...</span>
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

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Responsáveis</h1>
          <p className="text-gray-600">Gerencie os responsáveis pelos alunos</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/responsavel/novo">
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Responsável
          </Link>
        </Button>
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome, telefone ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grid de Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full py-12 text-lg">
            {responsaveis.length === 0 ? "Nenhum responsável cadastrado ainda." : "Nenhum resultado encontrado."}
          </p>
        ) : (
          filtered.map((r) => (
            <Card key={r.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-purple-600 text-white">
                        {r.nome.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg">{r.nome}</CardTitle>
                  </div>
                  {/* Badge de login */}
                  {r.email ? (
                    <Badge className="bg-green-600 text-white text-xs">
                      Tem login
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Sem login
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  {formatarTelefone(r.telefone)}
                </div>
                {r.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {r.email}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500" />
                  {r.filhos?.length || 0} aluno{r.filhos?.length !== 1 ? "s" : ""}
                </div>

                <div className="pt-4 flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/responsavel/${r.id}`}>
                      Ver detalhes
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ResponsaveisPage;