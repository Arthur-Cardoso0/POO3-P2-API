import { z } from 'zod';
import { paginacaoSchema } from '../common/pagination.js';

export const criarProdutoSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  descricao: z.string().trim().max(1000).default(''),
  preco: z.number().positive('O preço deve ser maior que zero').max(1_000_000),
  estoque: z.number().int().min(0).default(0),
  imagemUrl: z.string().trim().max(500).nullish(),
  categoriaId: z.number().int().positive(),
});
export type CriarProdutoDto = z.infer<typeof criarProdutoSchema>;

export const atualizarProdutoSchema = criarProdutoSchema
  .partial()
  .extend({ ativo: z.boolean().optional() })
  .refine((d) => Object.keys(d).length > 0, 'Informe ao menos um campo para atualizar');
export type AtualizarProdutoDto = z.infer<typeof atualizarProdutoSchema>;

export const filtroProdutosSchema = paginacaoSchema.extend({
  busca: z.string().trim().max(80).optional(),
  categoriaId: z.coerce.number().int().positive().optional(),
});
export type FiltroProdutosDto = z.infer<typeof filtroProdutosSchema>;
