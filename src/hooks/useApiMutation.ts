/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useApiMutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type MutationOptions = {
  successMessage?: string;
  errorMessage?: string;
  invalidateQueries?: string[];
  onSuccessCallback?: () => void;
};

export const useApiMutation = <TData, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: MutationOptions = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,

    onSuccess: (data, variables) => {
      if (options.successMessage) {
        toast.success(options.successMessage);
      }

      // Atualiza automaticamente as listas
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }

      if (options.onSuccessCallback) {
        options.onSuccessCallback();
      }
    },

    onError: (err: any, variables) => {
      const status = err.response?.status;
      const serverMessage = err.response?.data?.error || err.message || "Erro desconhecido";

      // Tratamento inteligente por código de status
      switch (status) {
        case 400:
          toast.error("Dados inválidos", { description: serverMessage });
          break;

        case 404:
          toast.error("Registro não encontrado", { description: serverMessage });
          break;

        case 409:
          toast.error("Conflito", { 
            description: serverMessage || "Este registro já existe (ex: e-mail duplicado)" 
          });
          break;

        case 403:
          toast.error("Acesso negado", { description: "Você não tem permissão para esta ação" });
          break;

        default:
          toast.error(options.errorMessage || "Erro na operação", {
            description: serverMessage,
          });
      }

      console.error(`Erro na operação com variáveis:`, variables, err);
    },
  });
};