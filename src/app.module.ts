import { Module, StandardSchemaValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AuthModule } from './auth/auth.module.js';
import { CategoriasModule } from './categorias/categorias.js';
import { DomainErrorFilter } from './common/domain-error.filter.js';
import { MensagensModule } from './mensagens/mensagens.js';
import { PedidosModule } from './pedidos/pedidos.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProdutosModule } from './produtos/produtos.module.js';
import { RelatoriosModule } from './relatorios/relatorios.js';
import { SaudeController } from './saude/saude.controller.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';

@Module({
  imports: [
    PrismaModule,
    UsuariosModule,
    AuthModule,
    CategoriasModule,
    ProdutosModule,
    PedidosModule,
    MensagensModule,
    RelatoriosModule,
  ],
  controllers: [SaudeController],
  providers: [
    { provide: APP_PIPE, useValue: new StandardSchemaValidationPipe() },
    { provide: APP_FILTER, useClass: DomainErrorFilter },
  ],
})
export class AppModule {}
