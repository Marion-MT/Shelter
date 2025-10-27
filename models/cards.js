const mongoose = require('mongoose');

const choiceSchema = mongoose.Schema({
    endTrigger: { type: String, default: null },
    trigger: { type: String, default: null },
    nextCard : { type: String, default: null },
    nextPool: { type: String, default: null },
    text : {type:String, required:true},
    effect:  {
        hunger : { type: Number, default : 0 }, 
        security: { type: Number, default : 0 }, 
        health: { type: Number, default : 0 }, 
        moral: { type: Number, default : 0 },
        food: { type: Number, default : 0 }
        },
    consequence: { type: String, default: null },
    triggerAchievement: {type: String, default: null}
});

const conditionsSchema = mongoose.Schema({
    requiredScenario: { type: [String], default: null },
    forbiddenScenario: { type: [String], default: null },
    minDays: { type: Number, default : -1 },
    maxDays: { type: Number, default : -1 },
    gauges: { 
        hunger: { min: { type: Number, default : 0 }, max: { type: Number, default : 100 } },
        moral: { min: { type: Number, default : 0 }, max: { type: Number, default : 100 } },
        security: { min: { type: Number, default : 0 }, max: { type: Number, default : 100 } },
        health: { min: { type: Number, default : 0 }, max: { type: Number, default : 100 } },
        reserve: { min: { type: Number, default : 0 }, max: { type: Number, default : 100 } }
        }

});

const cardSchema = mongoose.Schema({
    key: {type:String, required:true},
    pool: { type: String, default: 'general' },
    text: {type:String, required:true},
    cooldown: { type: Number, default : 15 },
    incrementsDay: Boolean,
    right: {
        type: choiceSchema,
        default: () => ({})
    },
    left: {
        type: choiceSchema,
        default: () => ({})
    },
    conditions: {
        type: conditionsSchema,
        default: () => ({})
    },

});

const Card = mongoose.model('cards', cardSchema);

module.exports = Card;