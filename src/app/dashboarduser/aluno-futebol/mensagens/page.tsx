// src/app/dashboarduser/aluno-dashboard/mensagens/page.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MessageSquare, Mail, Calendar, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { cn } from "@/lib/utils";

const MensagensPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTreinador, setFiltroTreinador] = useState("todos");

  // Mock de mensagens recebidas
  const mensagensMock = [
    {
      id: "1",
      titulo: "Parabéns pelo desempenho!",
      mensagem: "Pedro, você foi destaque no treino de terça! Continue com essa garra na finalização. Vamos trabalhar mais isso no próximo treino.",
      treinador: "Rafael Lima",
      data: new Date(2025, 11, 24), // 24/12/2025
      lida: false,
    },
    {
      id: "2",
      titulo: "Treino de sábado confirmado",
      mensagem: "O amistoso de sábado está confirmado! Cheguem às 8:30 para aquecimento. Tragam chuteira society e garrafa d'água.",
      treinador: "Rafael Lima",
      data: new Date(2025, 11, 23),
      lida: true,
    },
    {
      id: "3",
      titulo: "Foco na preparação física",
      mensagem: "Essa semana vamos intensificar a preparação física. Tragam tênis confortável e venham hidratados!",
      treinador: "Carlos Souza",
      data: new Date(2025, 11, 22),
      lida: true,
    },
    {
      id: "4",
      titulo: "Ótimo jogo coletivo!",
      mensagem: "Equipe jogou muito bem hoje! Destaque para as trocas de passe rápidas. Vamos manter esse ritmo!",
      treinador: "Mariana Costa",
      data: new Date(2025, 11, 20),
      lida: false,
    },
  ];

  const treinadores = ["todos", "Rafael Lima", "Mariana Costa", "Carlos Souza"];

  const mensagensFiltradas = mensagensMock.filter((msg) => {
    const buscaMatch = 
      msg.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.mensagem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.treinador.toLowerCase().includes(searchTerm.toLowerCase());

    const treinadorMatch = filtroTreinador === "todos" || msg.treinador === filtroTreinador;

    return buscaMatch && treinadorMatch;
  });

  const naoLidas = mensagensFiltradas.filter(m => !m.lida).length;

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-blue-600" />
          Mensagens
        </h1>
        <p className="text-gray-600 text-lg mt-2">
          Comunicados dos treinadores e avisos importantes
        </p>
        {naoLidas > 0 && (
          <Badge className="mt-3 bg-red-600 text-lg px-4 py-1">
            {naoLidas} não lida{naoLidas > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar mensagens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filtroTreinador} onValueChange={setFiltroTreinador}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Todos os treinadores" />
          </SelectTrigger>
          <SelectContent>
            {treinadores.map((treinador) => (
              <SelectItem key={treinador} value={treinador}>
                {treinador === "todos" ? "Todos os treinadores" : treinador}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Mensagens */}
      <div className="space-y-6">
        {mensagensFiltradas.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma mensagem encontrada</p>
            </CardContent>
          </Card>
        ) : (
          mensagensFiltradas.map((msg) => (
            <Card 
              key={msg.id} 
              className={cn(
                "hover:shadow-lg transition-shadow cursor-pointer",
                !msg.lida && "border-blue-400 bg-blue-50"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                      {msg.treinador}
                      {!msg.lida && <Badge className="bg-blue-600">Nova</Badge>}
                    </CardTitle>
                    <p className="text-lg font-medium mt-2">{msg.titulo}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center gap-1 justify-end">
                      <Calendar className="h-4 w-4" />
                      {format(msg.data, "dd/MM/yyyy")}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{msg.mensagem}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MensagensPage;