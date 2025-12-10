const mongoose = require('mongoose');

// setter si depassement ex: 150 reviens a 100
const limitTo100 = v => {
  return Math.min(100, Math.max(0, v));
};

const stateOfGaugesSchema = mongoose.Schema({
    food: { type: Number, default: 30, set: limitTo100 },
    moral: { type: Number, default: 50, set: limitTo100 },
    health: { type: Number, default: 50, set: limitTo100 },
    security: { type: Number, default: 50, set: limitTo100 },
    hunger: { type: Number, default: 50, set: limitTo100 },
})

const gameSchema = mongoose.Schema({
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    currentCard: { type: mongoose.Schema.Types.ObjectId, ref: 'cards', default: null },
    usedCards: [{
       cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'cards' },
       cooldownUsed: { type: Number, default: 0}
    }],
    ended : {type: Boolean, default: false},
    currentScenarios: {
         type: [String], 
         default : () => ['general']
        },
    numberDays: { type: Number, default : 1 },
    createdAt: { type: Date, default : Date.now },
    lastEventDay: { type: Number, default : 0 },
    stateOfGauges: {
        type: stateOfGaugesSchema,
        default: () => ({})
    },
    currentAchievements: {
        type: [Object],
        default : () => []
    },
});

const Game = mongoose.model('games', gameSchema);

module.exports = Game;