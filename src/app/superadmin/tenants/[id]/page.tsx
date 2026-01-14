/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { useParams } from "next/navigation";
import { useState } from "react";
import CreateLoginModal from "@/src/components/common/CreateLoginModal";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Calendar, ChevronLeft, DollarSign, Edit, Mail, MapPin, Phone, Shield, Users, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

// Interface para tipagem segura
interface EscolinhaDetails {
  id: string;
  nome?: string;
  endereco?: string;
  logoUrl?: string;
  tipoDocumento?: string;
  documento?: string;
  nomeResponsavel?: string;
  emailContato?: string;
  telefone?: string;
  planoSaaS?: string;
  valorPlanoMensal?: number;
  statusPagamentoSaaS?: string;
  dataInicioPlano?: string;
  dataProximoCobranca?: string;
  aulasExtrasAtivas?: boolean;
  crossfitAtivo?: boolean;
  createdAt?: string;
  updatedAt?: string;
  totalAlunos?: number;
  // Campos extras se o backend retornar
  nomeAdmin?: string;
  categorias?: string[];
  observacoes?: string;
  cidade?: string;
  estado?: string;
}

const TenantDetalhePage = () => {
  const { id } = useParams() as { id: string };
  const [openLoginModal, setOpenLoginModal] = useState(false);

  const { data: response, isLoading, error } = useQuery<{ success: boolean; data: EscolinhaDetails }>({
    queryKey: ["escolinha", id],
    queryFn: async () => {
      console.log("[Detalhe] Buscando escolinha com ID:", id);
      const res = await api.get(`http://localhost:4000/api/v1/superadmin/escolinhas/${id}`);
      console.log("[Detalhe] Response completo:", res);
      return res.data; // retorna { success, data }
    },
  });

  // Pega o objeto real da escolinha (data.data)
  const escolinha = response?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-4 text-lg font-medium">Carregando detalhes da escolinha...</p>
      </div>
    );
  }

  if (error || !escolinha) {
    console.error("[Detalhe] Erro completo:", error);
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-16 w-16 mx-auto mb-6 text-red-500" />
        <h1 className="text-2xl font-bold text-red-600 mb-4">Escolinha não encontrada</h1>
        <p className="text-gray-600 mb-6">
          {error ? (error as any).message || "Erro ao buscar dados" : "A escolinha pode ter sido removida ou o ID está incorreto."}
        </p>
        <Button asChild>
          <Link href="/superadmin/tenants">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  // Fallbacks seguros para evitar crashes
  const nome = escolinha.nome || "Escolinha sem nome";
  const iniciais = nome.split(" ").map((n: string) => n[0] || "").join("");

  const getPlanoColor = (plano: string = "Básico") => {
    switch (plano) {
      case "Enterprise": return "bg-gradient-to-r from-purple-600 to-pink-600 text-white";
      case "Pro": return "bg-gradient-to-r from-blue-600 to-cyan-600 text-white";
      case "Básico": return "bg-gradient-to-r from-green-600 to-emerald-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const getStatusColor = (status: string = "ATIVA") => {
    switch (status) {
      case "ATIVA": return "bg-green-600";
      case "PENDENTE": return "bg-orange-600";
      case "SUSPENSA": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };

  return (
 <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/superadmin/tenants">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Detalhes da Escolinha</h1>
          <p className="text-gray-600">Informações completas de {nome}</p>
        </div>
      </div>

      {/* Perfil Principal */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-32" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
            <Avatar className="h-32 w-32 ring-8 ring-white shadow-2xl">
              <AvatarFallback className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-4xl font-bold">
                {iniciais}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-3xl font-bold">{nome}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 justify-center sm:justify-start">
                <Badge className={getPlanoColor(escolinha.planoSaaS)}>
                  Plano {escolinha.planoSaaS || "Não informado"}
                </Badge>
                <Badge className={getStatusColor(escolinha.statusPagamentoSaaS)}>
                  {escolinha.statusPagamentoSaaS || "Não informado"}
                </Badge>
              </div>
            </div>
            <div className="ml-auto">
              <Button size="lg" asChild className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Link href={`/superadmin/tenants/${escolinha.id}/editar`}>
                  <Edit className="mr-2 h-5 w-5" />
                  Editar Escolinha
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acesso do Administrador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Acesso do Administrador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-lg">{escolinha.nomeResponsavel || "Não informado"}</p>
              <p className="text-gray-600">{escolinha.emailContato || "Não informado"}</p>
            </div>
            <div className="text-right">
              <Badge className="bg-green-600 text-lg px-6 py-2">
                ACESSO LIBERADO
              </Badge>
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={() => setOpenLoginModal(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Editar Login do Admin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações Gerais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Alunos e Equipe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Alunos matriculados</span>
              <span className="font-bold text-2xl">{escolinha.totalAlunos || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Responsáveis</span>
             {/*} <span className="font-medium">{escolinha.responsaveis || 0}</span>*/}
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Treinadores</span>
            {/*}  <span className="font-medium">{escolinha.treinadores || 0}</span>*/}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Valor do Plano SaaS</span>
              <span className="font-bold text-2xl text-green-600">
                {escolinha.valorPlanoMensal ? `R$ ${escolinha.valorPlanoMensal.toFixed(2)}` : "Não informado"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Último pagamento SaaS</span>
              <span className="font-medium">
                {escolinha.dataInicioPlano 
                  ? new Date(escolinha.dataInicioPlano).toLocaleDateString("pt-BR") 
                  : "Não informado"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Próximo vencimento</span>
              <span className="font-medium text-orange-600">
                {escolinha.dataProximoCobranca 
                  ? new Date(escolinha.dataProximoCobranca).toLocaleDateString("pt-BR") 
                  : "Não informado"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Criada em</span>
              <span className="font-medium">
                {escolinha.createdAt 
                  ? new Date(escolinha.createdAt).toLocaleDateString("pt-BR") 
                  : "Não informado"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Administrador</span>
              <span className="font-medium">{escolinha.nomeResponsavel || "Não informado"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contato Admin</span>
              <span className="font-medium">{escolinha.emailContato || "Não informado"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Localização e Contato */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{escolinha.endereco || "Não informado"}</p>
            <p className="text-gray-600 mt-2">
            Cidade {escolinha.cidade || "Não informado"} Estado - {escolinha.estado || "Não informado"}
            </p>
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">Mapa placeholder (integração Google Maps futura)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <span className="font-medium">{escolinha.telefone || "Não informado"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <span className="font-medium">{escolinha.emailContato || "Não informado"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categorias e Observações */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Categorias Atendidas</CardTitle>
          </CardHeader>
          <CardContent>
            {escolinha.categorias && escolinha.categorias.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {escolinha.categorias.map((cat: string) => (
                  <Badge key={cat} variant="secondary" className="text-sm">
                    {cat}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Nenhuma categoria cadastrada.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {escolinha.observacoes || "Nenhuma observação cadastrada."}
            </p>
          </CardContent>
        </Card>
      </div>
{/* MODAL DE LOGIN DO ADMIN */}
      <CreateLoginModal
       name={escolinha.nomeAdmin || "Administrador"}
        currentEmail={escolinha.emailContato || ""}
        open={openLoginModal}
        onOpenChange={setOpenLoginModal}
      />

    </div>
     );
}
 
export default TenantDetalhePage;