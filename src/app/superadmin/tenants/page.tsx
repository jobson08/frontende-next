// src/app/superadmin/tenants/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, Plus, DollarSign, Users, Calendar, AlertCircle, Edit, Eye } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Pagination } from "@/src/components/common/Pagination";

interface Escolinha {
  id: string;
  nome: string;
  cidade?: string;
  estado?: string;
  planoSaaS: "basico" | "pro" | "enterprise";
  valorPlanoMensal: number;
  statusPagamentoSaaS: "ativo" | "atrasado" | "suspenso" | "cancelado";
  createdAt: string; // ← usa createdAt (vem do Prisma)
  dataInicioPlano?: string; // opcional
  logoUrl?: string;
  // Dados que podemos calcular ou mockear por enquanto
  totalAlunos: number;
  receitaMensal: number;
}

const TenantsPage = () => {
  const [escolinhas, setEscolinhas] = useState<Escolinha[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
// Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // padrão 10 cards por página

  useEffect(() => {
    const fetchEscolinhas = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Sessão expirada. Faça login novamente.");
          return;
        }

        const res = await fetch("http://localhost:4000/api/v1/superadmin/escolinhas", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || "Erro ao carregar escolinhas");
            }

            const result = await res.json();
            // Mapeia os dados do backend pra interface
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mapped: Escolinha[] = result.data.map((e: any) => ({
              id: e.id,
              nome: e.nome,
              cidade: e.endereco?.split('-')[1]?.trim() || "Não informado",
              estado: e.endereco?.split('-')[0]?.split(',')[1]?.trim() || "SP",
              planoSaaS: e.planoSaaS,
              valorPlanoMensal: e.valorPlanoMensal,
              statusPagamentoSaaS: e.statusPagamentoSaaS,
              createdAt: e.createdAt,
              dataInicioPlano: e.dataInicioPlano,
              logoUrl: e.logoUrl,
              totalAlunos: 0, // mock até ter rota real
              receitaMensal: e.valorPlanoMensal, // receita do SaaS
            }));

            setEscolinhas(mapped);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            toast.error("Erro ao carregar lista de escolinhas", {
              description: error.message,
            });
          } finally {
            setIsLoading(false);
          }
        };

        fetchEscolinhas();
      }, []);

      const filtered = escolinhas.filter(t =>
        t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.cidade?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.estado?.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      // Paginação aplicada na lista filtrada
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
        const totalPages = Math.ceil(filtered.length / itemsPerPage);

        const getPlanoColor = (plano: string) => {
          switch (plano) {
            case "enterprise": return "bg-gradient-to-r from-purple-600 to-pink-600 text-white";
            case "pro": return "bg-gradient-to-r from-blue-600 to-cyan-600 text-white";
            case "basico": return "bg-gradient-to-r from-green-600 to-emerald-600 text-white";
            default: return "bg-gray-600 text-white";
          }
  };

      const getStatusColor = (status: string) => {
        switch (status) {
          case "ativo": return "bg-green-600";
          case "atrasado": return "bg-orange-600";
          case "suspenso": return "bg-red-600";
          case "cancelado": return "bg-gray-600";
          default: return "bg-gray-600";
        }
};

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
        <span className="ml-4 text-xl">Carregando escolinhas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Escolinhas de Futebol</h1>
          <p className="text-gray-600">Gerencie todas as unidades da plataforma FutElite</p>
        </div>
        <Button asChild className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
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

{/* Lista paginada */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full py-12 text-lg">
            {escolinhas.length === 0 ? "Nenhuma escolinha cadastrada ainda." : "Nenhuma escolinha encontrada com esse filtro."}
            <br />
            <Link href="/superadmin/tenants/novo" className="text-green-600 hover:underline">
              Crie a primeira agora!
            </Link>
          </p>
        ) : (
          paginated.map((escolinha) => (
            <Card key={escolinha.id} className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 ring-4 ring-white shadow-lg">
                      <AvatarImage src={escolinha.logoUrl ?? undefined} alt={escolinha.nome} />
                      <AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-600 text-white text-2xl font-bold">
                        {escolinha.nome.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{escolinha.nome}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {escolinha.cidade} - {escolinha.estado}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(escolinha.statusPagamentoSaaS)}>
                    {escolinha.statusPagamentoSaaS.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Plano</span>
                  <Badge className={getPlanoColor(escolinha.planoSaaS)}>
                    {escolinha.planoSaaS.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{escolinha.totalAlunos|| 0 } alunos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">
                      {formatCurrency(escolinha.receitaMensal)}/mês
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    Criada em {formatDate(escolinha.createdAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3" />
                    Próxima cobrança: {formatDate(escolinha.dataInicioPlano || escolinha.createdAt)}
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/superadmin/tenants/${escolinha.id}`}>
                      <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    <Link href={`/superadmin/tenants/${escolinha.id}/editar`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Paginação no final */}
      {filtered.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(value) => {
            setItemsPerPage(value);
            setCurrentPage(1); // reseta para primeira página ao mudar o limite
          }}
          className="mt-8"
        />
      )}
    </div>
  );
};

export default TenantsPage;