import { Body, Controller, Get, Post } from '@nestjs/common';
import { Roles } from '../auth/auth.decorators.js';
import { UsuariosService } from './usuarios.service.js';
import { criarUsuarioSchema, type CriarUsuarioDto } from './usuarios.schemas.js';

@Controller('usuarios')
@Roles('ADMIN')
export class UsuariosController {
  constructor(private readonly usuarios: UsuariosService) {}

  @Get()
  listar() {
    return this.usuarios.listar();
  }

  @Post()
  criar(@Body({ schema: criarUsuarioSchema }) dto: CriarUsuarioDto) {
    return this.usuarios.criar(dto);
  }
}
