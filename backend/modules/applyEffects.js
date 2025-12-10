

async function applyEffects(game,choice) {
 for (const key in choice){
    if (game.stateOfGauges.hasOwnProperty(key)) {
        
        game.stateOfGauges[key] += choice[key]
    }
 }
game.markModified('stateOfGauges');
await game.save()
}

module.exports = { applyEffects };
