const request = require('supertest');
const express = require('express');
const router = require('../routes/users.js');
const authenticateToken = require('../middlewares/authMiddleWare.js');

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {}); // désactive les erreurs console
});

// Remplace le JWT pour que le test passe comme si il était authentifié
jest.mock('../middlewares/authMiddleWare.js', () =>
  jest.fn((req, res, next) => {
    req.user = { userId: 'fakeUserId123' };
    next();
  })
);

// Gère la fausse base de donnée
jest.mock('../models/users.js', () => ({
  findByIdAndUpdate: jest.fn(),
}));

const User = require('../models/users.js');

// Crée une app express local
const app = express();
app.use(express.json());
app.use('/', router);

// Néttoie les Mocks entre chaque test
describe('PUT /settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // test qui simule un utilisateur sans Id
  it('refuse la requête si userId est manquant', async () => {
    authenticateToken.mockImplementationOnce((req, res, next) => {
      req.user = {};
      next();
    });

    const res = await request(app)
      .put('/settings')
      .send({ volume: 50 });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/autorisé/i);
  });

  // test qui simule la requéte PUT avec les bon paramètres
  it('met à jour les settings avec succès', async () => {
    const fakeUser = {
      settings: { volume: 80, soundOn: true, btnSoundOn: false },
    };

    User.findByIdAndUpdate.mockResolvedValueOnce(fakeUser);

    const res = await request(app)
      .put('/settings')
      .send({ volume: 80, soundOn: true });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.settings.volume).toBe(80);

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      'fakeUserId123',
      { $set: { 'settings.volume': 80, 'settings.soundOn': true } },
      { new: true }
    );
  });

  // test qui simule une erreur Mongo DB
  it('gère correctement une erreur Mongo', async () => {
    User.findByIdAndUpdate.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .put('/settings')
      .send({ volume: 10 });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Erreur serveur/i);
  });
});
