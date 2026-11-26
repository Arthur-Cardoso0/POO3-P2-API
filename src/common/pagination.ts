import { z } from 'zod';

/** Resposta paginada genérica, reutilizada por todas as listagens. */
export interface PaginatedResponse<T> {
  itens: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export function paginar<T>(
  itens: T[],
  total: number,
  pagina: number,
  limite: number,
): PaginatedResponse<T> {
  return {
    itens,
    total,
    pagina,
    limite,
    totalPaginas: Math.max(1, Math.ceil(total / limite)),
  };
}

export const paginacaoSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(50).default(12),
});

export type Paginacao = z.infer<typeof paginacaoSchema>;
