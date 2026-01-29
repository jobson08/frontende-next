/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/common/InputCPF.tsx
import { Input } from "@/src/components/ui/input";
import { forwardRef, useState } from "react";

interface InputCPFProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  name?: string;
  [key: string]: any;
}

const InputCPF = forwardRef<HTMLInputElement, InputCPFProps>(
  ({ value = "", onChange, onBlur, name, ...props }, ref) => {
    const [formatted, setFormatted] = useState(value);

    const formatarCPF = (input: string) => {
      const cleaned = input.replace(/\D/g, "");
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
      if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const newFormatted = formatarCPF(rawValue);
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
        placeholder="123.456.789-00"
        maxLength={14}
        inputMode="numeric"
        {...props}
      />
    );
  }
);

InputCPF.displayName = "InputCPF";

export default InputCPF;