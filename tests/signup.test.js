const request = require('supertest');
const app = require('../app'); // Ajuste le chemin vers ton app
const User = require('../models/users'); // Ajuste le chemin vers ton modèle
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Configuration avant les tests
beforeEach(async () => {
  // Nettoie la base de données avant chaque test
  await User.deleteMany({});
});

afterAll(async () => {
  // Ferme la connexion à la base de données après tous les tests
   await mongoose.connection.close();
});

describe('POST /signup', () => {
  
  // Test 1: Inscription réussie avec des données valides
  it('should create a new user successfully with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123'
    };

    const res = await request(app)
      .post('/users/signup')
      .send(userData);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(userData.email);
    expect(res.body.user.username).toBe(userData.username);
    expect(res.body.user.password).toBeUndefined(); // Le mot de passe ne doit pas être retourné

    // Vérifie que l'utilisateur a bien été créé dans la base de données
    const userInDb = await User.findOne({ username: userData.username });
    expect(userInDb).toBeTruthy();
    expect(userInDb.email).toBe(userData.email);
    
    // Vérifie que le mot de passe est bien hashé
    const isPasswordHashed = await bcrypt.compare(userData.password, userInDb.password);
    expect(isPasswordHashed).toBe(true);

    // Vérifie que le token est valide
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(userInDb._id.toString());
  });

  // Test 2: Champ email manquant
  it('should return error when email is missing', async () => {
    const userData = {
      username: 'testuser',
      password: 'password123'
    };

    const res = await request(app)
      .post('/users/signup')
      .send(userData);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(false);
    expect(res.body.error).toBe('Missing or empty fields');
  });

  // Test 3: Champ username manquant
  it('should return error when username is missing', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const res = await request(app)
      .post('/users/signup')
      .send(userData);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(false);
    expect(res.body.error).toBe('Missing or empty fields');
  });

  // Test 4: Champ password manquant
  it('should return error when password is missing', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser'
    };

    const res = await request(app)
      .post('/users/signup')
      .send(userData);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(false);
    expect(res.body.error).toBe('Missing or empty fields');
  });

  // Test 5: Champs vides
  it('should return error when fields are empty strings', async () => {
    const userData = {
      email: '',
      username: 'testuser',
      password: 'password123'
    };

    const res = await request(app)
      .post('/users/signup')
      .send(userData);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(false);
    expect(res.body.error).toBe('Missing or empty fields');
  });

  // Test 6: Username déjà existant
  it('should return error when username already exists', async () => {
    // Crée d'abord un utilisateur
    const existingUser = {
      email: 'existing@example.com',
      username: 'existinguser',
      password: bcrypt.hashSync('password123', 10)
    };
    await new User(existingUser).save();

    // Essaie de créer un utilisateur avec le même username
    const userData = {
      email: 'new@example.com',
      username: 'existinguser', // Même username
      password: 'password456'
    };

    const res = await request(app)
      .post('/users/signup')
      .send(userData);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(false);
    expect(res.body.error).toBe('Username already exists');

    // Vérifie qu'aucun nouvel utilisateur n'a été créé
    const usersCount = await User.countDocuments();
    expect(usersCount).toBe(1);
  });

  // Test 7: Vérification du stockage du token dans la base de données
  it('should store token in database when user is created', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123'
    };

    const res = await request(app)
      .post('/users/signup')
      .send(userData);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);

    // Vérifie que le token est stocké dans la base de données
    const userInDb = await User.findOne({ username: userData.username });
    expect(userInDb.token).toBe(res.body.token);
  });

  // Test 8: Body complètement vide
  it('should return error when body is empty', async () => {
    const res = await request(app)
      .post('/users/signup')
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(false);
    expect(res.body.error).toBe('Missing or empty fields');
  });

  // Test 9: Vérification que le mot de passe n'est jamais retourné en clair
  it('should never return the password in response', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123'
    };

    const res = await request(app)
      .post('/users/signup')
      .send(userData);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.password).toBeUndefined();
    expect(res.body.user.password).toBeUndefined();
    
    // Vérifie que le mot de passe en clair n'apparaît nulle part dans la réponse
    const responseString = JSON.stringify(res.body);
    expect(responseString).not.toContain('password123');
  });

  // Test 10: Format du token JWT
  it('should return a valid JWT token', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123'
    };

    const res = await request(app)
      .post('/users/signup')
      .send(userData);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.token).toBeDefined();
    
    // Vérifie le format du token (3 parties séparées par des points)
    expect(res.body.token.split('.')).toHaveLength(3);
    
    // Vérifie que le token peut être décodé
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded.id).toBeDefined();
    expect(decoded.exp).toBeDefined(); // Vérifie l'expiration
  });
});