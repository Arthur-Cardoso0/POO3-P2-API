import { Body, Controller, Get, Injectable, Module, Post } from '@nestjs/common';
import { z } from 'zod';
import { Public } from '../auth/auth.decorators.js';
import { ConflictError } from '../common/errors.js';
import { RepositorioBase } from '../common/repository.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface Categoria {
  id: number;
  nome: string;
}

export const criarCategoriaSchema = z.object({
  nome: z.string().trim().min(2).max(60),
});
export type CriarCategoriaDto = z.infer<typeof criarCategoriaSchema>;

export abstract class CategoriaRepository extends RepositorioBase<Categoria, CriarCategoriaDto> {
  protected readonly entidade = 'Categoria';
  abstract buscarPorNome(nome: string): Promise<Categoria | null>;
  abstract listar(): Promise<Categoria[]>;
}

@Injectable()
export class PrismaCategoriaRepository extends CategoriaRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  buscarPorId(id: number) {
    return this.prisma.categoria.findUnique({ where: { id } });
  }
  buscarPorNome(nome: string) {
    return this.prisma.categoria.findUnique({ where: { nome } });
  }
  criar(dados: CriarCategoriaDto) {
    return this.prisma.categoria.create({ data: { nome: dados.nome } });
  }
  listar() {
    return this.prisma.categoria.findMany({ orderBy: { nome: 'asc' } });
  }
}

@Injectable()
export class CategoriasService {
  constructor(private readonly repo: CategoriaRepository) {}

  async criar(dto: CriarCategoriaDto) {
    if (await this.repo.buscarPorNome(dto.nome)) {
      throw new ConflictError('Já existe uma categoria com este nome.');
    }
    return this.repo.criar(dto);
  }

  listar() {
    return this.repo.listar();
  }
}

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categorias: CategoriasService) {}

  @Public()
  @Get()
  listar() {
    return this.categorias.listar();
  }

  @Post()
  criar(@Body({ schema: criarCategoriaSchema }) dto: CriarCategoriaDto) {
    return this.categorias.criar(dto);
  }
}

@Module({
  controllers: [CategoriasController],
  providers: [
    CategoriasService,
    { provide: CategoriaRepository, useClass: PrismaCategoriaRepository },
  ],
  exports: [CategoriaRepository],
})
export class CategoriasModule {}
