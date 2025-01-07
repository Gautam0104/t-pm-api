const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized.');
    }
    res.send('Welcome to your dashboard.');
});

module.exports = router;
