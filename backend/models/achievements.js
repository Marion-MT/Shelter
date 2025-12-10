const mongoose = require('mongoose');

const achievementSchema = mongoose.Schema({
    name: String,
    description: String,
    image: { type: String, default: '' },
    type: {
        type: String,
        enum: ['card', 'function', 'trigger'],
        required: true
    },
    conditions: {
        type: Object,
         _id: false   // pour eviter de faire buger json engine rule ca empeche de créer un id dans un object ou array
        },
    cardKey:{
        type: String,
    }
});

const Achievement = mongoose.model('achievements', achievementSchema);

module.exports = Achievement;