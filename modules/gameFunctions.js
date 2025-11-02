const Card = require('../models/cards')
const User = require('../models/users')
const Ending = require('../models/endings')
const Game = require('../models/games')
const fs = require('fs')
/*
- sert a selectionner une carte random dans un tableau (collection Card)
*/

const getRandomCard = (cardsArray) => {
    if(cardsArray.length === 0) throw new Error('Aucune carte disponible');
    return cardsArray[Math.floor(Math.random() * cardsArray.length)]
}

/*
- applique les effets du choix sur jauges
game = la partie en cours
choiceSimp = le choix fais (droite ou gauche)
*/

const applyChoiceEffects = (game, choiceSimp) => {
    
    // verifie que choiceSimp est definie 
    if(!choiceSimp.effect) {
        throw new Error('choiceSimp.effect non défini')
    }

    Object.keys(choiceSimp.effect).forEach(key => {        // <--- Object.keys() sert a recuperer les clés de effects
        game.stateOfGauges[key] += choiceSimp.effect[key];        
    });

        if(choiceSimp.trigger){
            game.currentScenarios.push(choiceSimp.trigger)
        }

        else if(choiceSimp.endTrigger){

        // verifie que trigger est bien dans current Scenarios
        if(!game.currentScenarios.includes(choiceSimp.endTrigger)) {
            throw new Error(`Le trigger "${choiceSimp.endTrigger}" n'existe pas dans currentScenarios`)
             }

           game.currentScenarios = game.currentScenarios.filter( e => e !== choiceSimp.endTrigger)
        }
    game.markModified('stateOfGauges');             // <--- sert marquer le sous-document comme modifier sinon crash "de ce que j'ai compris detecte pas les modif des sous doc imbriqué"    
} 


/*
- gere les effets liés a food (si food = 0  hunger diminue de 10)
game = la partie en cours
*/

const handleFamine = (game) => {
    if(game.currentCard.incrementsDay && game.stateOfGauges.food <= 0 ) {
        game.stateOfGauges.hunger -= 10 
        game.markModified('stateOfGauges');
    }
}

/*
- verifie si la partie est gameOver ( si une jauge a 0)
game = la partie en cours
renvoie la key de la jauge a 0 
*/

const checkGameOver = (game) => {
    for (const [key, value] of Object.entries(game.stateOfGauges._doc)) { /// <--- obliger d'utiliser Object. et ._doc pour recuperer en brut car c'est un sous document \\\ on recuper clé et valeur ///
        if (key !== 'food' && value <= 0) {
            return key;
        }
    }
    return null
}


/*
- incrémente numberDays et applique les effets
game = la partie en cours
renvoie true si le jour a été incrémenté 
*/

const incrementDay = (game) => {
    if(game.currentCard.incrementsDay){
            game.numberDays += 1
            game.stateOfGauges.food -= 10
            game.markModified('stateOfGauges')
            return true
    }
    return false
}

/*
- gére le cooldown des cartes utilisé
game = la partie en cours
*/

const manageCardCooldown = async (game) => {

    // on incrémente tous les cooldownUsed des cartes deja utilisé
        game.usedCards.forEach(card => {
            card.cooldownUsed += 1;
                });

                // on récup les cartes de la bdd
    const allCards = await Card.find()

    // filtre les cartes pour garder que les cartes en cooldown
    game.usedCards = game.usedCards.filter(cardUsed => {

        const cardValid = allCards.find(
            laCarte => laCarte._id.toString() === cardUsed.cardId.toString()
        )

    // si la carte n'existe pas , ca la supprime
        if(!cardValid) return false
        // garde la carte si le cooldown n'est pas expirer
            return cardUsed.cooldownUsed < cardValid.cooldown;
                })    
}

/*
- verifie si un évenement doit être déclenché
*/

const checkEvent = async (game) => {

const MIN_DAY_EVENT = 5    // Jours min avant événement
const MAX_DAY_EVENT = 10   // Jours max avant événement

//calcule la diff depuis le dernier event
const diff = game.numberDays - game.lastEventDay 

// si pas assez de j passés du coup pas d'event
if ( diff < MIN_DAY_EVENT ) // 3 < 5
    {
        return false
    }


    // si min atteint tu récup un chiffre entre MIN 5 et MAX 10
    const rand = Math.floor(Math.random() * (MAX_DAY_EVENT - MIN_DAY_EVENT + 1) + MIN_DAY_EVENT)

    // si la diff depasse random en déclanche event
    if (diff > rand) {
        return true
    }

    return false
}



