/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/common/inputsEdit/InputTelefoneEdit.tsx
import { Input } from "@/src/components/ui/input";
import { forwardRef } from "react";

interface InputTelefoneEditProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  [key: string]: any;
}

const InputTelefoneEdit = forwardRef<HTMLInputElement, InputTelefoneEditProps>(
  ({ value = "", onChange, onBlur, placeholder = "(xx) xxxxx-xxxx", className, ...props }, ref) => {
    const formatTelefone = (input: string) => {
      const cleaned = input.replace(/\D/g, "");
      if (cleaned.length <= 2) return cleaned;
      let formatted = `(${cleaned.slice(0, 2)}) `;
      if (cleaned.length > 2) {
        if (cleaned.length <= 7) {
          formatted += cleaned.slice(2);
        } else {
          formatted += `${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
        }
      }
      return formatted;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const formatted = formatTelefone(rawValue);

      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: formatted,
        },
      };

      onChange?.(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
      // Se quiser valor limpo: onChange?.(rawValue.replace(/\D/g, ""));
    };

    return (
      <Input
        ref={ref}
        value={formatTelefone(value)}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={15}
        inputMode="tel"
        className={className}
        {...props}
      />
    );
  }
);

InputTelefoneEdit.displayName = "InputTelefoneEdit";

export default InputTelefoneEdit;