"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Mail, Phone, Search, Shield, UserPlus, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { toast } from "sonner";
import CreateLoginModal from "@/src/components/common/CreateLoginModal";

interface Funcionario {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  cargo: "PROFESSOR" | "RECEPCAO" | "ADMINISTRATIVO" | "TREINADOR" | "GERENTE";
  observacoes: string | null;
  createdAt: string;
  // Adicione mais campos se quiser (ex: salario, status, temLogin)
}

const FuncionariosPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openModalId, setOpenModalId] = useState<string | null>(null);

  const { data: funcionarios = [], isLoading, error } = useQuery<Funcionario[]>({
    queryKey: ["funcionarios"],
    queryFn: async () => {
      const { data } = await api.get("/tenant/funcionarios");
      return data.data || [];
    },
  });

  // Tratamento de erro local
  if (error) {
    toast.error("Erro ao carregar funcionários", {
      description: (error as Error).message || "Tente novamente mais tarde",
    });
  }

  const filtered = funcionarios.filter(f =>
    f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.telefone && f.telefone.includes(searchTerm)) ||
    (f.email && f.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const funcionarioSelecionado = filtered.find(f => f.id === openModalId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
        <span className="ml-4 text-xl">Carregando equipe...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Funcionários</h1>
          <p className="text-gray-600">Gerencie a equipe da sua academia</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
          <Link href="/funcionario/novo">
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Funcionário
          </Link>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome, telefone ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full py-12 text-lg">
            {funcionarios.length === 0 ? "Nenhum funcionário cadastrado ainda." : "Nenhum resultado encontrado."}
          </p>
        ) : (
          filtered.map((f) => (
            <Card key={f.id} className="hover:shadow-xl transition-shadow border-orange-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14 ring-4 ring-orange-100">
                      <AvatarFallback className="bg-gradient-to-br from-orange-600 to-red-600 text-white font-bold">
                        {f.nome.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{f.nome}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {f.cargo}
                      </Badge>
                    </div>
                  </div>
                  {/* Status mock - adicione no backend depois */}
                  <Badge variant="default">ATIVO</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  {f.telefone || "Não informado"}
                </div>
                {f.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {f.email}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-gray-500" />
                  {f.email ? "Tem acesso ao sistema" : "Sem login criado"}
                </div>

                <div className="pt-4 flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/funcionario/${f.id}`}>
                      Ver detalhes
                    </Link>
                  </Button>
                  {!f.email ? (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg"
                      onClick={() => setOpenModalId(f.id)}
                    >
                      Criar login
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-500 text-orange-600 hover:bg-orange-50"
                      onClick={() => setOpenModalId(f.id)}
                    >
                      Editar login
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal */}
      {openModalId && (
        <CreateLoginModal
          name={filtered.find(f => f.id === openModalId)?.nome || ""}
          currentEmail={filtered.find(f => f.id === openModalId)?.email || null}
          open={!!openModalId}
          onOpenChange={(open) => !open && setOpenModalId(null)}
        />
      )}
    </div>
  );
};

export default FuncionariosPage;