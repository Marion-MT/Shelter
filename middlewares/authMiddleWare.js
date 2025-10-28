const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN" => Bearer est un standard HTTP et une convention pour l'utilisation des JWT, le serveur regarde ce mot pour savoir comment interpréter ce qui suit
    
    if (!token) {
      return res.json({ result: false, error: 'Missing Token' });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //le console.log devoded donne : l'userId + iat (stampmark du début du token) + exp (date expiraion du token) => valeur numérique UNIX (nb de secondes écoulées depuis le 01/01/1970)
    console.log('JWT decode payload: ', decoded)
    // Ajouter les infos du user à la requête pour les routes suivantes
    req.user = {
      userId: decoded.id
    };
    
    // Valider et passer à la route demandée si le token est OK
    next();
    
  } catch (error) {
    console.error('JWT error:', error)
    return res.json({ result: false, error: 'Token invalide ou expiré' });
  }
};

module.exports = authenticateToken;