"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import CreateLoginModal from "@/src/components/common/CreateLoginModal";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Calendar, ChevronLeft, DollarSign, Edit, Mail, MapPin, Phone, Shield, Users, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const TenantDetalhePage = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [openLoginModal, setOpenLoginModal] = useState(false);

  const { data: tenant, isLoading, error } = useQuery({
    queryKey: ["tenant", id],
    queryFn: async () => {
      const { data } = await api.get(`/superadmin/tenants/${id}`);
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-4 text-lg font-medium">Carregando detalhes da escolinha...</p>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-16 w-16 mx-auto mb-6 text-red-500" />
        <h1 className="text-2xl font-bold text-red-600 mb-4">Escolinha não encontrada</h1>
        <Button asChild>
          <Link href="/superadmin/tenants">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  const getPlanoColor = (plano: string) => {
    switch (plano) {
      case "Enterprise": return "bg-gradient-to-r from-purple-600 to-pink-600 text-white";
      case "Pro": return "bg-gradient-to-r from-blue-600 to-cyan-600 text-white";
      case "Básico": return "bg-gradient-to-r from-green-600 to-emerald-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const getStatusColor = (status: string) => {
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
          <p className="text-gray-600">Informações completas de {tenant.nome}</p>
        </div>
      </div>

      {/* Perfil Principal */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-32" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
            <Avatar className="h-32 w-32 ring-8 ring-white shadow-2xl">
              <AvatarFallback className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-4xl font-bold">
                {tenant.nome.split(" ").map((n: string) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-3xl font-bold">{tenant.nome}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 justify-center sm:justify-start">
                <Badge className={getPlanoColor(tenant.planoSaaS)}>
                  Plano {tenant.planoSaaS}
                </Badge>
                <Badge className={getStatusColor(tenant.statusPagamentoSaaS)}>
                  {tenant.statusPagamentoSaaS}
                </Badge>
              </div>
            </div>
            <div className="ml-auto">
              <Button size="lg" asChild className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Link href={`/superadmin/tenants/${tenant.id}/editar`}>
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
              <p className="font-medium text-lg">{tenant.nomeAdmin || "Não informado"}</p>
              <p className="text-gray-600">{tenant.emailContato || "Não informado"}</p>
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
              <span className="font-bold text-2xl">{tenant.totalAlunos}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Responsáveis</span>
              <span className="font-medium">{tenant.responsaveis || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Treinadores</span>
              <span className="font-medium">{tenant.treinadores || 0}</span>
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
              <span className="text-gray-600">Receita mensal</span>
              <span className="font-bold text-2xl text-green-600">{tenant.receitaMensal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Último pagamento SaaS</span>
              <span className="font-medium">
                {new Date(tenant.ultimoPagamento).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Próximo vencimento</span>
              <span className="font-medium text-orange-600">10/01/2026</span>
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
                {new Date(tenant.dataCriacao).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Administrador</span>
              <span className="font-medium">{tenant.nomeAdmin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contato Admin</span>
              <span className="font-medium">{tenant.emailAdmin}</span>
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
            <p className="text-gray-700">{tenant.endereco}</p>
            <p className="text-gray-600 mt-2">{tenant.cidade} - {tenant.estado}</p>
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
              <span className="font-medium">{tenant.telefone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <span className="font-medium">{tenant.emailAdmin}</span>
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
            <div className="flex flex-wrap gap-2">
             {tenant.categorias.map((cat: string) => (
           <Badge key={cat} variant="secondary" className="text-sm">
               {cat}
          </Badge>
))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {tenant.observacoes || "Nenhuma observação cadastrada."}
            </p>
          </CardContent>
        </Card>
      </div>
{/* MODAL DE LOGIN DO ADMIN */}
      <CreateLoginModal
       name={tenant.nomeAdmin || "Administrador"}
        currentEmail={tenant.emailContato || ""}
        open={openLoginModal}
        onOpenChange={setOpenLoginModal}
      />

    </div>
     );
}
 
export default TenantDetalhePage;