// src/app/(dashboard)/treinador/mensagens/page.tsx
"use client";

import { useState } from "react";
import { Send, MessageSquare, Users, Trophy, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";

import { toast } from "sonner";
import { ScrollArea } from "@/src/components/ui/scroll-area";

interface Conversa {
  id: string;
  nome: string;
  ultimaMensagem: string;
  dataUltima: string;
  naoLidas?: number;
  tipo: "turma" | "aluno" | "aula_extra";
}

const MensagensTreinadorPage = () => {
  const [abaAtiva, setAbaAtiva] = useState("turmas");
  const [destinatarioSelecionado, setDestinatarioSelecionado] = useState<Conversa | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [busca, setBusca] = useState("");

  // Conversas mock
  const conversas: Conversa[] = [
    { id: "1", nome: "Sub-11", ultimaMensagem: "Treino de amanhã está confirmado!", dataUltima: "26/12", naoLidas: 0, tipo: "turma" },
    { id: "2", nome: "Sub-13", ultimaMensagem: "Obrigado pelo jogo de hoje!", dataUltima: "Hoje", naoLidas: 2, tipo: "turma" },
    { id: "3", nome: "Sub-15", ultimaMensagem: "Professor, posso faltar amanhã?", dataUltima: "Hoje", naoLidas: 1, tipo: "turma" },
    { id: "4", nome: "Enzo Gabriel", ultimaMensagem: "Adorei a aula extra de hoje!", dataUltima: "Hoje", naoLidas: 0, tipo: "aluno" },
    { id: "5", nome: "Pedro Silva", ultimaMensagem: "Valeu pela dica de finalização!", dataUltima: "25/12", naoLidas: 0, tipo: "aula_extra" },
    { id: "6", nome: "Maria Luiza", ultimaMensagem: "Professor, quando tem mais aula de goleiro?", dataUltima: "24/12", naoLidas: 3, tipo: "aula_extra" },
  ];

  // Mensagens da conversa selecionada
  const mensagensConversa = destinatarioSelecionado ? [
    { de: "outro", texto: "Professor, o Enzo pode ir amanhã?", hora: "14:30" },
    { de: "eu", texto: "Pode sim! Treino normal às 18h.", hora: "14:35" },
    { de: "outro", texto: "Obrigado!", hora: "14:36" },
  ] : [];

  const enviarMensagem = () => {
    if (!mensagem.trim() || !destinatarioSelecionado) return;

    let toastMsg = "Mensagem enviada com sucesso!";

    // LÓGICA ESPECIAL PARA AULA EXTRA
    if (destinatarioSelecionado.tipo === "aula_extra") {
      toastMsg = "Resumo da aula extra enviado ao responsável!";
      // Em produção: poderia gerar template automático tipo:
      // "Olá! Hoje trabalhamos finalização. Enzo acertou 8/10 chutes. Ponto forte: potência. A melhorar: precisão no canto esquerdo."
    }

    toast.success(toastMsg, {
      description: `Para: ${destinatarioSelecionado.nome}`,
    });
    setMensagem("");
  };

  const conversasFiltradas = conversas.filter(c => 
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 h-full">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold flex items-center gap-4 mb-8">
          <MessageSquare className="h-12 w-12 text-blue-600" />
          Mensagens
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Lista de Conversas */}
          <Card className="lg:col-span-1 h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Conversas</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="turmas">Turmas</TabsTrigger>
                  <TabsTrigger value="alunos">Alunos</TabsTrigger>
                  <TabsTrigger value="extras">Extras</TabsTrigger>
                </TabsList>

                <TabsContent value={abaAtiva} className="mt-0">
                  <ScrollArea className="h-96">
                    <div className="space-y-2 p-4">
                      {conversasFiltradas
                        .filter(c => 
                          abaAtiva === "turmas" ? c.tipo === "turma" :
                          abaAtiva === "alunos" ? c.tipo === "aluno" :
                          c.tipo === "aula_extra"
                        )
                        .map((conversa) => (
                        <button
                          key={conversa.id}
                          onClick={() => setDestinatarioSelecionado(conversa)}
                          className={`w-full text-left p-4 rounded-lg transition-all ${
                            destinatarioSelecionado?.id === conversa.id 
                              ? "bg-blue-100 border-blue-400" 
                              : "hover:bg-gray-100"
                          } border`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {conversa.tipo === "turma" ? <Users className="h-5 w-5" /> :
                                   conversa.tipo === "aula_extra" ? <Trophy className="h-5 w-5" /> :
                                   conversa.nome.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{conversa.nome}</p>
                                <p className="text-sm text-gray-600 truncate w-40">
                                  {conversa.ultimaMensagem}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">{conversa.dataUltima}</p>
                              {conversa.naoLidas ? (
                                <Badge className="mt-1 bg-red-600">{conversa.naoLidas}</Badge>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="lg:col-span-2 h-full flex flex-col">
            {destinatarioSelecionado ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {destinatarioSelecionado.tipo === "turma" ? <Users /> :
                         destinatarioSelecionado.tipo === "aula_extra" ? <Trophy /> :
                         destinatarioSelecionado.nome.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{destinatarioSelecionado.nome}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {destinatarioSelecionado.tipo === "turma" ? "Turma completa" :
                         destinatarioSelecionado.tipo === "aula_extra" ? "Aula Extra Individual" :
                         "Aluno individual"}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4 py-4">
                      {mensagensConversa.map((msg, i) => (
                        <div key={i} className={`flex ${msg.de === "eu" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-xs px-4 py-3 rounded-2xl ${
                            msg.de === "eu" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
                          }`}>
                            <p>{msg.texto}</p>
                            <p className={`text-xs mt-1 ${msg.de === "eu" ? "text-blue-200" : "text-gray-500"}`}>
                              {msg.hora}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Input de mensagem */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex gap-3">
                      <Textarea
                        placeholder="Escreva sua mensagem..."
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                        className="flex-1 resize-none"
                        rows={3}
                      />
                      <Button 
                        size="icon" 
                        className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 self-end"
                        onClick={enviarMensagem}
                        disabled={!mensagem.trim()}
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="h-20 w-20 mx-auto mb-4 text-gray-300" />
                  <p className="text-xl">Selecione uma conversa para começar</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MensagensTreinadorPage;