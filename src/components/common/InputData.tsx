/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/common/InputData.tsx
import { Input } from "@/src/components/ui/input";
import { forwardRef, useState } from "react";

interface InputDataProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  name?: string;
  [key: string]: any;
}

const InputData = forwardRef<HTMLInputElement, InputDataProps>(
  ({ value = "", onChange, onBlur, name, ...props }, ref) => {
    const [formatted, setFormatted] = useState(value);

    const formatarData = (input: string) => {
      const cleaned = input.replace(/\D/g, "");
      if (cleaned.length <= 2) return cleaned;
      if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const newFormatted = formatarData(rawValue);
      setFormatted(newFormatted);

      // Chama o onChange do RHF com o evento completo (obrigatório!)
      onChange?.(e);
    };

    return (
      <Input
        ref={ref}
        value={formatted}
        onChange={handleChange}
        onBlur={onBlur}
        name={name}
        placeholder="dd/mm/aaaa"
        maxLength={10}
        inputMode="numeric"
        {...props}
      />
    );
  }
);

InputData.displayName = "InputData";

export default InputData;