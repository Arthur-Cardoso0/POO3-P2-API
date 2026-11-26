import { Injectable } from '@nestjs/common';
import { RepositorioBase } from '../common/repository.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { NovoUsuario, Usuario, UsuarioComSenha } from './usuarios.types.js';

/** Abstração usada pelos serviços (e substituída por um fake nos testes). */
export abstract class UsuarioRepository extends RepositorioBase<Usuario, NovoUsuario> {
  protected readonly entidade = 'Usuário';
  abstract buscarPorEmail(email: string): Promise<UsuarioComSenha | null>;
  abstract listar(): Promise<Usuario[]>;
}

const selecaoPublica = {
  id: true,
  nome: true,
  email: true,
  perfil: true,
  criadoEm: true,
} as const;

@Injectable()
export class PrismaUsuarioRepository extends UsuarioRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  buscarPorId(id: number) {
    return this.prisma.usuario.findUnique({ where: { id }, select: selecaoPublica });
  }

  buscarPorEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  criar(dados: NovoUsuario) {
    return this.prisma.usuario.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        senha: dados.senhaHash,
        perfil: dados.perfil,
      },
      select: selecaoPublica,
    });
  }

  listar() {
    return this.prisma.usuario.findMany({ select: selecaoPublica, orderBy: { nome: 'asc' } });
  }
}
