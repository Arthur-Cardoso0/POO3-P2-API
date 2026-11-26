import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { Public } from '../auth/auth.decorators.js';
import { PedidosService } from './pedidos.service.js';
import {
  atualizarStatusSchema, criarPedidoSchema, filtroPedidosSchema,
  type AtualizarStatusDto, type CriarPedidoDto, type FiltroPedidosDto,
} from './pedidos.schemas.js';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidos: PedidosService) {}

  /** Parte pública: qualquer visitante pode fazer um pedido (sem login). */
  @Public()
  @Post()
  criar(@Body({ schema: criarPedidoSchema }) dto: CriarPedidoDto) {
    return this.pedidos.criar(dto);
  }

  @Get()
  listar(@Query({ schema: filtroPedidosSchema }) filtro: FiltroPedidosDto) {
    return this.pedidos.listar(filtro);
  }

  @Get(':id')
  obter(@Param('id', ParseIntPipe) id: number) {
    return this.pedidos.obter(id);
  }

  @Patch(':id/status')
  atualizarStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body({ schema: atualizarStatusSchema }) dto: AtualizarStatusDto,
  ) {
    return this.pedidos.atualizarStatus(id, dto.status);
  }
}
