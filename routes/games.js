var express = require('express');
var router = express.Router();
const Game = require('../models/games')
const authenticateToken = require('../middlewares/authMiddleWare');;
const User = require('../models/users')
const Card = require('../models/cards')
const { checkBody } = require('../modules/checkBody')
const { applyEffects } = require('../modules/applyEffects')
const Ending = require('../models/endings')


/* nouvelle games */
router.post('/new', authenticateToken, async (req, res) => {
 try {
    //console.log('User du middleWare: ', req.user)
const userId = req.user.userId

const activeGame = await Game.findOne({ player: userId , ended: false });
const cards = await Card.find({ pool: "general"});
const cardSelect = cards[Math.floor(Math.random() * (cards.length))];

// verifie si une partie est en court et la transforme en partie terminer
    if(activeGame) {
        activeGame.ended = true
        await activeGame.save()
    }
// crée une nouvelle partie
    const newGame = await new Game({

    player: userId,
    currentCard: cardSelect._id,
    })
    await newGame.save()

    const populatedGame= await Game.findById(newGame._id).populate('currentCard')

    // MAJ historique avec verif de doublon + currentGame
    const user = await User.findById(userId)

   //console.log('User de la bd : ' ,user)
        if(!user) {
            return res.json({ result : false , error: ' Utilisateur non trouvé'})
        }
        if(!user.historicGames.includes(newGame._id)){
            user.historicGames.push(newGame._id)
        }

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

    currentCard = await user.currentGame.currentCard
    //console.log( 'current card: ' , currentCard)
    return res.json({ result: true , currentGame: user.currentGame})
    } catch (err) {
        return res.json({ result: false, error: err.message})
    }
})

/*  choix du joueur " gauche: non / droite: oui "*/

router.post('/choice', authenticateToken, async (req,res) => {
    try {

        const userId = req.user.userId
        const { choice } = req.body;

        if (!checkBody(req.body,['choice'])) {
            return res.json({ result: false, error: 'Missing or empty fields'})
            ;
        }
        const user = await User.findById(userId)
        .populate({
            path: 'currentGame',
            populate: 'currentCard'
        })
        
        if(!user.currentGame) {
            return res.json({ result:false , error : 'Aucune partie en cours !'})
        }
        if(!user.currentGame.currentCard) {
            return res.json({ result:false , error : 'Aucune carte selectionner !'})
        }
            const effects = choice === 'right' ? user.currentGame.currentCard.right.effect : user.currentGame.currentCard.left.effect;

            const game = await Game.findById(user.currentGame._id)
            .populate('currentCard')
            
            //console.log(Object.keys(effects))
            Object.keys(effects).forEach(key => {        // <--- Object.keys() sert a recuperer les clés de effects
                game.stateOfGauges[key] += effects[key];        
            });

            game.markModified('stateOfGauges');            // <--- sert marquer le sous-document comme modifier sinon crash "de ce que j'ai compris detecte pas les modif des sous doc imbriqué"
            await game.save();

            // verifie si une jauge est a 0 pour mettre fin a la partie
         for (const [key, value] of Object.entries(game.stateOfGauges._doc)) { /// <--- obliger d'utiliser Object. et ._doc pour recuperer en brut car c'est un sous document \\\ on recuper clé et valeur ///
                if (key != 'food' && value <= 0) {
                    
                    user.bestScore = Math.max(user.bestScore, game.numberDays)
                    user.currentGame.ended = true 
                    user.currentGame = null
                    await user.save()
                    const death = await Ending.findOne({ type:key})
                    
                    return res.json({ 
                    result: true, 
                    gameover: true, 
                    gauges: game.stateOfGauges,
                    death: death,
                    bestscore: user.bestScore
                });
    }
}

        // ICI push et changement de card selectionner
        game.usedCards.push(game.currentCard)
        
        const exludedIds =  game.usedCards  
        // <-- Find de card en excluant les IDs regroupés dans "exclude" grâce à $nin JE NE CONNAISSAIS PAS ! -->
        //const cardsFiltred = await Card.find({ _id: { $nin: exludedIds } });  
        const cards = await Card.find({pool: "general"})
        
        
        console.log(game.currentCard)
        if(game.stateOfGauges.food <= 0 ) {
            game.stateOfGauges.hunger -= 10 
        }

        /*if(cardsFiltred.length === 0) {
            return res.json({ result : false, error: 'Aucune carte disponible'})
        }*/
        if(game.currentCard.incrementsDay){
            game.numberDays += 1
            game.stateOfGauges.food += -10
        }
        const cardSelect = cards[Math.floor(Math.random() * (cards.length))];
        game.currentCard = cardSelect._id
        await game.save()
        
        const famine = game.stateOfGauges.food <= 0 ? true : false ;
        //console.log(' filter card: ',cardsfilter)
        const populatedGame = await Game.findById(game._id).populate('currentCard')

    return res.json({ result : true , gameover: false , gauges: populatedGame.stateOfGauges, card: populatedGame.currentCard, numberDays: populatedGame.numberDays , famine: famine, })

    } catch (err) {
        return res.json({ result: false, error: err.message})
    }
})



module.exports = router;
