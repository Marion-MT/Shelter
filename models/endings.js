const mongoose = require('mongoose');

const endingSchema = mongoose.Schema({
    title: {String},
    type: String,
    description: String,
});

const Ending = mongoose.model('endings', endingSchema);

module.exports = Ending;

