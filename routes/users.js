var express = require('express');
var router = express.Router();
const User = require ('../models/users');
const Game = require ('../models/games');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { checkBody } = require('../modules/checkBody');
const authenticateToken = require ('../middlewares/authMiddleWare')


/////////////////Routes POST////////////////////
      ////////Route Inscription////////
      router.post('/signup', (req, res) => {
        // Check si tous les champs sont copmplétés
  if (!checkBody(req.body,['email','password'])) {
    res.json({result: false, error:'Missing or empty fields'});
    return;
  }
  try {
  const {email, password} = req.body;
    // Check si utilisateur déjà inscrit avant de créer un nouvel utilisateur
  User.findOne({email})
  .then(data =>{
    if (data === null) {
      // si l'utilisateur n'existe pas créationb nouvel utilisateur
      const hash = bcrypt.hashSync(password, 10);
      const newUser = new User({
        email,
        password: hash, 
      })
      newUser.save()
      .then(data => {
        //création du token
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
      .catch(err => {
        console.error('Erreur lors du .save :', err.message)
        res.status(500).json({result: false, error: 'Erreur serveur lors de la sauvegarde' })
      })
    } else {
      //si l'utilisateur existe déjà
      res.json({result: false, error : 'User already exists'})
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
  if(!checkBody(req.body, ['email', 'password'])){
    res.json({result: false, error : 'Missing or empty fields'});
    return;
  }
  try {
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
        data.save().then(() =>{
        //Renvoyer le token au client
      res.json({result: true, 
        token, 
        message: 'you are connected',
        user: {
          email: data.email,
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




///////////////////Route Get//////////////////////
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
      .select('bestScore');

    const topScores = topScoresDocs.map(doc => doc.bestScore);

  return res.json({result : true, topScores : topScores});

  }catch (error){
    console.error("Erreur inattendue dans /delete :", error.message);
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
  const {volume, soundOn} = req.body;
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
