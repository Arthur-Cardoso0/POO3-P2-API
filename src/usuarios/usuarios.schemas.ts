import { z } from 'zod';

export const criarUsuarioSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  senha: z.string().min(8, 'A senha deve ter ao menos 8 caracteres').max(72),
  perfil: z.enum(['ADMIN', 'OPERADOR']).default('OPERADOR'),
});
export type CriarUsuarioDto = z.infer<typeof criarUsuarioSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  senha: z.string().min(1),
});
export type LoginDto = z.infer<typeof loginSchema>;
