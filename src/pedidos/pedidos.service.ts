import { Injectable } from '@nestjs/common';
import { BusinessRuleError } from '../common/errors.js';
import { PedidoRepository } from './pedidos.repository.js';
import type { CriarPedidoDto, FiltroPedidosDto } from './pedidos.schemas.js';
import type { StatusPedido } from './pedidos.types.js';

/** Fluxo permitido de status: cada status só pode avançar para os listados. */
export const TRANSICOES: Record<StatusPedido, StatusPedido[]> = {
  PENDENTE: ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['ENTREGUE', 'CANCELADO'],
  ENTREGUE: [],
  CANCELADO: [],
};

@Injectable()
export class PedidosService {
  constructor(private readonly pedidos: PedidoRepository) {}

  criar(dto: CriarPedidoDto) {
    // Itens repetidos do mesmo produto viram um só (soma das quantidades).
    const porProduto = new Map<number, number>();
    for (const item of dto.itens) {
      porProduto.set(item.produtoId, (porProduto.get(item.produtoId) ?? 0) + item.quantidade);
    }
    return this.pedidos.criar({
      clienteNome: dto.clienteNome,
      clienteContato: dto.clienteContato,
      observacao: dto.observacao,
      itens: [...porProduto].map(([produtoId, quantidade]) => ({ produtoId, quantidade })),
    });
  }

  listar(filtro: FiltroPedidosDto) {
    return this.pedidos.listar(filtro);
  }

  obter(id: number) {
    return this.pedidos.obter(id);
  }

  async atualizarStatus(id: number, novo: StatusPedido) {
    const pedido = await this.pedidos.obter(id);
    if (!TRANSICOES[pedido.status].includes(novo)) {
      throw new BusinessRuleError(
        `Não é possível mudar o pedido de ${pedido.status} para ${novo}.`,
      );
    }
    return novo === 'CANCELADO'
      ? this.pedidos.cancelar(id)
      : this.pedidos.atualizarStatus(id, novo);
  }
}
