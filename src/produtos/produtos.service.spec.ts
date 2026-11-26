import { CategoriaRepository, type Categoria } from '../categorias/categorias.js';
import { NotFoundError } from '../common/errors.js';
import { ProdutoRepository } from './produtos.repository.js';
import { ProdutosService } from './produtos.service.js';
import type { AtualizacaoProduto, NovoProduto, Produto } from './produtos.types.js';

class FakeCategorias extends CategoriaRepository {
  async buscarPorId(id: number): Promise<Categoria | null> {
    return id === 1 ? { id: 1, nome: 'Alimentos' } : null;
  }
  async buscarPorNome() { return null; }
  async criar(): Promise<Categoria> { return { id: 1, nome: 'x' }; }
  async listar() { return []; }
}

class FakeProdutos extends ProdutoRepository {
  dados = new Map<number, Produto>();
  async buscarPorId(id: number) { return this.dados.get(id) ?? null; }
  async criar(d: NovoProduto) {
    const p: Produto = {
      id: this.dados.size + 1, ...d, imagemUrl: d.imagemUrl ?? null, ativo: true,
      categoria: { id: d.categoriaId, nome: 'Alimentos' }, criadoEm: new Date(),
    };
    this.dados.set(p.id, p);
    return p;
  }
  async atualizar(id: number, d: AtualizacaoProduto) {
    const p = { ...this.dados.get(id)!, ...d } as Produto;
    this.dados.set(id, p);
    return p;
  }
  async listar() { return { itens: [], total: 0, pagina: 1, limite: 10, totalPaginas: 1 }; }
}

describe('ProdutosService', () => {
  let repo: FakeProdutos;
  let service: ProdutosService;
  const dto = { nome: 'Mel', descricao: '', preco: 20, estoque: 5, categoriaId: 1 };

  beforeEach(() => {
    repo = new FakeProdutos();
    service = new ProdutosService(repo, new FakeCategorias());
  });

  it('cria produto em categoria existente', async () => {
    expect((await service.criar(dto)).nome).toBe('Mel');
  });

  it('rejeita categoria inexistente', async () => {
    await expect(service.criar({ ...dto, categoriaId: 9 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('desativar esconde o produto da vitrine pública', async () => {
    const p = await service.criar(dto);
    await service.desativar(p.id);
    await expect(service.obterPublico(p.id)).rejects.toBeInstanceOf(NotFoundError);
  });
});
