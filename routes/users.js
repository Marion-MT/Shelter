var express = require('express');
var router = express.Router();
const User = require ('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { checkBody } = require('../modules/checkBody');
const authenticateToken = require ('../middlewares/authMiddleWare')


/////////////////Routes POST////////////////////
      ////////Route Inscription////////

      // Check si tous les champs sont copmplétés
router.post('/signup', (req, res) => {
  if (!checkBody(req.body,['email','password'])) {
    res.json({result: false, error:'Missing or empty fields'});
    return;
  }
  const {email, password} = req.body;
    // Check si utilisateur déjà inscrit avant de créer un nouvel utilisateur
  User.findOne({email}).then(data =>{
    if (data === null) {
      // si l'utilisateur n'existe pas
      const hash = bcrypt.hashSync(password, 10);
      const newUser = new User({
        email,
        password: hash, 
      })
      newUser.save().then(data => {
        const token = jwt.sign(
          {id: data._id},
          process.env.JWT_SECRET,
          {expiresIn: '24h'}
        );
        data.token = token;
        data.save();

        res.json({result: true, 
          token,
          user: {
          email: data.email}
        })
      })
    } else {
      //si l'utilisateur existe déjà
      res.json({result: false, error : 'User already exists'})
    }
  })
} )



      ////////Route Connexion////////

router.post('/signin', (req, res) => {
  if(!checkBody(req.body, ['email', 'password'])){
    res.json({result: false, error : 'Missing or empty fields'});
    return;
  }
  const {email, password} = req.body;
  User.findOne({email}).then(data=>{
    if (data && bcrypt.compareSync(password, data.password)){
      //génération du token JWT
      const token= jwt.sign( 
        {id: data._id}, //payload (données encodées dans le token)
        process.env.JWT_SECRET, // clé secrète dans le .env
        {expiresIn:'24h'}) //délai de validité du jeton

        //sauvegarde le token en BDD
        data.token = token;
        data.save();

        //Renvoyer le token au client
      res.json({result: true, 
        token, 
        user: {
          email: data.email,
          message: 'you are connected',
          bestScore: data.bestScore,
          currentGame: data.currentGame,
          settings: data.settings,
          historicGames: data.historicGames,
          UnlockedAchievements: data.UnlockedAchievements
        }})
    } else {
      res.json({result : false, error: 'User not found or wrong password'})
    }
  })
})

///////// Reset stats/achievements  /////////
router.post('/reset', authenticateToken, (req,res) => {
  const userId= req.user.userId
  User.findByIdAndUpdate(
    userId,
    {bestScore : 0, historicGames: [], UnlockedAchievements: [], currentGame : null},
    {new : true} //permet à la requête de renvoyer les infos du User mis à jours 
  ).then(data => {
    if (userId){
      res.json({result: true, user: data})
    } else {
      res.json({result: false, error: "Vous n'êtes pas autorisé"})
    }
  })
})



///////////////////Route Get//////////////////////
      ///////// GET ALL users  ///////////
router.get('/', (req, res) => {
  User.find().then(data =>{
    res.json({allUsers: data})
  })
});


      ///////// GET user profile  ///////////
router.get('/data', authenticateToken, (req, res) =>{
  const userId=req.user.userId
  User.findById(userId)
  .then(data => {
    if (userId){
      res.json({result: true, 
        email: data.email,
        bestScore: data.bestScore,
        currentGame: data.currentGame,
        settings: data.settings,
        UnlockedAchievements: data.UnlockedAchievements
      })
    } else {
      res.json({result: false, error : "Vous n'êtes pas autorisé"})
    }
  })
})

///////////////////Routes PUT//////////////////////
///////// Give stats/achievements pour faire des tests en dev /////////
router.post('/givStats', authenticateToken, (req,res) => {
  const userId= req.user.userId
  User.findByIdAndUpdate(
    userId,
    {bestScore : 105, historicGames: ["68ff940e76f8c00d29c467df"], UnlockedAchievements: [], currentGame : "507f1f77bcf86cd799439011"},
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
  const {volume, soundOn} = req.body;
  const userId= req.user.userId

  const updateSettings = {};
  if(volume !== undefined) updateSettings['settings.volume'] = volume;
  if(soundOn !== undefined) updateSettings['settings.soundOn'] = soundOn;

  User.findByIdAndUpdate(
    userId,
    {$set: updateSettings}, //update seulement les champs settings présents dans la requête
    {new: true}
  )
  .then(data => {
    res.json({result: true, settings: data.settings})
  })
  .catch(error => {
    res.json({result: false, error: error.message || 'Erreur de mise à jour'})
  })
})


///////////////////Routes Delete//////////////////////
    ///////// Delete account  /////////
                              //↓ middleware//
router.delete('/delAccount', authenticateToken, (req, res) => {

  const userId=req.user.userId //info provenant du Middleware
  User.findByIdAndDelete(userId).then(()=>{
    res.json({result: true, message: 'Compte supprimé'})
  })
})

module.exports = router;
