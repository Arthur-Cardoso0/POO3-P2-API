import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashSenha } from '../src/auth/password.hasher.js';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Dados FICTÍCIOS apenas para DESENVOLVIMENTO. A senha vem do ambiente (nada de senha no repositório).
// Em produção NÃO rode este seed: crie o administrador real com `npm run admin:criar`.
const senhaEnv = process.env.SEED_PASSWORD;
if (!senhaEnv || senhaEnv.length < 8) {
  console.error('Defina SEED_PASSWORD (mínimo 8 caracteres) no .env antes de rodar o seed.');
  process.exit(1);
}
if (process.env.NODE_ENV === 'production') {
  console.error('Seed de demonstração bloqueado em produção. Use `npm run admin:criar`.');
  process.exit(1);
}
const senhaSeed: string = senhaEnv;

async function main() {
  const senha = await hashSenha(senhaSeed);
  await prisma.usuario.upsert({
    where: { email: 'admin@exemplo.local' },
    update: {},
    create: { nome: 'Administrador (fictício)', email: 'admin@exemplo.local', senha, perfil: 'ADMIN' },
  });
  await prisma.usuario.upsert({
    where: { email: 'operador@exemplo.local' },
    update: {},
    create: { nome: 'Operador (fictício)', email: 'operador@exemplo.local', senha, perfil: 'OPERADOR' },
  });

  // Catálogo do feirante Raízes do Cerrado. Preços e estoques são FICTÍCIOS (apenas demonstração):
  // o feirante ajusta os valores reais pelo painel. [nome com a unidade de venda, preço].
  type Item = [string, number];
  const catalogo: { categoria: string; descricao: string; itens: Item[] }[] = [
    {
      categoria: 'Hortifrúti e vegetais frescos',
      descricao: 'Colhido na semana da feira.',
      itens: [
        ['Alface crespa (unidade)', 3.5], ['Alface lisa (unidade)', 3.5], ['Alface americana (unidade)', 4],
        ['Couve-manteiga (maço)', 3.5], ['Rúcula (maço)', 4], ['Agrião (maço)', 4], ['Espinafre (maço)', 4.5],
        ['Almeirão (maço)', 3.5], ['Repolho (unidade)', 6], ['Salsinha (maço)', 2.5], ['Cebolinha (maço)', 2.5],
        ['Mandioca (kg)', 6], ['Batata-doce (kg)', 7], ['Inhame (kg)', 12], ['Cará (kg)', 10],
        ['Cenoura (kg)', 6], ['Beterraba (kg)', 6.5], ['Rabanete (maço)', 4],
        ['Abóbora cabotiá (kg)', 5], ['Abóbora moranga (kg)', 4.5], ['Abóbora de pescoço (kg)', 4.5],
        ['Quiabo (kg)', 12], ['Jiló (kg)', 9], ['Maxixe (kg)', 10], ['Abobrinha (kg)', 7], ['Berinjela (kg)', 8],
        ['Chuchu (kg)', 5], ['Tomate caipira (kg)', 11], ['Vagem (kg)', 13], ['Milho-verde (espiga)', 2],
        ['Banana prata (kg)', 7], ['Banana nanica (kg)', 6], ['Banana maçã (kg)', 8], ['Banana-da-terra (kg)', 8],
        ['Mamão (unidade)', 7], ['Laranja (kg)', 4.5], ['Mexerica ponkan (kg)', 6], ['Limão-taiti (kg)', 7],
        ['Limão-cravo (kg)', 6], ['Abacate (unidade)', 6], ['Manga (kg)', 8], ['Goiaba (kg)', 9],
        ['Maracujá (kg)', 14], ['Jabuticaba (kg)', 18], ['Acerola (kg)', 15], ['Pequi (dúzia)', 18],
      ],
    },
    {
      categoria: 'Origem animal e laticínios',
      descricao: 'Produção artesanal da fazenda.',
      itens: [
        ['Ovos caipiras (dúzia)', 16], ['Ovos de codorna (cartela)', 10],
        ['Queijo minas frescal (peça)', 28], ['Queijo meia-cura (peça)', 38],
        ['Requeijão artesanal de corte (peça)', 30], ['Requeijão cremoso (pote)', 16],
        ['Manteiga caseira (pote)', 22], ['Nata (pote)', 14],
        ['Doce de leite pastoso (pote)', 18], ['Doce de leite em barra (unidade)', 8],
        ['Mel silvestre (500 g)', 32], ['Favo de mel (unidade)', 35], ['Própolis (frasco)', 25], ['Pólen apícola (pote)', 28],
      ],
    },
    {
      categoria: 'Grãos, farináceos e beneficiados',
      descricao: 'Beneficiado de forma artesanal.',
      itens: [
        ['Feijão carioca (kg)', 9], ['Feijão preto (kg)', 9], ['Feijão fradinho (kg)', 10], ['Feijão de corda (kg)', 10],
        ['Milho seco para canjica (kg)', 7], ['Milho de pipoca (kg)', 8], ['Amendoim cru (kg)', 14],
        ['Farinha de mandioca crua (kg)', 11], ['Farinha de mandioca torrada (kg)', 12],
        ['Polvilho doce (kg)', 13], ['Polvilho azedo (kg)', 13], ['Fubá de moinho d\'água (kg)', 8],
        ['Rapadura pura (unidade)', 6], ['Rapadura temperada (unidade)', 7], ['Melado de cana (garrafa)', 18],
        ['Açúcar mascavo (kg)', 10], ['Café em grão (500 g)', 28], ['Café torrado e moído (500 g)', 28],
      ],
    },
    {
      categoria: 'Ervas, temperos e conservas',
      descricao: 'Fresco ou conservado de forma artesanal.',
      itens: [
        ['Manjericão (maço)', 3.5], ['Alecrim (maço)', 3.5], ['Hortelã (maço)', 3], ['Coentro (maço)', 2.5],
        ['Tomilho (maço)', 4], ['Sálvia (maço)', 4], ['Folhas de louro (pacote)', 3],
        ['Alho roxo (kg)', 35], ['Réstia de alho (unidade)', 25], ['Cebola (kg)', 6], ['Gengibre (kg)', 20],
        ['Açafrão-da-terra em raiz (100 g)', 8], ['Açafrão-da-terra em pó (pote)', 9], ['Colorau (pote)', 8],
        ['Pimenta malagueta (100 g)', 5], ['Pimenta dedo-de-moça (100 g)', 5], ['Pimenta-de-cheiro (100 g)', 5],
        ['Pimenta bode (100 g)', 6], ['Pimenta cumari (100 g)', 6],
        ['Pimentas curtidas (vidro)', 14], ['Pequi em conserva (vidro)', 24], ['Compota de frutas (vidro)', 16],
      ],
    },
  ];

  for (const { categoria } of catalogo) {
    await prisma.categoria.upsert({ where: { nome: categoria }, update: {}, create: { nome: categoria } });
  }
  const cat = Object.fromEntries(
    (await prisma.categoria.findMany()).map((c) => [c.nome, c.id]),
  ) as Record<string, number>;

  if ((await prisma.produto.count()) === 0) {
    await prisma.produto.createMany({
      data: catalogo.flatMap(({ categoria, descricao, itens }) =>
        itens.map(([nome, preco]) => ({
          nome,
          descricao,
          preco,
          estoque: 20,
          categoriaId: cat[categoria]!,
        })),
      ),
    });
  }
  console.log('Seed concluído.');
}

main().finally(() => prisma.$disconnect());
