import { Injectable } from '@nestjs/common';
import { EstoqueInsuficienteError, NotFoundError } from '../common/errors.js';
import { paginar, type PaginatedResponse } from '../common/pagination.js';
import { RepositorioBase, type IListavel } from '../common/repository.js';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { FiltroPedidos, NovoPedido, Pedido, StatusPedido } from './pedidos.types.js';

export abstract class PedidoRepository
  extends RepositorioBase<Pedido, NovoPedido>
  implements IListavel<Pedido, FiltroPedidos>
{
  protected readonly entidade = 'Pedido';
  abstract listar(filtro: FiltroPedidos): Promise<PaginatedResponse<Pedido>>;
  abstract atualizarStatus(id: number, status: StatusPedido): Promise<Pedido>;
  /** Cancela o pedido e devolve os itens ao estoque (atomicamente). */
  abstract cancelar(id: number): Promise<Pedido>;
}

const incluirItens = {
  itens: { include: { produto: { select: { nome: true } } }, orderBy: { id: 'asc' } },
} as const;
type LinhaPedido = Prisma.PedidoGetPayload<{ include: typeof incluirItens }>;

const centavos = (valor: number) => Math.round(valor * 100);

function paraPedido(l: LinhaPedido): Pedido {
  return {
    id: l.id,
    clienteNome: l.clienteNome,
    clienteContato: l.clienteContato,
    observacao: l.observacao,
    status: l.status,
    retirada: l.retirada,
    total: l.total.toNumber(),
    criadoEm: l.criadoEm,
    itens: l.itens.map((i) => ({
      produtoId: i.produtoId,
      produtoNome: i.produto.nome,
      quantidade: i.quantidade,
      precoUnitario: i.precoUnitario.toNumber(),
      subtotal: i.subtotal.toNumber(),
    })),
  };
}

@Injectable()
export class PrismaPedidoRepository extends PedidoRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async buscarPorId(id: number) {
    const linha = await this.prisma.pedido.findUnique({ where: { id }, include: incluirItens });
    return linha ? paraPedido(linha) : null;
  }

  /**
   * TRANSAÇÃO: baixa o estoque de cada item e cria o pedido juntos.
   * A baixa condicional (estoque >= quantidade) evita venda acima do estoque mesmo
   * com pedidos simultâneos; se qualquer item falhar, tudo é desfeito (rollback).
   */
  async criar(dados: NovoPedido) {
    const linha = await this.prisma.$transaction(async (tx) => {
      let totalCentavos = 0;
      const itens: {
        produtoId: number;
        quantidade: number;
        precoUnitario: number;
        subtotal: number;
      }[] = [];

      for (const item of dados.itens) {
        const produto = await tx.produto.findFirst({
          where: { id: item.produtoId, ativo: true },
        });
        if (!produto) throw new NotFoundError('Produto', item.produtoId);

        const baixa = await tx.produto.updateMany({
          where: { id: item.produtoId, estoque: { gte: item.quantidade } },
          data: { estoque: { decrement: item.quantidade } },
        });
        if (baixa.count === 0) {
          throw new EstoqueInsuficienteError(produto.nome, produto.estoque, item.quantidade);
        }

        const preco = produto.preco.toNumber();
        const subtotalCentavos = centavos(preco) * item.quantidade;
        totalCentavos += subtotalCentavos;
        itens.push({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario: preco,
          subtotal: subtotalCentavos / 100,
        });
      }

      return tx.pedido.create({
        data: {
          clienteNome: dados.clienteNome,
          clienteContato: dados.clienteContato,
          observacao: dados.observacao ?? null,
          retirada: dados.retirada,
          total: totalCentavos / 100,
          itens: { create: itens },
        },
        include: incluirItens,
      });
    });
    return paraPedido(linha);
  }

  async listar(filtro: FiltroPedidos) {
    const where: Prisma.PedidoWhereInput = {
      ...(filtro.status ? { status: filtro.status } : {}),
      ...(filtro.retirada ? { retirada: filtro.retirada } : {}),
    };
    const [linhas, total] = await this.prisma.$transaction([
      this.prisma.pedido.findMany({
        where,
        include: incluirItens,
        orderBy: { criadoEm: 'desc' },
        skip: (filtro.pagina - 1) * filtro.limite,
        take: filtro.limite,
      }),
      this.prisma.pedido.count({ where }),
    ]);
    return paginar(linhas.map(paraPedido), total, filtro.pagina, filtro.limite);
  }

  async atualizarStatus(id: number, status: StatusPedido) {
    const linha = await this.prisma.pedido.update({
      where: { id },
      data: { status },
      include: incluirItens,
    });
    return paraPedido(linha);
  }

  async cancelar(id: number) {
    const linha = await this.prisma.$transaction(async (tx) => {
      const itens = await tx.itemPedido.findMany({ where: { pedidoId: id } });
      for (const item of itens) {
        await tx.produto.update({
          where: { id: item.produtoId },
          data: { estoque: { increment: item.quantidade } },
        });
      }
      return tx.pedido.update({
        where: { id },
        data: { status: 'CANCELADO' },
        include: incluirItens,
      });
    });
    return paraPedido(linha);
  }
}
