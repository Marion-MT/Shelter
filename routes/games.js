var express = require('express');
var router = express.Router();
const Game = require('../models/games')
const authenticateToken = require('../middlewares/authMiddleWare');;
const User = require('../models/users')
const Card = require('../models/cards')
const { checkBody } = require('../modules/checkBody')
const {
    getRandomCard,
    applyChoiceEffects,
    handleFamine,
    checkGameOver,
    incrementDay,
    manageCardCooldown,
    getNextCard,
    endGame,
    prepareNewGame
    } = require('../modules/gameFunctions')
const Ending = require('../models/endings');
const { checkAchievements } = require('../modules/checkAchievements');
const Achievement = require('../models/achievements');


/* nouvelle games */
router.post('/new', authenticateToken, async (req, res) => {
 try {
    //console.log('User du middleWare: ', req.user)
const userId = req.user.userId

   // prépare une nouvelle game et la first carte
   const cardSelect = await prepareNewGame(userId)
   
    // crée une nouvelle partie
    const newGame = new Game({

    player: userId,
    currentCard: cardSelect._id,
    })
    await newGame.save()

    const populatedGame= await Game.findById(newGame._id).populate('currentCard')

    // MAJ historique avec verif de doublon + currentGame
    const user = await User.findById(userId)

   //console.log('User de la bd : ' ,user)
   /*
        if(!user) {
            return res.json({ result : false , error: ' Utilisateur non trouvé'})
        }
        if(!user.historicGames.includes(newGame._id)){
            user.historicGames.push(newGame._id)
        }
*/
        user.currentGame = newGame._id

        await user.save()

    

    return res.json({ result: true, message: 'Nouvelle partie crée', game: populatedGame})

} catch (err) {
    return res.json({ result:false, error: err.message})
}
})

/* historique game */

router.get('/', authenticateToken, async (req,res) => {

    try {

    const userId = req.user.userId
    const userGame = await Game.find({ player: userId , ended: true });
        
    return res.json({ result: true, games: userGame})

    } catch (err) {
        return res.json({ result: false, error: err.message})
    }
})

/* current game */

router.get('/current', authenticateToken, async (req,res) => {

    try {
    const userId = req.user.userId
    const user = await User.findById(userId)
        .populate({
            path: 'currentGame',
            populate: 'currentCard'
        })
        

    if (!user.currentGame) {
        return res.json({ result:false , error: 'Aucune game en cours'})
    }

    //console.log( 'current card: ' , currentCard)
    return res.json({ result: true , currentGame: user.currentGame})
    } catch (err) {
        return res.json({ result: false, error: err.message})
    }
})

/*  choix du joueur " gauche: non / droite: oui "  */

router.post('/choice', authenticateToken, async (req,res) => {
    try {

        const userId = req.user.userId
        const { choice } = req.body;
        const achievementsCurrentGame = []

        if (!checkBody(req.body,['choice'])) {
            return res.json({ result: false, error: 'Missing or empty fields'})
            ;
        }

        // on récup l'utilisateur et la partie 
        const user = await User.findById(userId)
        .populate({
            path: 'currentGame',
            populate: 'currentCard'
        })
        .populate('unlockedAchievements')
        
        if(!user.currentGame) {
            return res.json({ result:false , error : 'Aucune partie en cours !'})
        }
        if(!user.currentGame.currentCard) {
            return res.json({ result:false , error : 'Aucune carte selectionner !'})
        }

        // on récup le choix (left ou right)
            const choiceSimp = choice === 'right'
            ? user.currentGame.currentCard.right 
            : user.currentGame.currentCard.left;

        // on récup la game en cours
            const game = user.currentGame
            
            //console.log(Object.keys(effects))

            // on applique les effets
        applyChoiceEffects(game,choiceSimp)           
            await game.save();
            
            // on gere le manque de nourriture
        handleFamine(game)
            await game.save()
            // verifie si une jauge est a 0 pour mettre fin a la partie
        const gameOverReason = checkGameOver(game)
         if(gameOverReason) {
            const reponse = await endGame(game, user, gameOverReason, achievementsCurrentGame)
            return res.json(reponse)
         }

         // incrémentation days
         const dayIncremented = incrementDay(game) 
            if(dayIncremented){
                
                //on incrémente les cooldown
                await manageCardCooldown(game)
                    }
            await game.save()
                   // console.log(game.usedCards)

        // check achievelents
        const Achiev = await checkAchievements(user, game)
        if(Achiev.success){
        achievementsCurrentGame.push(...Achiev.events)
        await user.save()
        }
        // ICI push et changement de card selectionner
        game.usedCards.push({cardId:game.currentCard, cooldownUsed : 0})


        // on récup la prochain carte
        const nextCard = await getNextCard(game, choiceSimp)
        game.currentCard = nextCard._id
        await game.save()

        //console.log(' filter card: ',cardsfilter)

        // on recup game populate pour la reponse
        const populatedGame = await Game.findById(game._id).populate('currentCard')
        
        //console.log(Achiev)
    return res.json({ 
        result : true ,
        gameover: false ,
        gauges: populatedGame.stateOfGauges, 
        card: populatedGame.currentCard, 
        numberDays: populatedGame.numberDays , 
        achievements: Achiev.events ? Achiev : false,
        famine: game.stateOfGauges.food <= 0 ? true : false })
    } catch (err) {
        return res.json({ result: false, error: err.message})
    }
})

///////// GET top 3 best score all games///////////
router.get('/topScores',  authenticateToken, async (req, res) =>{

  try{
    const userId = req.user.userId

    if (!userId) {
        return res.status(401).json({result: false, error:"Vous n'êtes pas autorisé."})
    }

    const topScoresDocs = await Game.find({ended: true})
        .sort({ numberDays: -1 })
        .limit(3)
        .select('numberDays');

    const topScores = topScoresDocs.map(doc => doc.numberDays);

  return res.json({result : true, topScores : topScores});

  }catch (error){
    console.error("Erreur inattendue dans /delete :", error.message);
    res.status(500).json({result: false, error: "Erreur interne du serveur"});
  }
});

module.exports = router;
