export type Perfil = 'ADMIN' | 'OPERADOR';

export interface UsuarioAutenticado {
  id: number;
  perfil: Perfil;
}
