import { Injectable } from '@nestjs/common';
import { hashSenha } from '../auth/password.hasher.js';
import { ConflictError } from '../common/errors.js';
import { UsuarioRepository } from './usuarios.repository.js';
import type { CriarUsuarioDto } from './usuarios.schemas.js';

@Injectable()
export class UsuariosService {
  constructor(private readonly repo: UsuarioRepository) {}

  async criar(dto: CriarUsuarioDto) {
    if (await this.repo.buscarPorEmail(dto.email)) {
      throw new ConflictError('Já existe um usuário com este e-mail.');
    }
    return this.repo.criar({
      nome: dto.nome,
      email: dto.email,
      senhaHash: await hashSenha(dto.senha),
      perfil: dto.perfil,
    });
  }

  listar() {
    return this.repo.listar();
  }

  obter(id: number) {
    return this.repo.obter(id);
  }
}
