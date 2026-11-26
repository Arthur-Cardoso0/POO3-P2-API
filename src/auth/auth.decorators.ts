import { SetMetadata } from '@nestjs/common';
import type { Perfil } from './auth.types.js';

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

/** Rota aberta (parte pública do sistema, sem login). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Restringe a rota a determinados perfis. Sem @Roles, qualquer usuário logado entra. */
export const Roles = (...perfis: Perfil[]) => SetMetadata(ROLES_KEY, perfis);
