import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ForbiddenError, UnauthorizedError } from '../common/errors.js';
import { IS_PUBLIC_KEY, ROLES_KEY } from './auth.decorators.js';
import type { Perfil, UsuarioAutenticado } from './auth.types.js';
import { TokenService } from './token.service.js';

export type RequestAutenticada = Request & { usuario?: UsuarioAutenticado };

/** Guard global: tudo exige login, exceto rotas @Public(); @Roles() restringe por perfil. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: TokenService,
  ) {}

  canActivate(contexto: ExecutionContext): boolean {
    const alvos = [contexto.getHandler(), contexto.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, alvos)) {
      return true;
    }

    const req = contexto.switchToHttp().getRequest<RequestAutenticada>();
    const [tipo, token] = (req.headers.authorization ?? '').split(' ');
    if (tipo !== 'Bearer' || !token) throw new UnauthorizedError();

    const usuario = this.tokens.verificar(token);
    req.usuario = usuario;

    const perfis = this.reflector.getAllAndOverride<Perfil[]>(ROLES_KEY, alvos);
    if (perfis?.length && !perfis.includes(usuario.perfil)) {
      throw new ForbiddenError();
    }
    return true;
  }
}
