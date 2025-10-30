const { Engine } = require('json-rules-engine');
const Achievement = require('../models/achievements');

async function checkAchievements(user, game) {
    
    const engine = new Engine();   // <-- ici on creer une instance du moteur qui vas evaluer les régles 

    const unlockedIds = user.unlockedAchievements;
    const achievements = await Achievement.find({ 
    _id: { $nin: unlockedIds }  // Ignore ceux déjà débloqués
    }); // <-- tu récuperes les régles ici 

    // le succès dois contenir obligatoirement une conditions (régles)  sous forma JSON

   for (const ach of achievements) {
    engine.addRule({
        conditions: ach.conditions,                 // tu ajoutes la regles dans le moteur 
        event: {type: 'achievement', params: { id: ach._id }}       // tu lui dis quoi faire  quand la condition est vrai exemple "quand les conditions sont vrai, previens moi que le succès 'machin' est débloqué" 
    })
   } 

   // facts represente l'état de la partie actuel
   const facts = {
    numberDays: game.numberDays,
    stateOfGauges: game.stateOfGauges
   }

   // le moteur lit les règles , verifie les conditions avec les "facts" et retourne les succès débloquer 
   const { events } = await engine.run(facts) 

   // verif si ya events et renvois false si ya rien 
    if(events.length === 0) {
        return { success: false  }
    }


   for (const evt of events) {
    const achievementId = evt.params.id;      // recupere id depuis evt.params
    if( !user.unlockedAchievements.includes(achievementId)) {             // verification si il n'a pas etait deja debloquer 
        user.unlockedAchievements.push(achievementId);                       // tu l'ajoute dans user
    }
}


 
    return { success: true, events }
}

module.exports = { checkAchievements };