// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// src/lib/date-utils.ts
export const formatDateBR = (isoDate: string | Date | null | undefined): string => {
  if (!isoDate) return "—";

  // Se já for string no formato YYYY-MM-DD, retorna formatado
  if (typeof isoDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(isoDate)) {
    const [year, month, day] = isoDate.split('-');
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  // Se for Date ou ISO completo, extrai apenas a parte da data (ignora hora/fuso)
  let dateObj: Date;
  if (isoDate instanceof Date) {
    dateObj = isoDate;
  } else {
    dateObj = new Date(isoDate);
  }

  // Extrai ano/mês/dia em UTC para evitar offset local
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getUTCDate()).padStart(2, '0');

  return `${day}/${month}/${year}`;
};

// Função auxiliar para comparar datas sem hora/fuso (útil para status)
export const isDateBeforeToday = (isoDate: string): boolean => {
  if (!isoDate) return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const [year, month, day] = isoDate.split('-').map(Number);
  const dataTreino = new Date(year, month - 1, day);

  return dataTreino < hoje;
};