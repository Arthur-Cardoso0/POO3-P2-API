import { Injectable } from '@nestjs/common';
import { NotFoundError } from '../common/errors.js';
import { CategoriaRepository } from '../categorias/categorias.js';
import { ProdutoRepository } from './produtos.repository.js';
import type { AtualizarProdutoDto, CriarProdutoDto, FiltroProdutosDto } from './produtos.schemas.js';

@Injectable()
export class ProdutosService {
  constructor(
    private readonly produtos: ProdutoRepository,
    private readonly categorias: CategoriaRepository,
  ) {}

  /** Vitrine pública: só produtos ativos. */
  listarPublico(filtro: FiltroProdutosDto) {
    return this.produtos.listar({ ...filtro, apenasAtivos: true });
  }

  /** Área de gestão: inclui produtos desativados. */
  listarTodos(filtro: FiltroProdutosDto) {
    return this.produtos.listar({ ...filtro, apenasAtivos: false });
  }

  async obterPublico(id: number) {
    const produto = await this.produtos.obter(id);
    if (!produto.ativo) throw new NotFoundError('Produto', id);
    return produto;
  }

  async criar(dto: CriarProdutoDto) {
    await this.categorias.obter(dto.categoriaId);
    return this.produtos.criar(dto);
  }

  async atualizar(id: number, dto: AtualizarProdutoDto) {
    await this.produtos.obter(id);
    if (dto.categoriaId !== undefined) await this.categorias.obter(dto.categoriaId);
    return this.produtos.atualizar(id, dto);
  }

  /** "Remover" desativa o produto: os pedidos antigos continuam apontando para ele. */
  async desativar(id: number) {
    await this.produtos.obter(id);
    await this.produtos.atualizar(id, { ativo: false });
  }
}
