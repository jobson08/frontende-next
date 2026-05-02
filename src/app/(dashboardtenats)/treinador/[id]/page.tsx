/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/teinador/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { format, isValid } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Calendar, Clock, MapPin, User, Edit, Trash2, AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Treinador {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  fotoUrl?: string;
  dataNascimento?: string;
  observacoes?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  escolinha: {
    id: string;
    nome: string;
  };
  user?: {
    id: string;
    email: string;
  };
}

const TreinadorDetalhePage = () => {
  const { id } = useParams();
  const router = useRouter();

  const { data: treinador, isLoading } = useQuery<Treinador>({
    queryKey: ["treinador", id],
    queryFn: async () => {
      const res = await api.get(`/tenant/treinadores/${id}`);
      return res.data.data || res.data;
    },
  });

  const handleDelete = async () => {
    if (!confirm("Deseja realmente excluir este treinador?")) return;

    try {
      await api.delete(`/tenant/treinadores/${id}`);
      toast.success("Treinador excluído com sucesso!");
      router.push("/treinador");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erro ao excluir treinador");
    }
  };

  if (isLoading) {
    return <div className="text-center py-20">Carregando dados do treinador...</div>;
  }

  if (!treinador) {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Treinador não encontrado</h2>
        <Button asChild className="mt-6">
          <Link href="/treinador">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/teinador">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{treinador.nome}</h1>
            <p className="text-gray-600">Treinador • {treinador.escolinha.nome}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href={`/treinador/${treinador.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                 <AvatarImage src={treinador.fotoUrl|| undefined} />
                <AvatarFallback className="bg-linear-to-br from-blue-600 to-purple-600 text-white text-3xl">
                  {treinador.nome.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-2xl font-bold">{treinador.nome}</p>
                <p className="text-gray-600">{treinador.email}</p>
              </div>
            </div>

            {treinador.telefone && (
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <span>{treinador.telefone}</span>
              </div>
            )}

            {treinador.dataNascimento && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span>{format(new Date(treinador.dataNascimento), "dd/MM/yyyy")}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status e Escola */}
        <Card>
          <CardHeader>
            <CardTitle>Status e Escola</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Escola</p>
              <p className="font-medium">{treinador.escolinha.nome}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge className={treinador.ativo ? "bg-green-600" : "bg-gray-500"}>
                {treinador.ativo ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Observações */}
      {treinador.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{treinador.observacoes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TreinadorDetalhePage;