var express = require('express');
var router = express.Router();
const User = require ('../models/users');
const Game = require ('../models/games');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { checkBody } = require('../modules/checkBody');
const authenticateToken = require ('../middlewares/authMiddleWare')
const nodemailer = require('nodemailer');
const crypto = require('crypto')
const { sendResetEmail } = require('../utilitaires/emailService');

const FRONT_END_RESET = process.env.FRONT_END_RESET

/////////////////Routes POST////////////////////
      ////////Route Inscription////////
      router.post('/signup', (req, res) => {
        // Check si tous les champs sont copmplétés
  if (!checkBody(req.body,['email','password','username'])) {
    res.json({result: false, error:'Missing or empty fields'});
    return;
  }
  try {
    const {email, username, password} = req.body;
    if(!username.trim()) {
      return res.json({result: false, error: "Le nom d'utilisateur ne peut pas être vide"})
    }
    // Check si utilisateur déjà inscrit avant de créer un nouvel utilisateur
  User.findOne({username})
  .then(data =>{
    if (data === null) {
      // si l'utilisateur n'existe pas créationb nouvel utilisateur
      const hash = bcrypt.hashSync(password, 10);
      const newUser = new User({
        email,
        username,
        password: hash, 
        refreshToken: [],
      })
      newUser.save()
      .then(data => {
        //création du token
        const accessToken = jwt.sign(
          {id: data._id},
          process.env.JWT_SECRET,
          {expiresIn: '1m'}
        );

        //création du refresh token
        const refreshToken = jwt.sign(
          {id: data._id},
          process.env.REFRESH_SECRET,
          {expiresIn: '7d'}
        );


        data.refreshToken.push({
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7*24*60*60*1000) // date d'expiration dans 7 jours
        });

        //sauvegarde le token en BDD
    
        data.save()
        .then(() => {

          //renvoyer le token au client)
        res.json({
          result: true, 
          token: accessToken,    // token court pour accès aux routes protégées
          refreshToken,  // token long pour renouveler le token d'accès
          user: {
          email: data.email,
          username: data.username 
        }
        })
      })
      .catch(err => {
        console.error('Erreur sauvegarde tokens :', err.message)
        res.status(500).json({result: false, error: 'Erreur serveur' })
      })
      })
      .catch(err => {
        console.error('Erreur lors du .save :', err.message)
        res.status(500).json({result: false, error: 'Erreur serveur lors de la sauvegarde'})
      })
    } else {
      //si l'utilisateur existe déjà
      res.json({result: false, error : 'Username already exists'})
    }
  })
  .catch(err => {
    console.error('Erreur lors du findOne :', err.message);
    res.status(500).json({result: false, error: 'Erreur serveur lors de la recherche utilisateur'})
  })
} catch (error) {
  console.error('Erreur serveur Signup', error.message)
  res.status(500).json({result: false, error: 'Internal serveur error - Signup'})
}
})



      ////////Route Connexion////////

router.post('/signin', (req, res) => {
  if(!checkBody(req.body, ['username', 'password'])){
    res.json({result: false, error : 'Missing or empty fields'});
    return;
  }
  try {
  const {username, password} = req.body;
  User.findOne({username}).then(data=>{
    if (data && bcrypt.compareSync(password, data.password)){
      //génération du token JWT
      const accesToken= jwt.sign( 
        {id: data._id}, //payload (données encodées dans le token)
        process.env.JWT_SECRET, // clé secrète dans le .env
        {expiresIn:'1m'}) //délai de validité du jeton

        //création du refresh token
        const refreshToken = jwt.sign(
          {id: data._id},
          process.env.REFRESH_SECRET,
          {expiresIn: '7d'}
        );

        data.refreshToken.push({
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7*24*60*60*1000) // date d'expiration dans 7 jours
        });
        
        // Génération du token JWT

        //sauvegarde le token en BDD
        data.save().then(() =>{

        //Renvoyer les token au client
      res.json({result: true, 
        token: accesToken,   // token court pour accès aux routes protégées
        refreshToken,  // token long pour renouveler le token d'accès
        message: 'you are connected',
        user: {
          email: data.email,
          username: data.username,
          bestScore: data.bestScore,
          currentGame: data.currentGame,
          settings: data.settings,
          unlockedAchievements: data.unlockedAchievements
        }
      })
    })
        .catch(err => {
          console.error('Erreur lors du .save', err.message)
          res.status(500).json({result: false, error: 'Erreur serveur lors de la sauvegarde'})
        })
    } else {
      res.json({result : false, error: 'User not found or wrong password'})
    }
  })
  .catch(err=>{
    console.error('Erreur lors du findOne: ', err.message)
    res.status(500).json({result: false, error: 'Erreur serveur lors de la recher utilisateur'})
  })
} catch (error) {
  console.error('Erreur inattendue dans le signin : ', error.message)
  res.status(500).json({result: false, error: 'Internal serveur error - Signin'})
}
})

