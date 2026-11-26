import { Injectable } from '@nestjs/common';
import { paginar, type PaginatedResponse } from '../common/pagination.js';
import { RepositorioBase, type IListavel } from '../common/repository.js';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  AtualizacaoProduto,
  FiltroProdutos,
  NovoProduto,
  Produto,
} from './produtos.types.js';

export abstract class ProdutoRepository
  extends RepositorioBase<Produto, NovoProduto>
  implements IListavel<Produto, FiltroProdutos>
{
  protected readonly entidade = 'Produto';
  abstract listar(filtro: FiltroProdutos): Promise<PaginatedResponse<Produto>>;
  abstract atualizar(id: number, dados: AtualizacaoProduto): Promise<Produto>;
}

const incluirCategoria = { categoria: { select: { id: true, nome: true } } } as const;
type LinhaProduto = Prisma.ProdutoGetPayload<{ include: typeof incluirCategoria }>;

function paraProduto(l: LinhaProduto): Produto {
  return {
    id: l.id,
    nome: l.nome,
    descricao: l.descricao,
    preco: l.preco.toNumber(),
    estoque: l.estoque,
    imagemUrl: l.imagemUrl,
    ativo: l.ativo,
    categoriaId: l.categoriaId,
    categoria: l.categoria,
    criadoEm: l.criadoEm,
  };
}

@Injectable()
export class PrismaProdutoRepository extends ProdutoRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async buscarPorId(id: number) {
    const linha = await this.prisma.produto.findUnique({
      where: { id },
      include: incluirCategoria,
    });
    return linha ? paraProduto(linha) : null;
  }

  async criar(dados: NovoProduto) {
    const linha = await this.prisma.produto.create({
      data: dados,
      include: incluirCategoria,
    });
    return paraProduto(linha);
  }

  async atualizar(id: number, dados: AtualizacaoProduto) {
    const linha = await this.prisma.produto.update({
      where: { id },
      data: dados,
      include: incluirCategoria,
    });
    return paraProduto(linha);
  }

  async listar(filtro: FiltroProdutos) {
    const where: Prisma.ProdutoWhereInput = {
      ...(filtro.apenasAtivos ? { ativo: true } : {}),
      ...(filtro.categoriaId ? { categoriaId: filtro.categoriaId } : {}),
      ...(filtro.busca
        ? { nome: { contains: filtro.busca, mode: 'insensitive' } }
        : {}),
    };
    const [linhas, total] = await this.prisma.$transaction([
      this.prisma.produto.findMany({
        where,
        include: incluirCategoria,
        orderBy: { nome: 'asc' },
        skip: (filtro.pagina - 1) * filtro.limite,
        take: filtro.limite,
      }),
      this.prisma.produto.count({ where }),
    ]);
    return paginar(linhas.map(paraProduto), total, filtro.pagina, filtro.limite);
  }
}
