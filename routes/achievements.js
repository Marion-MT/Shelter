var express = require('express');
var router = express.Router();
const Achievements = require('../models/achievements')


router.get('/', async function(req, res) {

    try {
        const achievements = await Achievements.find({});

        return res.json({ result: true, achievements: achievements})

    } catch (err) {
        return res.json({ result: false, error: err.message})
    }
});

module.exports = router;
