import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { loginSchema, type LoginDto } from '../usuarios/usuarios.schemas.js';
import { Public } from './auth.decorators.js';
import type { RequestAutenticada } from './auth.guard.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly usuarios: UsuariosService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body({ schema: loginSchema }) dto: LoginDto) {
    return this.auth.login(dto.email, dto.senha);
  }

  @Get('me')
  me(@Req() req: RequestAutenticada) {
    return this.usuarios.obter(req.usuario!.id);
  }
}
