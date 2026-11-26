import {
  Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { Public, Roles } from '../auth/auth.decorators.js';
import { ProdutosService } from './produtos.service.js';
import {
  atualizarProdutoSchema, criarProdutoSchema, filtroProdutosSchema,
  type AtualizarProdutoDto, type CriarProdutoDto, type FiltroProdutosDto,
} from './produtos.schemas.js';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtos: ProdutosService) {}

  @Public()
  @Get()
  listar(@Query({ schema: filtroProdutosSchema }) filtro: FiltroProdutosDto) {
    return this.produtos.listarPublico(filtro);
  }

  @Public()
  @Get(':id')
  obter(@Param('id', ParseIntPipe) id: number) {
    return this.produtos.obterPublico(id);
  }

  @Post()
  criar(@Body({ schema: criarProdutoSchema }) dto: CriarProdutoDto) {
    return this.produtos.criar(dto);
  }

  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body({ schema: atualizarProdutoSchema }) dto: AtualizarProdutoDto,
  ) {
    return this.produtos.atualizar(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(204)
  desativar(@Param('id', ParseIntPipe) id: number) {
    return this.produtos.desativar(id);
  }
}

@Controller('admin/produtos')
export class ProdutosAdminController {
  constructor(private readonly produtos: ProdutosService) {}

  @Get()
  listar(@Query({ schema: filtroProdutosSchema }) filtro: FiltroProdutosDto) {
    return this.produtos.listarTodos(filtro);
  }
}
