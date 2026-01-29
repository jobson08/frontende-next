/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/common/inputsEdit/InputCPFEdit.tsx
import { Input } from "@/src/components/ui/input";
import { forwardRef } from "react";

interface InputCPFEditProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  [key: string]: any;
}

const InputCPFEdit = forwardRef<HTMLInputElement, InputCPFEditProps>(
  ({ value = "", onChange, onBlur, placeholder = "000.000.000-00", className, ...props }, ref) => {
    const formatCPF = (input: string) => {
      const cleaned = input.replace(/\D/g, "");
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
      if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const formatted = formatCPF(rawValue);

      // Cria evento sintético com valor formatado (mantém máscara no visual)
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: formatted,
        },
      };

      // Passa para o RHF (pode ser formatado ou limpo — escolha abaixo)
      onChange?.(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
      // Se quiser valor limpo no form: onChange?.(rawValue.replace(/\D/g, ""));
    };

    return (
      <Input
        ref={ref}
        value={formatCPF(value)}  // ← formata sempre o value externo
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={14}
        inputMode="numeric"
        className={className}
        {...props}
      />
    );
  }
);

InputCPFEdit.displayName = "InputCPFEdit";

export default InputCPFEdit;