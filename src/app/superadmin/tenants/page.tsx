// src/app/superadmin/tenants/page.tsx
"use client";

import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Search, Plus, Building2, DollarSign, Users, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Tenant {
  id: string;
  name: string;
  cidade: string;
  estado: string;
  plano: "Básico" | "Pro" | "Enterprise";
  alunos: number;
  receitaMensal: string;
  status: "ATIVA" | "INATIVA" | "PENDENTE" | "SUSPENSA";
  dataCriacao: string;
  ultimoPagamento: string;
}

const tenantsMock: Tenant[] = [
  {
    id: "1",
    name: "Escolinha Gol de Placa",
    cidade: "São Paulo",
    estado: "SP",
    plano: "Pro",
    alunos: 145,
    receitaMensal: "R$ 8.420",
    status: "ATIVA",
    dataCriacao: "2024-03-15",
    ultimoPagamento: "2025-12-10",
  },
  {
    id: "2",
    name: "Futebol Raiz Academy",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    plano: "Enterprise",
    alunos: 289,
    receitaMensal: "R$ 12.800",
    status: "ATIVA",
    dataCriacao: "2023-11-20",
    ultimoPagamento: "2025-12-05",
  },
  {
    id: "3",
    name: "Pequenos Craques",
    cidade: "Belo Horizonte",
    estado: "MG",
    plano: "Básico",
    alunos: 68,
    receitaMensal: "R$ 3.200",
    status: "ATIVA",
    dataCriacao: "2025-01-10",
    ultimoPagamento: "2025-12-12",
  },
  {
    id: "4",
    name: "Futuros Campeões",
    cidade: "Porto Alegre",
    estado: "RS",
    plano: "Pro",
    alunos: 112,
    receitaMensal: "R$ 6.500",
    status: "PENDENTE",
    dataCriacao: "2025-06-05",
    ultimoPagamento: "2025-11-01",
  },
  {
    id: "5",
    name: "Escola do Gol",
    cidade: "Salvador",
    estado: "BA",
    plano: "Básico",
    alunos: 89,
    receitaMensal: "R$ 4.100",
    status: "SUSPENSA",
    dataCriacao: "2024-08-22",
    ultimoPagamento: "2025-10-15",
  },
];

const TenantsPage = () => {         //Inicio da função

    const [searchTerm, setSearchTerm] = useState("");

  const filtered = tenantsMock.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.estado.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      case "INATIVA": return "bg-gray-600";
      default: return "bg-gray-600";
    }
  };
    return ( 
        <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Escolinhas de Futebol</h1>
          <p className="text-gray-600">Gerencie todas as unidades da plataforma FutElite</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
          <Link href="/superadmin/tenants/novo">
            <Plus className="mr-2 h-5 w-5" />
            Nova Escolinha
          </Link>
        </Button>
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Buscar por nome, cidade ou estado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-11 h-12"
        />
      </div>

      {/* Lista de Tenants */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tenant) => (
          <Card key={tenant.id} className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 ring-4 ring-white">
                    <AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-600 text-white text-2xl font-bold">
                      {tenant.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{tenant.name}</CardTitle>
                    <p className="text-sm text-gray-600">{tenant.cidade} - {tenant.estado}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(tenant.status)}>
                  {tenant.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Plano</span>
                <Badge className={getPlanoColor(tenant.plano)}>
                  {tenant.plano}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{tenant.alunos} alunos</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-  text-green-600" />
                  <span className="font-medium">{tenant.receitaMensal}/mês</span>
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Criada em {new Date(tenant.dataCriacao).toLocaleDateString("pt-BR")}
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3" />
                  Último pagamento: {new Date(tenant.ultimoPagamento).toLocaleDateString("pt-BR")}
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/superadmin/tenants/${tenant.id}`}>
                    Ver detalhes
                  </Link>
                </Button>
                <Button size="sm" variant="outline">
                  Editar
                </Button>
                {tenant.status === "SUSPENSA" && (
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    Reativar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
     );
}
 
export default TenantsPage;