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

  const categorias = ['Alimentos', 'Artesanato', 'Hortifruti'];
  for (const nome of categorias) {
    await prisma.categoria.upsert({ where: { nome }, update: {}, create: { nome } });
  }
  const cat = Object.fromEntries(
    (await prisma.categoria.findMany()).map((c) => [c.nome, c.id]),
  ) as Record<string, number>;

  if ((await prisma.produto.count()) === 0) {
    await prisma.produto.createMany({
      data: [
        { nome: 'Mel orgânico 500g', descricao: 'Mel de produtor local.', preco: 28, estoque: 20, categoriaId: cat.Alimentos! },
        { nome: 'Geleia de goiaba', descricao: 'Feita em panela de cobre.', preco: 15.5, estoque: 12, categoriaId: cat.Alimentos! },
        { nome: 'Bolsa de crochê', descricao: 'Artesanal, cores variadas.', preco: 85, estoque: 6, categoriaId: cat.Artesanato! },
        { nome: 'Vaso de cerâmica', descricao: 'Pintado à mão.', preco: 60, estoque: 4, categoriaId: cat.Artesanato! },
        { nome: 'Cesta de hortaliças', descricao: 'Colheita da semana.', preco: 35, estoque: 15, categoriaId: cat.Hortifruti! },
        { nome: 'Ovos caipiras (dúzia)', descricao: 'Galinhas criadas soltas.', preco: 14, estoque: 30, categoriaId: cat.Hortifruti! },
      ],
    });
  }
  console.log('Seed concluído.');
}

main().finally(() => prisma.$disconnect());
