const mongoose = require('mongoose');

const stateOfGaugesSchema = mongoose.Schema({
    food: { type: Number, default : 50 },
    moral: { type: Number, default : 50 },
    health: { type: Number, default : 50 },
    security: { type: Number, default : 50 },
    hunger: { type: Number, default : 50 },
})

const gameSchema = mongoose.Schema({
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    currentCard: { type: mongoose.Schema.Types.ObjectId, ref: 'cards', default: null },
    usedCards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'cards' }],
    ended : {type: Boolean, default: false},
    currentScenarios: [String],
    numberDays: { type: Number, default : 1 },
    createdAt: { type: Date, default : Date.now() },
    lastEventDay: { type: Number, default : 0 },
    stateOfGauges: {
        type: stateOfGaugesSchema,
        default: () => ({
            food: 50,
            moral: 50,
            health: 50,
            security: 50,
            hunger: 50,
                })
    }
});

const Game = mongoose.model('games', gameSchema);

module.exports = Game;