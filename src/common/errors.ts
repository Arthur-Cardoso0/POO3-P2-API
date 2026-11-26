/** Classe base abstrata dos erros de domínio: cada subclasse define seu status HTTP e código. */
export abstract class DomainError extends Error {
  abstract readonly status: number;
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends DomainError {
  readonly status = 404;
  readonly code = 'NAO_ENCONTRADO';
  constructor(entidade: string, id: number | string) {
    super(`${entidade} ${id} não encontrado(a).`);
  }
}

export class ConflictError extends DomainError {
  readonly status = 409;
  readonly code = 'CONFLITO';
}

export class BusinessRuleError extends DomainError {
  readonly status = 422;
  readonly code = 'REGRA_DE_NEGOCIO';
}

export class EstoqueInsuficienteError extends DomainError {
  readonly status = 409;
  readonly code = 'ESTOQUE_INSUFICIENTE';
  constructor(produto: string, disponivel: number, solicitado: number) {
    super(
      `Estoque insuficiente para "${produto}": disponível ${disponivel}, solicitado ${solicitado}.`,
    );
  }
}

export class UnauthorizedError extends DomainError {
  readonly status = 401;
  readonly code = 'NAO_AUTENTICADO';
  constructor(message = 'Credenciais inválidas ou ausentes.') {
    super(message);
  }
}

export class ForbiddenError extends DomainError {
  readonly status = 403;
  readonly code = 'SEM_PERMISSAO';
  constructor(message = 'Você não tem permissão para esta ação.') {
    super(message);
  }
}
