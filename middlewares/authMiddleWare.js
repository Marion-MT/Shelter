const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    
    if (!token) {
      return res.json({ result: false, error: 'Token manquant' });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ajouter les infos du user à la requête pour les routes suivantes
    req.user = {
      userId: decoded.userId
    };
    
    // Passer à la route suivante
    next();
    
  } catch (error) {
    return res.json({ result: false, error: 'Token invalide ou expiré' });
  }
};

module.exports = authenticateToken;