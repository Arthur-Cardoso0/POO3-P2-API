# API do Catálogo — Projeto de Extensão (POO III)

API REST em **NestJS + TypeScript (strict) + Prisma + PostgreSQL** para catálogo e pedidos de uma organização parceira.
O front-end (Next.js/React) fica em outro repositório e consome esta API.

## Rodando

```bash
npm install
cp .env.example .env        # ajuste DATABASE_URL e JWT_SECRET
npx prisma migrate dev      # aplica as migrations
npm run db:seed             # dados fictícios p/ DESENVOLVIMENTO (exige SEED_PASSWORD no .env)
npm run start:dev           # http://localhost:3333
npm test                    # testes (Vitest)
```

## Arquitetura (camadas)

`controller` (rotas + validação Zod) → `service` (regras de negócio) → `repository` (abstração) → `PrismaXRepository` (acesso a dados).
Os serviços dependem de **classes abstratas** de repositório (injeção por construtor), por isso os testes usam repositórios *fake*.

- **Genéricos:** `IRepository<T, TCriar>`, `IListavel<T, TFiltro>`, `PaginatedResponse<T>`
- **Classe abstrata + polimorfismo:** `RepositorioBase<T, TCriar>` (`obter()` comum) e `DomainError` (cada erro define status/código)
- **Erros de domínio:** `NotFoundError`, `ConflictError`, `BusinessRuleError`, `EstoqueInsuficienteError`, `UnauthorizedError`, `ForbiddenError`
- **Transação:** criar pedido (baixa estoque + grava itens) e cancelar pedido (devolve estoque)
- **Agregação:** `groupBy` com `sum`/`count` em `/relatorios/*`
- **Segurança:** senha com scrypt + salt, JWT, perfis `ADMIN` e `OPERADOR`, rotas públicas com `@Public()`
- **LGPD:** pedido e mensagem públicos exigem `consentimento: true` e coletam só o necessário

## Rotas

| Rota | Acesso |
|---|---|
| `GET /saude` | público |
| `POST /auth/login`, `GET /auth/me` | público / logado |
| `GET /produtos?pagina&limite&busca&categoriaId`, `GET /produtos/:id`, `GET /categorias` | público |
| `POST /pedidos`, `POST /mensagens` | público (com consentimento) |
| `GET /admin/produtos`, `POST/PATCH /produtos`, `POST /categorias` | logado |
| `GET /pedidos`, `GET /pedidos/:id`, `PATCH /pedidos/:id/status`, `GET /mensagens`, `PATCH /mensagens/:id/lida` | logado |
| `DELETE /produtos/:id` (desativa), `GET/POST /usuarios`, `GET /relatorios/*` | só ADMIN |

Fluxo de status do pedido: `PENDENTE → CONFIRMADO → ENTREGUE`; cancelar é possível a partir de `PENDENTE` ou `CONFIRMADO`.

## Produção: primeiro administrador

O seed de demonstração é bloqueado em produção. Crie o administrador real (ou redefina a senha dele) com:

```bash
ADMIN_NOME="Nome" ADMIN_EMAIL="admin@dominio.com" ADMIN_SENHA="senha-forte-10+" npm run admin:criar
```

No PowerShell: `$env:ADMIN_NOME="Nome"; $env:ADMIN_EMAIL="..."; $env:ADMIN_SENHA="..."; npm run admin:criar`.
