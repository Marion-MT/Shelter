const mongoose = require('mongoose');

const stateOfGaugesSchema = mongoose.Schema({
    food: Number,
    moral: Number,
    health: Number,
    security: Number,
    hunger: Number,
})

const gameSchema = mongoose.Schema({
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    currentCard: { type: mongoose.Schema.Types.ObjectId, ref: 'cartes' },
    usedCards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'cartes' }],
    ended : {type: Boolean, default: false},
    currentScénarios: [String],
    numberDays: Number,
    createdAt: Date,
    lastEventDay: Number,
    stateOfGauges: stateOfGaugesSchema
});

const Game = mongoose.model('games', gameSchema);

module.exports = Game;