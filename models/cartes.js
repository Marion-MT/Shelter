const mongoose = require('mongoose');

const choiceSchema = mongoose.Schema({
    endTrigger: { type: String, default: null },
    trigger: { type: String, default: null },
    nextCard : { type: String, default: null },
    nextPool: { type: String, default: null },
    text : String,
    effect:  {
        hunger : { type: Number }, 
        security: { type: Number }, 
        health: { type: Number }, 
        moral: { type: Number },
        food: { type: Number }
        },
    consequence: { type: String, default: null }
});

const conditionsSchema = mongoose.Schema({
    requiredScenario: { type: [String], default: null },
    forbiddenScenario: { type: [String], default: null },
    minDays: Number,
    maxDays: Number,
    gauges: { 
        hunger: { min: { type: Number }, max: { type: Number } },
        moral: { min: { type: Number }, max: { type: Number } },
        security: { min: { type: Number }, max: { type: Number } },
        health: { min: { type: Number }, max: { type: Number } },
        reserve: { min: { type: Number }, max: { type: Number } }
        }

});

const carteSchema = mongoose.Schema({
    type: String,
    pool: String,
    text: String,
    cooldown: Number,
    incrementsDay: Boolean,
    right: choiceSchema,
    left: choiceSchema,
    conditions: conditionsSchema,

});

const Carte = mongoose.model('cartes', carteSchema);

module.exports = Carte;