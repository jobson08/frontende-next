// types/react-input-mask.d.ts
import * as React from "react";

declare module "react-input-mask" {
  interface InputMaskProps extends React.InputHTMLAttributes<HTMLInputElement> {
    mask: string;
    maskChar?: string | null;
    formatChars?: { [key: string]: string };
    alwaysShowMask?: boolean;
    inputRef?: React.Ref<HTMLInputElement>;
  }

  const InputMask: React.ForwardRefExoticComponent<
    InputMaskProps & React.RefAttributes<HTMLInputElement>
  >;

  export default InputMask;
}