///////// Reset stats/achievements  /////////
router.post('/reset', authenticateToken, async (req,res) => {
  try {
  const userId= req.user.userId
  if (!userId){
    return res.status(401).json({result: false, error: "Vous n'êtes pas autorisé"})
  }
  const updateUser = await User.findByIdAndUpdate(
    userId,
    {bestScore : 0, unlockedAchievements: [], currentGame : null},
    {new : true} //permet à la requête de renvoyer les infos du User mis à jours 
  )

  await Game.deleteMany({player : userId});

  if (!updateUser){
    return res.status(400).json({result: false, error: "Utilisateur non trouvé"})
  } else {
    res.json({result: true})
  }} catch (error){
    console.error("Erreur dans /reset :", error.message)
    res.status(500).json({result: false, error: 'Erreur interne du serveur - Reset'})
  }
  })

///////// POST Reset Password : demande de réinitialisation  ///////////
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            // Ne pas révéler si l'email existe (sécurité)
            return res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
        }
        
        // Générer un token unique
        const token = crypto.randomBytes(32).toString('hex');
        
        // Sauvegarder le token et l'expiration dans l'utilisateur
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
        await user.save();
        
        // Envoyer l'email
        const resetLink = `${FRONT_END_RESET}/reset-password?token=${token}`;
        await sendResetEmail(user.email, resetLink);
        
        res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

///////// POST Reset Password : Réinitialiser le mot de passe  ///////////
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    
    try {
        // Trouver l'utilisateur avec un token valide
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ error: 'Token invalide ou expiré' });
        }
        
        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Mettre à jour le mot de passe et supprimer les champs de reset
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        
        res.json({ message: 'Mot de passe réinitialisé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

///////////////////Route Get//////////////////////
      ///////// GET Reset Password : Vérifier le token  ///////////
router.get('/verify-reset-token/:token', async (req, res) => {
    const { token } = req.params;
    
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Token non expiré
        });
        
        if (!user) {
            return res.status(400).json({ valid: false, message: 'Token invalide ou expiré' });
        }
        
        res.json({ valid: true });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

      ///////// GET ALL users  ///////////
router.get('/', (req, res) => {
  User.find().then(data =>{
    res.json({allUsers: data})
  })
});


      ///////// GET user profile  ///////////
router.get('/data', authenticateToken, (req, res) =>{
  try{
    const userId = req.user.userId

  if (!userId) {
    return res.status(401).json({result: false, error:"Vous n'êtes pas autorisé."})
  }
  User.findById(userId)
  .then(data => {
    if (userId){
      res.json({result: true, 
        email: data.email,
        username: data.username,
        bestScore: data.bestScore,
        currentGame: data.currentGame,
        settings: data.settings,
        unlockedAchievements: data.unlockedAchievements
      })
    } else {
      return res.status(404).json({result: false, error : "Vous n'êtes pas autorisé"})
    }
  })
  .catch(err =>{
    console.error('Erreur lors du findByID :', err.message)
    res.status(500).json({result: false, error: 'Erreur serveur lors de la recherche User'})
  })
}catch (error){
  console.error("Erreur inattendue dans /data :", error.message)
  res.status(500).json({result: false, error: "Erreur interne du serveur"})
}
})

///////// GET top 3 best score by player///////////
router.get('/topScores',  authenticateToken, async (req, res) =>{
  try{
    const userId = req.user.userId

  if (!userId) {
    return res.status(401).json({result: false, error:"Vous n'êtes pas autorisé."})
  }

  const topScoresDocs = await User.find()
      .sort({ bestScore: -1 })
      .limit(3)
      .select('username bestScore');

      const topScores = topScoresDocs.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      bestScore: user.bestScore
    }));

  return res.json({result : true, topScores : topScores});

  }catch (error){
    console.error("Erreur inattendue dans /topScores :", error.message);
    res.status(500).json({result: false, error: "Erreur interne du serveur"});
  }
});

