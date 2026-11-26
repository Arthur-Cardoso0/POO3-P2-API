import { Module } from '@nestjs/common';
import { PedidosController } from './pedidos.controller.js';
import { PedidoRepository, PrismaPedidoRepository } from './pedidos.repository.js';
import { PedidosService } from './pedidos.service.js';

@Module({
  controllers: [PedidosController],
  providers: [PedidosService, { provide: PedidoRepository, useClass: PrismaPedidoRepository }],
})
export class PedidosModule {}
