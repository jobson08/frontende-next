/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { ChevronLeft, Edit, Phone, Shield, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { toast } from "sonner";
import CreateLoginModal from "@/src/components/common/CreateLoginModal";

interface Funcionario {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  cargo: string;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
  // userId: string | null; // se quiser usar para verificar login
}

const FuncionarioDetalhePage = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  // Estado para controlar o modal de criar/editar login
  const [openModalId, setOpenModalId] = useState<string | null>(null);

  const createLoginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await api.post(`/tenant/funcionarios/${id}/login`, {
        email,
        password,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Login criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["funcionario", id] });
      setOpenModalId(null);
    },
    onError: (err: any) => {
      toast.error("Erro ao criar login", {
        description: err.response?.data?.error || "Tente novamente",
      });
    },
  });

  const handleCreateLogin = (email: string, password: string) => {
    createLoginMutation.mutate({ email, password });
  };

  const { data: funcionario, isLoading, error } = useQuery<Funcionario>({
    queryKey: ["funcionario", id],
    queryFn: async () => {
      const { data } = await api.get(`/tenant/funcionarios/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
        <span className="ml-4 text-xl">Carregando detalhes...</span>
      </div>
    );
  }

  if (error || !funcionario) {
    toast.error("Erro ao carregar funcionário");
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Funcionário não encontrado</h2>
        <Button asChild className="mt-4">
          <Link href="/funcionarios">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  const temLogin = !!funcionario.email; // ou use funcionario.userId se tiver no response

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/funcionarios">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Detalhes do Funcionário</h1>
          <p className="text-gray-600">Informações completas de {funcionario.nome}</p>
        </div>
      </div>

      {/* Perfil Principal */}
      <Card className="overflow-hidden">
        <div className="bg-linear-to-r from-orange-600 to-red-600 h-32" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
            <Avatar className="h-32 w-32 ring-8 ring-white shadow-2xl">
              <AvatarFallback className="bg-linear-to-r from-orange-600 to-red-600 text-white text-4xl font-bold">
                {funcionario.nome.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold">{funcionario.nome}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 justify-center sm:justify-start">
                <Badge className="bg-orange-600 text-white text-lg px-4 py-1">
                  {funcionario.cargo}
                </Badge>
                <Badge variant="default">ATIVO</Badge>
                {temLogin && <Badge className="bg-green-600">Tem acesso ao sistema</Badge>}
              </div>
            </div>
            <div className="ml-auto">
              <Button size="lg" asChild className="bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                <Link href={`/funcionario/${funcionario.id}/editar`}>
                  <Edit className="mr-2 h-5 w-5" />
                  Editar Funcionário
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Telefone</span>
              <span className="font-medium">{funcionario.telefone || "Não informado"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">E-mail</span>
              <span className="font-medium">{funcionario.email || "Não informado"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data de Cadastro</span>
              <span className="font-medium">
                {new Date(funcionario.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Acesso ao Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              {temLogin ? (
                <div>
                  <Badge className="bg-green-600 text-lg px-6 py-3">ACESSO LIBERADO</Badge>
                  <p className="text-sm text-gray-600 mt-2">Pode logar no painel</p>
                  <Button
                    variant="outline"
                    className="mt-4 border-green-600 text-green-600 hover:bg-green-50"
                    onClick={() => setOpenModalId(funcionario.id)}
                  >
                    Editar login
                  </Button>
                </div>
              ) : (
                <div>
                  <Badge variant="outline" className="text-orange-600 border-orange-600 text-lg px-6 py-3">
                    SEM ACESSO
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">Crie o login para acessar o sistema</p>
                  <Button
                    className="mt-4 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    onClick={() => setOpenModalId(funcionario.id)}
                  >
                    Criar Login
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            {funcionario.observacoes || "Nenhuma observação cadastrada."}
          </p>
        </CardContent>
      </Card>

      {/* Modal de criar/editar login */}
     {openModalId && (
    <CreateLoginModal
      name={funcionario.nome}
      currentEmail={funcionario.email || null}
      open={!!openModalId}
      onOpenChange={(open) => !open && setOpenModalId(null)}
      onSave={handleCreateLogin} // ← PASSA A FUNÇÃO QUE CHAMA O BACKEND
    />
      )}
    </div>
  );
};

export default FuncionarioDetalhePage;