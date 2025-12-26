// src/app/superadmin/tenants/[id]/page.tsx
"use client";

import CreateLoginModal from "@/src/components/common/CreateLoginModal";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Calendar, ChevronLeft, DollarSign, Edit, Mail, MapPin, Phone, Shield, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const tenantsMock = [
  {
    id: "1",
    name: "Escolinha Gol de Placa",
    cidade: "São Paulo",
    estado: "SP",
    endereco: "Rua das Flores, 123 - Jardim Paulista",
    telefone: "(11) 99999-8888",
    emailAdmin: "admin@goldeplaca.com",
    nomeAdmin: "João Silva",
    plano: "Pro",
    alunos: 145,
    receitaMensal: "R$ 8.420",
    status: "ATIVA",
    dataCriacao: "2024-03-15",
    ultimoPagamento: "2025-12-10",
    observacoes: "Escolinha com foco em categorias sub-11 e sub-13. Campo próprio e parceria com clube local.",
    temLoginAdmin: true,
    categorias: ["Sub-9", "Sub-11", "Sub-13", "Sub-15"],
    treinadores: 8,
    responsaveis: 132,
  },
  // outros tenants...
];

const TenantDetalhePage = () => {       //inicio da função
const { id } = useParams();

  const tenant = tenantsMock.find(t => t.id === id);
  const [openLoginModal, setOpenLoginModal] = useState(false);

  if (!tenant) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Escolinha não encontrada</h1>
        <Button asChild className="mt-4">
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
          <p className="text-gray-600">Informações completas de {tenant.name}</p>
        </div>
      </div>

      {/* Perfil Principal */}
     <Card className="overflow-hidden">
        <div className="bg-linear-to-r from-green-600 to-emerald-600 h-32" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
            <Avatar className="h-32 w-32 ring-8 ring-white shadow-2xl">
              <AvatarFallback className="bg-linear-to-r from-green-600 to-emerald-600 text-white text-4xl font-bold">
                {tenant.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-3xl font-bold">{tenant.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 justify-center sm:justify-start">
                <Badge className="bg-linear-to-r from-blue-600 to-cyan-600 text-white">
                  Plano {tenant.plano}
                </Badge>
                <Badge className={tenant.status === "ATIVA" ? "bg-green-600" : "bg-red-600"}>
                  {tenant.status}
                </Badge>
              </div>
            </div>
            <div className="ml-auto">
              <Button size="lg" asChild className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
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
              <p className="font-medium text-lg">{tenant.nomeAdmin}</p>
              <p className="text-gray-600">{tenant.emailAdmin}</p>
            </div>
            <div className="text-right">
              {tenant.temLoginAdmin ? (
                <Badge className="bg-green-600 text-lg px-6 py-2">ACESSO LIBERADO</Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-600 text-lg px-6 py-2">
                  SEM ACESSO
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={() => setOpenLoginModal(true)}
              className={tenant.temLoginAdmin ? "bg-orange-600 hover:bg-orange-700" : "bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"}
            >
              {tenant.temLoginAdmin ? "Editar Login do Admin" : "Criar Login do Admin"}
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
              <span className="font-bold text-2xl">{tenant.alunos}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Responsáveis</span>
              <span className="font-medium">{tenant.responsaveis}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Treinadores</span>
              <span className="font-medium">{tenant.treinadores}</span>
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
              {tenant.categorias.map((cat) => (
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
        name={tenant.nomeAdmin}
        currentEmail={tenant.emailAdmin}
        open={openLoginModal}
        onOpenChange={setOpenLoginModal}
      />

    </div>
     );
}
 
export default TenantDetalhePage;