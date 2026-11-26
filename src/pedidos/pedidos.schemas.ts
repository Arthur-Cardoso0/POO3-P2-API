import { z } from 'zod';
import { paginacaoSchema } from '../common/pagination.js';

export const STATUS = ['PENDENTE', 'CONFIRMADO', 'ENTREGUE', 'CANCELADO'] as const;

export const criarPedidoSchema = z.object({
  clienteNome: z.string().trim().min(2).max(100),
  clienteContato: z.string().trim().min(5, 'Informe telefone ou e-mail').max(100),
  observacao: z.string().trim().max(300).optional(),
  itens: z
    .array(
      z.object({
        produtoId: z.number().int().positive(),
        quantidade: z.number().int().min(1).max(100),
      }),
    )
    .min(1, 'O pedido precisa ter ao menos um item')
    .max(50),
  // LGPD: aviso de privacidade aceito antes de coletar os dados
  consentimento: z
    .boolean()
    .refine((v) => v === true, 'É necessário aceitar o aviso de privacidade'),
});
export type CriarPedidoDto = z.infer<typeof criarPedidoSchema>;

export const filtroPedidosSchema = paginacaoSchema.extend({
  status: z.enum(STATUS).optional(),
});
export type FiltroPedidosDto = z.infer<typeof filtroPedidosSchema>;

export const atualizarStatusSchema = z.object({ status: z.enum(STATUS) });
export type AtualizarStatusDto = z.infer<typeof atualizarStatusSchema>;
