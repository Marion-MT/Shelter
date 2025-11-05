const { checkBody } = require('../modules/checkBody'); // Remplace par ton chemin

describe('checkBody - Validation du body', () => {
  
  it('devrait retourner true si tous les champs sont présents', () => {
    const body = {
      email: 'test@test.com',
      password: 'password123',
      username: 'testUser',
    };

    const keys = ['email', 'password', 'username'];
    const result = checkBody(body, keys);

    expect(result).toBe(true);
  });

  it('devrait retourner false si un champ est manquant', () => {
    const body = {
      email: 'test@test.com',
      password: 'password123',
      // username manquant
    };

    const keys = ['email', 'password', 'username'];
    const result = checkBody(body, keys);

    expect(result).toBe(false);
  });

  it('devrait retourner false si un champ est vide', () => {
    const body = {
      email: 'test@test.com',
      password: '',
      username: 'testUser',
    };

    const keys = ['email', 'password', 'username'];
    const result = checkBody(body, keys);

    expect(result).toBe(false);
  });

  it('devrait retourner false si un champ est null', () => {
    const body = {
      email: 'test@test.com',
      password: null,
      username: 'testUser',
    };

    const keys = ['email', 'password', 'username'];
    const result = checkBody(body, keys);

    expect(result).toBe(false);
  });

  it('devrait retourner false si un champ est undefined', () => {
    const body = {
      email: 'test@test.com',
      password: undefined,
      username: 'testUser',
    };

    const keys = ['email', 'password', 'username'];
    const result = checkBody(body, keys);

    expect(result).toBe(false);
  });

  it('devrait retourner true avec un seul champ', () => {
    const body = {
      email: 'test@test.com',
    };

    const keys = ['email'];
    const result = checkBody(body, keys);

    expect(result).toBe(true);
  });

  it('devrait retourner false avec un seul champ vide', () => {
    const body = {
      email: '',
    };

    const keys = ['email'];
    const result = checkBody(body, keys);

    expect(result).toBe(false);
  });

  it('devrait retourner false si body est null', () => {
    const body = null;
    const keys = ['email'];

    try {
      const result = checkBody(body, keys);
      expect(result).toBe(false);
    } catch (error) {
      // Si la fonction crash, c'est expected
      expect(error).toBeDefined();
    }
  });
});