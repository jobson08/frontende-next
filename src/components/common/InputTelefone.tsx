/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/common/InputTelefone.tsx
import { Input } from "@/src/components/ui/input";
import { forwardRef, useState } from "react";

interface InputTelefoneProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  name?: string;
  [key: string]: any;
}

const InputTelefone = forwardRef<HTMLInputElement, InputTelefoneProps>(
  ({ value = "", onChange, onBlur, name, ...props }, ref) => {
    const [formatted, setFormatted] = useState(value);

    const formatarTelefone = (input: string) => {
      const cleaned = input.replace(/\D/g, "");
      if (cleaned.length <= 2) return cleaned;
      if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const newFormatted = formatarTelefone(rawValue);
      setFormatted(newFormatted);

      // Passa o evento completo para o RHF
      onChange?.(e);
    };

    return (
      <Input
        ref={ref}
        value={formatted}
        onChange={handleChange}
        onBlur={onBlur}
        name={name}
        placeholder="(11) 99999-8888"
        maxLength={15}
        inputMode="tel"
        {...props}
      />
    );
  }
);

InputTelefone.displayName = "InputTelefone";

export default InputTelefone;