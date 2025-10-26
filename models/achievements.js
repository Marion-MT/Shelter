const mongoose = require('mongoose');

const achievementSchema = mongoose.Schema({
    name: String,
    description: String,
    type: {
        type: String,
        enum: ['card', 'function'],
        required: true
    },
    conditions: {type: [Object], default: null}
});

const Achievement = mongoose.model('achievements', achievementSchema);

module.exports = Achievement;