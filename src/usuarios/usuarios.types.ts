import type { Perfil } from '../auth/auth.types.js';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  criadoEm: Date;
}

/** Usuário com o hash da senha: só circula entre repositório e serviço de autenticação. */
export interface UsuarioComSenha extends Usuario {
  senha: string;
}

export interface NovoUsuario {
  nome: string;
  email: string;
  senhaHash: string;
  perfil: Perfil;
}
