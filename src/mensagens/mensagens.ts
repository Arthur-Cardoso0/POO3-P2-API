import {
  Body, Controller, Get, Injectable, Module, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { z } from 'zod';
import { Public } from '../auth/auth.decorators.js';
import { paginacaoSchema, paginar, type PaginatedResponse, type Paginacao } from '../common/pagination.js';
import { RepositorioBase, type IListavel } from '../common/repository.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface Mensagem {
  id: number;
  nome: string;
  email: string;
  texto: string;
  lida: boolean;
  criadoEm: Date;
}
export interface NovaMensagem {
  nome: string;
  email: string;
  texto: string;
}

export const criarMensagemSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  texto: z.string().trim().min(5).max(2000),
  consentimento: z
    .boolean()
    .refine((v) => v === true, 'É necessário aceitar o aviso de privacidade'),
});
export type CriarMensagemDto = z.infer<typeof criarMensagemSchema>;

export abstract class MensagemRepository
  extends RepositorioBase<Mensagem, NovaMensagem>
  implements IListavel<Mensagem, Paginacao>
{
  protected readonly entidade = 'Mensagem';
  abstract listar(filtro: Paginacao): Promise<PaginatedResponse<Mensagem>>;
  abstract marcarComoLida(id: number): Promise<Mensagem>;
}

@Injectable()
export class PrismaMensagemRepository extends MensagemRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  buscarPorId(id: number) {
    return this.prisma.mensagem.findUnique({ where: { id } });
  }
  criar(dados: NovaMensagem) {
    return this.prisma.mensagem.create({ data: dados });
  }
  marcarComoLida(id: number) {
    return this.prisma.mensagem.update({ where: { id }, data: { lida: true } });
  }
  async listar(filtro: Paginacao) {
    const [itens, total] = await this.prisma.$transaction([
      this.prisma.mensagem.findMany({
        orderBy: { criadoEm: 'desc' },
        skip: (filtro.pagina - 1) * filtro.limite,
        take: filtro.limite,
      }),
      this.prisma.mensagem.count(),
    ]);
    return paginar(itens, total, filtro.pagina, filtro.limite);
  }
}

@Injectable()
export class MensagensService {
  constructor(private readonly repo: MensagemRepository) {}

  enviar(dto: CriarMensagemDto) {
    // Só o necessário é guardado (LGPD): o "consentimento" valida o aceite, mas não é persistido.
    return this.repo.criar({ nome: dto.nome, email: dto.email, texto: dto.texto });
  }
  listar(filtro: Paginacao) {
    return this.repo.listar(filtro);
  }
  async marcarComoLida(id: number) {
    await this.repo.obter(id);
    return this.repo.marcarComoLida(id);
  }
}

@Controller('mensagens')
export class MensagensController {
  constructor(private readonly mensagens: MensagensService) {}

  @Public()
  @Post()
  enviar(@Body({ schema: criarMensagemSchema }) dto: CriarMensagemDto) {
    return this.mensagens.enviar(dto).then(() => ({ ok: true }));
  }

  @Get()
  listar(@Query({ schema: paginacaoSchema }) filtro: Paginacao) {
    return this.mensagens.listar(filtro);
  }

  @Patch(':id/lida')
  marcarComoLida(@Param('id', ParseIntPipe) id: number) {
    return this.mensagens.marcarComoLida(id);
  }
}

@Module({
  controllers: [MensagensController],
  providers: [MensagensService, { provide: MensagemRepository, useClass: PrismaMensagemRepository }],
})
export class MensagensModule {}
