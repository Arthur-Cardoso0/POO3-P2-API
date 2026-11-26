import { Injectable } from '@nestjs/common';
import { UnauthorizedError } from '../common/errors.js';
import { UsuarioRepository } from '../usuarios/usuarios.repository.js';
import { verificarSenha } from './password.hasher.js';
import { TokenService } from './token.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly tokens: TokenService,
  ) {}

  async login(email: string, senha: string) {
    const usuario = await this.usuarios.buscarPorEmail(email);
    // Mesma mensagem para e-mail inexistente e senha errada (não revela quais e-mails existem).
    if (!usuario || !(await verificarSenha(senha, usuario.senha))) {
      throw new UnauthorizedError('E-mail ou senha incorretos.');
    }
    const { senha: _senha, ...publico } = usuario;
    return {
      token: this.tokens.gerar({ id: usuario.id, perfil: usuario.perfil }),
      usuario: publico,
    };
  }
}
