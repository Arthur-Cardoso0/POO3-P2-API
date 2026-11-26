export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagemUrl: string | null;
  ativo: boolean;
  categoriaId: number;
  categoria: { id: number; nome: string };
  criadoEm: Date;
}

export interface NovoProduto {
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagemUrl?: string | null;
  categoriaId: number;
}

export type AtualizacaoProduto = Partial<NovoProduto> & { ativo?: boolean };

export interface FiltroProdutos {
  pagina: number;
  limite: number;
  busca?: string;
  categoriaId?: number;
  apenasAtivos: boolean;
}
