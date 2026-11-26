export type StatusPedido = 'PENDENTE' | 'CONFIRMADO' | 'ENTREGUE' | 'CANCELADO';

export interface ItemPedido {
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  clienteNome: string;
  clienteContato: string;
  observacao: string | null;
  status: StatusPedido;
  total: number;
  itens: ItemPedido[];
  criadoEm: Date;
}

export interface NovoPedido {
  clienteNome: string;
  clienteContato: string;
  observacao?: string | null;
  itens: { produtoId: number; quantidade: number }[];
}

export interface FiltroPedidos {
  pagina: number;
  limite: number;
  status?: StatusPedido;
}
