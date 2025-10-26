const mongoose = require('mongoose');

const succèsSchema = mongoose.Schema({
    name: String,
    description: String,
    type: String,
    condition: {type: Boolean, default: false}
});

const Succès = mongoose.model('succès', succèsSchema);

module.exports = Succès;