const buildConditionFilters = (game) => {
    const conditionFilters = [];

    Object.entries(game.stateOfGauges.toObject()).forEach(([gauges, value]) => {
        if (gauges === '_id' || typeof value !== 'number') return
        
        const majGauges = gauges.charAt(0).toUpperCase() + gauges.slice(1);
        const minGauge = `conditions.min${majGauges}`;
        const maxGauge = `conditions.max${majGauges}`;

        conditionFilters.push({
            $and: [
                { $or: [{ [minGauge]: { $exists: false } }, { [minGauge]: { $lte: value } }] },
                { $or: [{ [maxGauge]: { $exists: false } }, { [maxGauge]: { $gte: value } }] }
            ]
        });
    });

    return { $and: conditionFilters};
};

/*
- récupere la prochaine carte selon les filtres
game = la partie en cours
choiceSimp = le choix fais (droite ou gauche)
*/

const getNextCard = async (game, choiceSimp) => {

    // cartes a exclure
    const exludedIds =  game.usedCards.map(card => card.cardId)

   // console.log('exludedIds: ',exludedIds)
    let filter = { }

    // rajout des filtre si event si non nextCard si non nextPool


    if (await checkEvent(game)){
        filter.pool = "event"
        game.lastEventDay = game.numberDays
    }

    // on check si on doit obligatoirement avoir une nextCard si non 
    else if (choiceSimp.nextCard){
        filter.key = choiceSimp.nextCard
    }
    
    // on passe a nextPool si non
    else if (choiceSimp.nextPool){
        filter.pool = choiceSimp.nextPool
    }


    // on recupe le pool basique
    else {

        // on utilise $in parceque c'est un tableau
            filter.pool = { $in: game.currentScenarios };
        }

        const conditionFilters = buildConditionFilters(game)
        
        // on combine exclu et filtre grace a $nin
        const combinedFilter = {
            _id: { $nin: exludedIds }, // <-- Find de card en excluant les IDs regroupés dans "exclude" grâce à $nin JE NE CONNAISSAIS PAS ! -->
            ...filter,
            ...conditionFilters  
        }

        // on filtre selon conditions 



        // on recherche les cartes
        const cards = await Card.find(combinedFilter)
       // console.log('id des carte:', cards.map(card => card._id))
       // console.log('Nombres de cartes trouvées:', cards.length)
        if(cards.length === 0) {
            throw new Error('Aucune carte disponible')
        }

        // et on récupere une carte aléatoire du find 

        return getRandomCard(cards)
}

/*
- fin de partie et met a jour le user
game= la partie en cours 
user= user actuel
deathReason= raison de la mort \\exemple: moral//
return les donnes de fin de partie
*/

const endGame = async (game, user, deathReason) => {

    // maj du best score
    user.bestScore = Math.max(user.bestScore , game.numberDays)

    // maj ended et current game pour qu'il n'y est plus de game en cours dans user 
    game.ended = true 
    user.currentGame = null

    // sauvegarde
    await user.save()
    await game.save()

    // on récupere le ending qui corespond
    const death = await Ending.findOne({ type:deathReason})

    // en return les données de fin de partie
    return {
        result: true, 
        gameover: true, 
        gauges: game.stateOfGauges,
        death: death,
        bestscore: user.bestScore,
        achievements : game.currentAchievements,
    }
}

/*
- valide et prépare une nouvelle partie
userID = id utilisateur
return directement la carte sélectionnée pour démarrer
*/

const prepareNewGame = async (userId) => {

    // on termine la partie si y'en a une en cours
    const activeGame = await Game.findOne({ player: userId , ended: false });    
        if(activeGame) {
        activeGame.ended = true
        await activeGame.save()
    }

    const game = {
        stateOfGauges:{
        food: 50,
        security: 50,
        hunger: 50,
        moral: 50,
        health: 50,
        toObject: function() { return this; }
        }
    };

  console.log('1. Game créé');
    const conditionFilters = buildConditionFilters(game)
    // on récup les cartes de démarrage
    const cards = await Card.find({ pool: "general",...conditionFilters});
    console.log('nombre de cards au lancement du jeu : ',cards.lenght)
    // verif si ya des carte
        if (cards.length === 0) {
        throw new Error('Aucune carte de démarrage disponible');
    }

    // on renvoi une carte random
    return getRandomCard(cards)
}
module.exports = {
    getRandomCard,
    applyChoiceEffects,
    handleFamine,
    checkGameOver,
    incrementDay,
    manageCardCooldown,
    buildConditionFilters,
    getNextCard,
    endGame,
    prepareNewGame,
    checkEvent,
};