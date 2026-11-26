import { hashSenha, verificarSenha } from './password.hasher.js';

describe('password.hasher', () => {
  it('gera hash diferente da senha e verifica corretamente', async () => {
    const hash = await hashSenha('Senha@1234');
    expect(hash).not.toContain('Senha@1234');
    expect(await verificarSenha('Senha@1234', hash)).toBe(true);
    expect(await verificarSenha('outra-senha', hash)).toBe(false);
  });

  it('usa salt: a mesma senha gera hashes diferentes', async () => {
    expect(await hashSenha('abc12345')).not.toBe(await hashSenha('abc12345'));
  });

  it('rejeita formato inválido', async () => {
    expect(await verificarSenha('x', 'texto-puro')).toBe(false);
  });
});