///////// Get unlockedAchievements /////////
router.get('/unlockedAchievement', authenticateToken, (req, res) =>{
  try{
    const userId = req.user.userId

  if (!userId) {
    return res.status(401).json({result: false, error:"Vous n'êtes pas autorisé."})
  }
User.findById(userId)
.populate('unlockedAchievements','name description')
.then(data => {
  if(userId){
    res.json({result: true,
      unlockedAchievements: data.unlockedAchievements
    })
  } else {
    return res.status(404).json({result: false, error: "Vous n'êtes pas autorisé"})
  }
})
.catch(err => {
  console.error('Erreur lors du findByID :', err.message)
    res.status(500).json({result: false, error: 'Erreur serveur lors de la recherche User'})
  })
}catch (error){
  console.error("Erreur inattendue dans /unlocked achievement :", error.message)
  res.status(500).json({result: false, error: "Erreur interne du serveur"})
}
})


///////////////////Routes PUT//////////////////////
///////// Give stats/achievements pour faire des tests en dev /////////
router.post('/givStats', authenticateToken, (req,res) => {
  const userId= req.user.userId
  User.findByIdAndUpdate(
    userId,
    {bestScore : 105, unlockedAchievements: [], currentGame : "507f1f77bcf86cd799439011"},
    {new : true} //permet à la requête de renvoyer les infos du User mis à jours 
  ).then(data => {
    if (userId){
    res.json({result: true, user: data})
     } else {
      res.json({result: false, error: "Vous n'êtes pas autorisé"})
    }
  })
})


    ///////// MAJ paramètres  /////////
router.put('/settings', authenticateToken, (req, res) => {
  try{
  const userId= req.user.userId;

  if (!userId){
    return res.status(401).json({restul: false, error: "Vous n'êtes pas autorisé."})
  }
  const {volume, soundOn, btnSoundOn} = req.body;
  const updateSettings = {};

  if(volume !== undefined) updateSettings['settings.volume'] = volume;
  if(soundOn !== undefined) updateSettings['settings.soundOn'] = soundOn;
  if(btnSoundOn !== undefined) updateSettings['settings.btnSoundOn'] = btnSoundOn;

  User.findByIdAndUpdate(
    userId,
    {$set: updateSettings}, //update seulement les champs settings présents dans la requête
    {new: true}
  )
  .then(data => {
    res.json({result: true, settings: data.settings})
  })
  .catch(err =>{
    console.error('Erreur lors du findByID :', err.message)
    res.status(500).json({result: false, error: 'Erreur serveur lors de la recherche Settings'})
  })
}catch (error){
  console.error("Erreur inattendue dans /settings :", error.message)
  res.status(500).json({result: false, error: "Erreur interne du serveur - settings"})
}
})


///////////////////Routes Delete//////////////////////
    ///////// Delete account  /////////
                              //↓ middleware//
router.delete('/', authenticateToken, (req, res) => {
try{
  const userId= req.user.userId; //info provenant du Middleware

  if (!userId){
    return res.status(401).json({restul: false, error: "Vous n'êtes pas autorisé."})
  }
  User.findByIdAndDelete(userId).then(()=>{
    Game.deleteMany({player : userId}).then(() => {
      res.json({result: true, message: 'Compte et partie associées supprimées'});
    });
  })
  .catch(err =>{
    console.error('Erreur lors du findByIDAndDelete :', err.message)
    res.status(500).json({result: false, error: 'Erreur serveur lors de la recherche delete'})
  })

  

}catch (error){
  console.error("Erreur inattendue dans /delete :", error.message)
  res.status(500).json({result: false, error: "Erreur interne du serveur"})
}
})




module.exports = router;
