var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/users');

/* Refresh token */
router.post('/refresh', async (req, res) =>{
 try {
    const {refreshToken} = req.body;

    // verifie que le token existe
    if(!refreshToken){
      return  res.json({ result: false, error: 'refresh token required' });
       
    }

    // verifier la validité du token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);


    // on cherche le user 

    const user = await User.findById(decoded.id);

        if(!user){
           return res.json({ result: false, error: 'User not found' });
            
        }

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
            
            // on Remplace le refresh token aussi
    const newRefreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    
    user.refreshToken = [{
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }];
    
    await user.save();
            // renvoyer le nouveau token d'accès au client
          return res.json({ result: true, tokens: {token: accessToken, refreshToken: newRefreshToken} });
    } catch (error) {
    // verifie les erreurs jwt
      if (error.name === 'TokenExpiredError') {
     return res.status(401).json({ result: false, error: 'Refresh token expired' });
    } else if (error.name === 'JsonWebTokenError') {
     return res.status(401).json({ result: false, error: 'Invalid refresh token' });
    } else {
     return res.status(500).json({ result: false, error: 'Internal server error' });
    }
 }
});

module.exports = router;
