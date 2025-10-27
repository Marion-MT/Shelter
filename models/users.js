const mongoose = require('mongoose');

const settingSchema = mongoose.Schema({
 volume: Number,
 soundOn: {type: Boolean, default: true},
 difficulty: String,
});


const userSchema = mongoose.Schema({
    email: {type:String, required:true},
    password: {type:String, required:true},
    token: String,
    bestScore: Number,
    currentGame: { type: mongoose.Schema.Types.ObjectId, ref: 'games' },
    settings: {
        type: settingSchema,
        default: () => ({})
    },
    historicGames: [{ type: mongoose.Schema.Types.ObjectId, ref: 'games' }],
    UnlockedAchievements : [{ type: mongoose.Schema.Types.ObjectId, ref: 'succès' }]
})

const User = mongoose.model('users', userSchema);

module.exports = User;