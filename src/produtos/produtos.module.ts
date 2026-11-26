import { Module } from '@nestjs/common';
import { CategoriasModule } from '../categorias/categorias.js';
import { ProdutosAdminController, ProdutosController } from './produtos.controller.js';
import { PrismaProdutoRepository, ProdutoRepository } from './produtos.repository.js';
import { ProdutosService } from './produtos.service.js';

@Module({
  imports: [CategoriasModule],
  controllers: [ProdutosController, ProdutosAdminController],
  providers: [
    ProdutosService,
    { provide: ProdutoRepository, useClass: PrismaProdutoRepository },
  ],
})
export class ProdutosModule {}
