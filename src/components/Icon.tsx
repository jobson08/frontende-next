// src/components/Icon.tsx
import Image from "next/image";

interface IconProps {
  name: string;
  className?: string;
  width?: number;
  height?: number;
}

const iconMap: Record<string, string> = {
  home: "/icones/home.svg",
  trophy: "/icones/trophy.svg",
  calendar: "/icones/calendar.svg",
  users: "/icones/users.svg",
  dollar: "/icones/dollar-sign.svg",
  message: "/icones/message-square.svg",
  settings: "/icones/settings.svg",
  logout: "/icones/logout.svg",
  book: "/icones/book-open.svg",
  star: "/icones/star.svg",
  // adicione mais conforme necessário
};

export default function Icon({ name, className = "h-5 w-5", width = 20, height = 20 }: IconProps) {
  const src = iconMap[name];

  if (!src) {
    console.warn(`Ícone "${name}" não encontrado`);
    return null;
  }

  return (
    <Image
      src={src}
      alt={name}
      width={width}
      height={height}
      className={className}
      priority={false}
    />
  );
}