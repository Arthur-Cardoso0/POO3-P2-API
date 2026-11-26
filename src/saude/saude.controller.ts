import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/auth.decorators.js';

@Controller('saude')
export class SaudeController {
  @Public()
  @Get()
  verificar() {
    return { status: 'ok' };
  }
}
