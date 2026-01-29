/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/common/InputValorMonetario.tsx
import { Input } from "@/src/components/ui/input";
import { forwardRef, useState } from "react";

interface InputValorMonetarioProps {
  value?: string | number;
  onChange?: (value: number) => void;
  placeholder?: string;
  [key: string]: any;
}

const InputValorMonetario = forwardRef<HTMLInputElement, InputValorMonetarioProps>(
  ({ value = "", onChange, placeholder = "0,00", ...props }, ref) => {
    const [formatted, setFormatted] = useState("");

    const formatarValor = (input: string) => {
      // Remove tudo que não é número ou vírgula
      let cleaned = input.replace(/[^\d,]/g, "");

      // Garante no máximo duas casas decimais
      const parts = cleaned.split(",");
      if (parts.length > 2) {
        cleaned = parts[0] + "," + parts.slice(1).join("");
      }
      if (parts[1]?.length > 2) {
        cleaned = parts[0] + "," + parts[1].slice(0, 2);
      }

      // Adiciona R$ e formata com pontos
      const numeric = parseFloat(cleaned.replace(",", ".")) || 0;
      return numeric.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/[^\d,]/g, "");
      const newFormatted = formatarValor(rawValue);
      setFormatted(newFormatted);

      // Envia o valor numérico limpo para o form
      const numericValue = parseFloat(rawValue.replace(",", ".")) || 0;
      onChange?.(numericValue);
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
        <Input
          ref={ref}
          value={formatted}
          onChange={handleChange}
          placeholder={placeholder}
          className="pl-10"
          inputMode="decimal"
          {...props}
        />
      </div>
    );
  }
);

InputValorMonetario.displayName = "InputValorMonetario";

export default InputValorMonetario;