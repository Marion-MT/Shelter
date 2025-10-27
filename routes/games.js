var express = require('express');
var router = express.Router();
const Game = require('../models/games')
const authMiddleWare = require('../middlewares/authMiddleWare');;
const User = require('../models/users')
const Card = require('../models/cards')
let cardSelectGlobal = null


/* nouvelle games */
router.post('/new', authMiddleWare, async (req, res) => {
 try {
const userId = req.user._id

const activeGame = await Game.findOne({ player: userId , ended: false });
const cards = await Card.find();
cardSelectGlobal = cards[Math.floor(Math.random() * (cards.length))];

// verifie si une partie est en court et la transforme en partie terminer
    if(activeGame) {
        activeGame.ended = true
        await activeGame.save()
    }
// crée une nouvelle partie
    const newGame = await new Game({

    player: userId,
    currentCard: cardSelectGlobal._id,
    })

    await newGame.save()

    // MAJ historique avec verif de doublon + currentGame
    const user = await User.findById(userId)
        if(!user.historicGames.includes(newGame._id)){
            user.historicGames.push(newGame._id)
        }

        user.currentGame = newGame._id

        await user.save()

    return res.json({ result: true, message: 'Nouvelle partie crée', game: newGame})

} catch (err) {
    return res.json({ result:false, error: err.message})
}
})

/* historique game */

router.get('/', authMiddleWare, async (req,res) => {

    try {

    const userId = req.user._id
    const userGame = await Game.find({ player: userId , ended: true });
        
    return res.json({ result: true, games: userGame})

    } catch (err) {
        return res.json({ result: false, error: err.message})
    }
})



module.exports = router;
