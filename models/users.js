const mongoose = require('mongoose');

const settingSchema = mongoose.Schema({
 volume: {type: Number, default: 50},
 soundOn: {type: Boolean, default: true},
 difficulty: String,
});


const userSchema = mongoose.Schema({
    email: {type:String, required:true},
    password: {type:String, required:true},
    token: String,
    bestScore: {type :Number , default: 0},
    currentGame: { type: mongoose.Schema.Types.ObjectId, ref: 'games' },
    settings: {
        type: settingSchema,
        default: () => ({})
    },
    unlockedAchievements : [{ type: mongoose.Schema.Types.ObjectId, ref: 'achievements' }]
})

const User = mongoose.model('users', userSchema);

module.exports = User;