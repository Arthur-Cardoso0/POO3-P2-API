export type StatusPedido = 'PENDENTE' | 'CONFIRMADO' | 'ENTREGUE' | 'CANCELADO';

export type DiaFeira = 'QUARTA' | 'SABADO';

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
  retirada: DiaFeira;
  total: number;
  itens: ItemPedido[];
  criadoEm: Date;
}

export interface NovoPedido {
  clienteNome: string;
  clienteContato: string;
  observacao?: string | null;
  retirada: DiaFeira;
  itens: { produtoId: number; quantidade: number }[];
}

export interface FiltroPedidos {
  pagina: number;
  limite: number;
  status?: StatusPedido;
  retirada?: DiaFeira;
}
