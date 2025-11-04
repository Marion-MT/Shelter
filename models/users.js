const mongoose = require('mongoose');
const { token } = require('morgan');

const settingSchema = mongoose.Schema({
 volume: {type: Number, default: 50},
 soundOn: {type: Boolean, default: true},
 btnSoundOn: {type: Boolean, default: true},
 difficulty: String,
});


const userSchema = mongoose.Schema({
    email: {type:String, required:true, unique : true},
    username: {type: String, required: true},
    password: {type:String, required:true},
    token: String,
    bestScore: {type :Number , default: 0},
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    currentGame: { type: mongoose.Schema.Types.ObjectId, ref: 'games' },
    settings: {
        type: settingSchema,
        default: () => ({})
    },
    unlockedAchievements : [{ type: mongoose.Schema.Types.ObjectId, ref: 'achievements' }],
    refreshToken: [
        { 
        token: String, 
        expiresAt: Date
        }
    ]
})
//userSchema.index({ resetPasswordExpires: 1 }, { expireAfterSeconds: 0 });
const User = mongoose.model('users', userSchema);

module.exports = User;