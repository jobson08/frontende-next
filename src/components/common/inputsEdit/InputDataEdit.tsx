/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/common/inputsEdit/InputDataEdit.tsx
import { Input } from "@/src/components/ui/input";
import { forwardRef } from "react";

interface InputDataEditProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  [key: string]: any;
}

const InputDataEdit = forwardRef<HTMLInputElement, InputDataEditProps>(
  ({ value = "", onChange, onBlur, placeholder = "dd/mm/aaaa", className, ...props }, ref) => {
    const formatData = (input: string) => {
      const cleaned = input.replace(/\D/g, "");
      if (cleaned.length <= 2) return cleaned;
      if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const formatted = formatData(rawValue);

      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: formatted,
        },
      };

      onChange?.(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
      // Se quiser valor limpo ou dd/mm/aaaa: ajuste aqui
    };

    return (
      <Input
        ref={ref}
        value={formatData(value)}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={10}
        inputMode="numeric"
        className={className}
        {...props}
      />
    );
  }
);

InputDataEdit.displayName = "InputDataEdit";

export default InputDataEdit;