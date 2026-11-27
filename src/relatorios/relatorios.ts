import { Controller, Get, Injectable, Module, Query } from '@nestjs/common';
import { z } from 'zod';
import { Roles } from '../auth/auth.decorators.js';
import { DIAS_FEIRA } from '../pedidos/pedidos.schemas.js';
import type { DiaFeira } from '../pedidos/pedidos.types.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface VendaPorProduto {
  produtoId: number;
  produto: string;
  quantidadeVendida: number;
  faturamento: number;
  pedidos: number;
}
export interface PedidosPorStatus {
  status: string;
  quantidade: number;
  valorTotal: number;
}
export interface ProdutoEstoqueBaixo {
  id: number;
  nome: string;
  estoque: number;
}

export interface ItemSeparacao {
  produtoId: number;
  produto: string;
  quantidade: number;
  pedidos: number;
}

export abstract class RelatorioRepository {
  abstract vendasPorProduto(): Promise<VendaPorProduto[]>;
  abstract pedidosPorStatus(): Promise<PedidosPorStatus[]>;
  abstract estoqueBaixo(limite: number): Promise<ProdutoEstoqueBaixo[]>;
  abstract separacao(dia: DiaFeira): Promise<ItemSeparacao[]>;
}

@Injectable()
export class PrismaRelatorioRepository extends RelatorioRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /** AGREGAÇÃO: groupBy com sum/count sobre os itens de pedidos não cancelados. */
  async vendasPorProduto() {
    const grupos = await this.prisma.itemPedido.groupBy({
      by: ['produtoId'],
      where: { pedido: { status: { not: 'CANCELADO' } } },
      _sum: { quantidade: true, subtotal: true },
      _count: { _all: true },
      orderBy: { _sum: { subtotal: 'desc' } },
    });
    const produtos = await this.prisma.produto.findMany({
      where: { id: { in: grupos.map((g) => g.produtoId) } },
      select: { id: true, nome: true },
    });
    const nomes = new Map(produtos.map((p) => [p.id, p.nome]));
    return grupos.map((g) => ({
      produtoId: g.produtoId,
      produto: nomes.get(g.produtoId) ?? `#${g.produtoId}`,
      quantidadeVendida: g._sum.quantidade ?? 0,
      faturamento: g._sum.subtotal?.toNumber() ?? 0,
      pedidos: g._count._all,
    }));
  }

  async pedidosPorStatus() {
    const grupos = await this.prisma.pedido.groupBy({
      by: ['status'],
      _count: { _all: true },
      _sum: { total: true },
    });
    return grupos.map((g) => ({
      status: g.status,
      quantidade: g._count._all,
      valorTotal: g._sum.total?.toNumber() ?? 0,
    }));
  }

  /** AGREGAÇÃO: o que levar para a feira — soma das quantidades dos pedidos em aberto de um dia. */
  async separacao(dia: DiaFeira) {
    const grupos = await this.prisma.itemPedido.groupBy({
      by: ['produtoId'],
      where: { pedido: { retirada: dia, status: { in: ['PENDENTE', 'CONFIRMADO'] } } },
      _sum: { quantidade: true },
      _count: { _all: true },
      orderBy: { _sum: { quantidade: 'desc' } },
    });
    const produtos = await this.prisma.produto.findMany({
      where: { id: { in: grupos.map((g) => g.produtoId) } },
      select: { id: true, nome: true },
    });
    const nomes = new Map(produtos.map((p) => [p.id, p.nome]));
    return grupos.map((g) => ({
      produtoId: g.produtoId,
      produto: nomes.get(g.produtoId) ?? `#${g.produtoId}`,
      quantidade: g._sum.quantidade ?? 0,
      pedidos: g._count._all,
    }));
  }

  estoqueBaixo(limite: number) {
    return this.prisma.produto.findMany({
      where: { ativo: true, estoque: { lte: limite } },
      select: { id: true, nome: true, estoque: true },
      orderBy: { estoque: 'asc' },
    });
  }
}

const separacaoSchema = z.object({ dia: z.enum(DIAS_FEIRA) });
const estoqueSchema = z.object({ limite: z.coerce.number().int().min(0).default(5) });

@Controller('relatorios')
@Roles('ADMIN')
export class RelatoriosController {
  constructor(private readonly repo: RelatorioRepository) {}

  @Get('vendas-por-produto')
  vendasPorProduto() {
    return this.repo.vendasPorProduto();
  }

  @Get('pedidos-por-status')
  pedidosPorStatus() {
    return this.repo.pedidosPorStatus();
  }

  /** Lista de separação: o que levar à feira em cada dia (pedidos pendentes e confirmados). */
  @Get('separacao')
  separacao(@Query({ schema: separacaoSchema }) q: z.infer<typeof separacaoSchema>) {
    return this.repo.separacao(q.dia);
  }

  @Get('estoque-baixo')
  estoqueBaixo(@Query({ schema: estoqueSchema }) q: z.infer<typeof estoqueSchema>) {
    return this.repo.estoqueBaixo(q.limite);
  }
}

@Module({
  controllers: [RelatoriosController],
  providers: [{ provide: RelatorioRepository, useClass: PrismaRelatorioRepository }],
})
export class RelatoriosModule {}
