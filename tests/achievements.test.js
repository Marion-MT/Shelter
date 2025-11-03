const request = require('supertest');
const express = require('express');

const achievementsRouter = require('../routes/achievements'); // Import de la route à tester

// Création d'une instance express pour les tests avec juste le router qu'on veut tester
const app = express(); 
app.use(express.json());
app.use('/achievements', achievementsRouter);


// Mock
jest.mock('../models/achievements', () => ({
  find: jest.fn().mockResolvedValue([
    { name: 'Compagnon à quatre pattes', description: 'Vous avez adopté un chien.', image: 'dog' },
    { name: 'Bricoleur', description: 'Vous avez réparé une radio.', image: 'radio' },
  ])
}));


describe('GET /achievements', () => {

  // Test : la route doit renvoyer la liste des achievements
  it('should return achievements list', async () => {

    const res = await request(app).get('/achievements');

    expect(res.statusCode).toBe(200); // statut  OK
    expect(res.body.result).toBe(true); // result doit être true
    expect(res.body.achievements.length).toBe(2); // on attend 2 achievements
    expect(res.body.achievements[0].name).toBe('Compagnon à quatre pattes'); // 1er achievement correct
    expect(res.body.achievements[0].description).toBe('Vous avez adopté un chien.');
    expect(res.body.achievements[0].image).toBe('dog');
    expect(res.body.achievements[1].name).toBe('Bricoleur'); // 2eme achievement correct
    expect(res.body.achievements[1].description).toBe('Vous avez réparé une radio.');
    expect(res.body.achievements[1].image).toBe('radio');
  });


  // Test : la route doit renvoyer une erreur
  it('should handle errors', async () => {

    const Achievements = require('../models/achievements');

    // Simulation de l'erreur
    Achievements.find.mockRejectedValueOnce(new Error('Database error'));

    const res = await request(app).get('/achievements');

    expect(res.body.result).toBe(false);    // result doit être false
    expect(res.body.error).toBe('Database error');
  });

});