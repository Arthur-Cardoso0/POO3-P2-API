import { Module } from '@nestjs/common';
import { UsuarioRepository, PrismaUsuarioRepository } from './usuarios.repository.js';
import { UsuariosController } from './usuarios.controller.js';
import { UsuariosService } from './usuarios.service.js';

@Module({
  controllers: [UsuariosController],
  providers: [
    UsuariosService,
    { provide: UsuarioRepository, useClass: PrismaUsuarioRepository },
  ],
  exports: [UsuariosService, UsuarioRepository],
})
export class UsuariosModule {}
