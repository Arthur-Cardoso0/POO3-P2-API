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

  const categorias = ['Mel e derivados', 'Laticínios e ovos', 'Doces e geleias', 'Hortifruti e grãos'];
  for (const nome of categorias) {
    await prisma.categoria.upsert({ where: { nome }, update: {}, create: { nome } });
  }
  const cat = Object.fromEntries(
    (await prisma.categoria.findMany()).map((c) => [c.nome, c.id]),
  ) as Record<string, number>;

  // Produtos e preços FICTÍCIOS de demonstração: troque pelos produtos reais do feirante.
  if ((await prisma.produto.count()) === 0) {
    await prisma.produto.createMany({
      data: [
        { nome: 'Mel silvestre 500g', descricao: 'Mel puro de flores do cerrado, sem aditivos.', preco: 32, estoque: 20, categoriaId: cat['Mel e derivados']! },
        { nome: 'Própolis em gotas', descricao: 'Extrato de própolis, frasco de 30 ml.', preco: 25, estoque: 10, categoriaId: cat['Mel e derivados']! },
        { nome: 'Queijo minas artesanal', descricao: 'Fresco, feito com leite da fazenda (peça de cerca de 500g).', preco: 30, estoque: 12, categoriaId: cat['Laticínios e ovos']! },
        { nome: 'Ovos caipiras (dúzia)', descricao: 'De galinhas criadas soltas.', preco: 16, estoque: 30, categoriaId: cat['Laticínios e ovos']! },
        { nome: 'Doce de leite caseiro', descricao: 'Pote de 400g, em tacho.', preco: 18, estoque: 15, categoriaId: cat['Doces e geleias']! },
        { nome: 'Geleia de pequi', descricao: 'Vidro de 250g, feita na fazenda.', preco: 22, estoque: 8, categoriaId: cat['Doces e geleias']! },
        { nome: 'Rapadura (unidade)', descricao: 'Rapadura de engenho, cerca de 300g.', preco: 6, estoque: 40, categoriaId: cat['Doces e geleias']! },
        { nome: 'Farinha de mandioca 1kg', descricao: 'Torrada artesanalmente.', preco: 12, estoque: 25, categoriaId: cat['Hortifruti e grãos']! },
        { nome: 'Cesta de hortaliças da estação', descricao: 'Colhidas na semana da feira.', preco: 35, estoque: 10, categoriaId: cat['Hortifruti e grãos']! },
      ],
    });
  }
  console.log('Seed concluído.');
}

main().finally(() => prisma.$disconnect());
