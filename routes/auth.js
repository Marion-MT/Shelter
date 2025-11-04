var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/users');

/* Refresh token */
router.post('/refresh', (req, res) =>{
 try {
    const {refreshToken} = req.body;

    console.log('Refresh token reçu:', refreshToken);
    // verifie que le token existe
    if(!refreshToken){
        res.json({ result: false, error: 'refresh token required' });
        return
    }

    // verifier la validité du token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    console.log('Décodage refresh token:', decoded);

    // on cherche le user 

    User.findById(decoded.id)
    .then((user) => {
        if(!user){
           return res.json({ result: false, error: 'User not found' });
            
        }
        console.log('Refresh tokens en base:', user.refreshToken);

        // on verifie que le refesh token existe et qu'il n'est pas expiré
        const tokenExiste = user.refreshToken.find((token) => token.token === refreshToken && token.expiresAt > new Date());
        if(!tokenExiste){
          return res.json({ result: false, error: 'Invalid refresh token' });
            
        }
        
            // on génère un nouveau token d'accès
            const accessToken = jwt.sign(
                { id: decoded.id },
                process.env.JWT_SECRET,
                { expiresIn: '15m' } // durée de validité du token d'accès
            );
        
            // renvoyer le nouveau token d'accès au client
            res.json({ result: true, token: accessToken });
    }).catch((err) => {
        res.json({ result: false, error: 'Database error' });
    });

 } catch (error) {
    // verifie les erreurs jwt
      if (error.name === 'TokenExpiredError') {
      res.status(401).json({ result: false, error: 'Refresh token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ result: false, error: 'Invalid refresh token' });
    } else {
      res.status(500).json({ result: false, error: 'Internal server error' });
    }
 }
});

module.exports = router;
