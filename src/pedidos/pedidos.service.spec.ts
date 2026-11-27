import { BusinessRuleError, NotFoundError } from '../common/errors.js';
import { PedidoRepository } from './pedidos.repository.js';
import { PedidosService } from './pedidos.service.js';
import type { NovoPedido, Pedido, StatusPedido } from './pedidos.types.js';

class FakePedidoRepository extends PedidoRepository {
  pedidos = new Map<number, Pedido>();
  ultimoNovo?: NovoPedido;
  cancelados: number[] = [];

  async buscarPorId(id: number) {
    return this.pedidos.get(id) ?? null;
  }
  async criar(dados: NovoPedido) {
    this.ultimoNovo = dados;
    return this.pedido(1, 'PENDENTE');
  }
  async listar() {
    return { itens: [], total: 0, pagina: 1, limite: 10, totalPaginas: 1 };
  }
  async atualizarStatus(id: number, status: StatusPedido) {
    return this.pedido(id, status);
  }
  async cancelar(id: number) {
    this.cancelados.push(id);
    return this.pedido(id, 'CANCELADO');
  }
  pedido(id: number, status: StatusPedido): Pedido {
    return {
      id, status, clienteNome: 'Ana', clienteContato: 'ana@teste.com',
      observacao: null, retirada: 'SABADO', total: 0, itens: [], criadoEm: new Date(),
    };
  }
}

describe('PedidosService', () => {
  let repo: FakePedidoRepository;
  let service: PedidosService;

  beforeEach(() => {
    repo = new FakePedidoRepository();
    service = new PedidosService(repo);
  });

  it('agrupa itens repetidos do mesmo produto somando as quantidades', async () => {
    await service.criar({
      clienteNome: 'Ana',
      clienteContato: 'ana@teste.com',
      consentimento: true,
      retirada: 'QUARTA',
      itens: [
        { produtoId: 1, quantidade: 2 },
        { produtoId: 2, quantidade: 1 },
        { produtoId: 1, quantidade: 3 },
      ],
    });
    expect(repo.ultimoNovo?.retirada).toBe('QUARTA');
    expect(repo.ultimoNovo?.itens).toEqual([
      { produtoId: 1, quantidade: 5 },
      { produtoId: 2, quantidade: 1 },
    ]);
  });

  it('permite PENDENTE -> CONFIRMADO', async () => {
    repo.pedidos.set(1, repo.pedido(1, 'PENDENTE'));
    const r = await service.atualizarStatus(1, 'CONFIRMADO');
    expect(r.status).toBe('CONFIRMADO');
  });

  it('cancelar usa o repositório (que devolve o estoque)', async () => {
    repo.pedidos.set(1, repo.pedido(1, 'CONFIRMADO'));
    await service.atualizarStatus(1, 'CANCELADO');
    expect(repo.cancelados).toEqual([1]);
  });

  it.each<[StatusPedido, StatusPedido]>([
    ['PENDENTE', 'ENTREGUE'],
    ['ENTREGUE', 'CANCELADO'],
    ['CANCELADO', 'CONFIRMADO'],
  ])('bloqueia a transição %s -> %s', async (de, para) => {
    repo.pedidos.set(1, repo.pedido(1, de));
    await expect(service.atualizarStatus(1, para)).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it('lança NotFoundError para pedido inexistente', async () => {
    await expect(service.atualizarStatus(99, 'CONFIRMADO')).rejects.toBeInstanceOf(NotFoundError);
  });
});
