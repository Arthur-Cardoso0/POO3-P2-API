import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashSenha } from '../src/auth/password.hasher.js';
import { PrismaClient } from '../src/generated/prisma/client.js';

/**
 * Cria (ou redefine a senha de) um usuário ADMIN real, sem passar pelo seed de demonstração.
 * Uso: defina ADMIN_NOME, ADMIN_EMAIL e ADMIN_SENHA no ambiente e rode `npm run admin:criar`.
 * Se o e-mail já existir, a senha é substituída — serve também para recuperar o acesso.
 */
const nome = process.env.ADMIN_NOME?.trim();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const senha = process.env.ADMIN_SENHA;

if (!nome || !email || !senha) {
  console.error('Defina ADMIN_NOME, ADMIN_EMAIL e ADMIN_SENHA no ambiente.');
  process.exit(1);
}
if (senha.length < 10) {
  console.error('ADMIN_SENHA deve ter ao menos 10 caracteres.');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ...(process.env.DB_POOL_MAX ? { max: Number(process.env.DB_POOL_MAX) } : {}),
  }),
});

async function main() {
  const hash = await hashSenha(senha!);
  const usuario = await prisma.usuario.upsert({
    where: { email: email! },
    update: { senha: hash, perfil: 'ADMIN', nome: nome! },
    create: { nome: nome!, email: email!, senha: hash, perfil: 'ADMIN' },
    select: { id: true, email: true, perfil: true },
  });
  console.log(`Administrador pronto: ${usuario.email} (id ${usuario.id}).`);
}

main().finally(() => prisma.$disconnect());
