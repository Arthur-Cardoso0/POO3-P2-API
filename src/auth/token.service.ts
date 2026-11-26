import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../common/errors.js';
import type { Perfil, UsuarioAutenticado } from './auth.types.js';

@Injectable()
export class TokenService {
  private get segredo(): string {
    const segredo = process.env.JWT_SECRET;
    if (!segredo || segredo.length < 16) {
      throw new Error('Defina JWT_SECRET (mín. 16 caracteres) nas variáveis de ambiente.');
    }
    return segredo;
  }

  gerar(usuario: UsuarioAutenticado): string {
    return jwt.sign({ perfil: usuario.perfil }, this.segredo, {
      subject: String(usuario.id),
      expiresIn: '8h',
    });
  }

  verificar(token: string): UsuarioAutenticado {
    try {
      const payload = jwt.verify(token, this.segredo) as jwt.JwtPayload;
      return { id: Number(payload.sub), perfil: payload.perfil as Perfil };
    } catch {
      throw new UnauthorizedError('Token inválido ou expirado.');
    }
  }
}
