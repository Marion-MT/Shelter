const { Engine } = require('json-rules-engine');
const Achievement = require('../models/achievements');

async function checkAchievements(user, game, triggered) {
    
    const engine = new Engine();   // <-- ici on creer une instance du moteur qui vas evaluer les régles 

       if (!user || !user.unlockedAchievements) {
        throw new Error('user ou unlockedAchievements non défini')
    }


    const unlockedIds = user.unlockedAchievements;
    const achievements = await Achievement.find({ 
    _id: { $nin: unlockedIds }  // Ignore ceux déjà débloqués
    }); // <-- tu récuperes les régles ici 

    const events = [];
    
    if (triggered && triggered.length > 0) {
        for (const nameAchiv of triggered) {
            const ach = achievements.find(a => a.cardKey === nameAchiv);
            if (ach) {
                events.push({
                    type: 'achievement',
                    params: { id: ach._id, name: ach.name, description: ach.description, image : ach.image }
                });
            }
        }
    }

    // le succès dois contenir obligatoirement une conditions (régles)  sous forma JSON

   for (const ach of achievements) {

        if (!ach.conditions) {
        continue;
    }


    engine.addRule({
        conditions: ach.conditions,                 // tu ajoutes la regles dans le moteur 
        event: {type: 'achievement', params: { id: ach._id , name : ach.name , description: ach.description, image : ach.image} }       // tu lui dis quoi faire  quand la condition est vrai exemple "quand les conditions sont vrai, previens moi que le succès 'machin' est débloqué" 
            })    
       
}

   // facts represente l'état de la partie actuel
   const facts = {
    numberDays: game.numberDays,
    stateOfGauges: game.stateOfGauges
   }

   
   // le moteur lit les règles , verifie les conditions avec les "facts" et retourne les succès débloquer 
   const { events: conditionEvents } = await engine.run(facts) 
   
   events.push(...conditionEvents);

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