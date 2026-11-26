import { NotFoundError } from './errors.js';
import type { PaginatedResponse } from './pagination.js';

/** Contrato genérico dos repositórios (T = entidade, TCriar = dados de criação). */
export interface IRepository<T, TCriar> {
  buscarPorId(id: number): Promise<T | null>;
  criar(dados: TCriar): Promise<T>;
}

/** Contrato genérico para repositórios que listam com filtro e paginação. */
export interface IListavel<T, TFiltro> {
  listar(filtro: TFiltro): Promise<PaginatedResponse<T>>;
}

/**
 * Classe abstrata base: concentra a regra comum "buscar ou lançar NotFoundError".
 * As subclasses (Prisma ou fakes de teste) só implementam o acesso a dados.
 */
export abstract class RepositorioBase<T, TCriar> implements IRepository<T, TCriar> {
  protected abstract readonly entidade: string;

  abstract buscarPorId(id: number): Promise<T | null>;
  abstract criar(dados: TCriar): Promise<T>;

  async obter(id: number): Promise<T> {
    const encontrado = await this.buscarPorId(id);
    if (!encontrado) throw new NotFoundError(this.entidade, id);
    return encontrado;
  }
}
