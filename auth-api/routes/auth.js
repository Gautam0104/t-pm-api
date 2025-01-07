const express = require('express');
const bcrypt = require('bcryptjs');
const { createUser, findUserByUsername } = require('../models/user');
const { logSession } = require('../models/sessionLog');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password, first_name, last_name } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await createUser(username, hashedPassword, first_name, last_name );
        res.status(201).send('User registered successfully.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error registering user.');
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await findUserByUsername(username);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send('Invalid username or password.');
        }
        console.log(user);
        
        req.session.userId = user.user_id;
        const expireTime = new Date(Date.now() + req.session.cookie.maxAge);
        await logSession(req.session.id, user.user_id, expireTime);

        res.send('Login successful.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error logging in.');
    }
});

router.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send('Error logging out.');
            }
            res.send('Logout successful.');
        });
    } else {
        res.status(400).send('No active session.');
    }
});

module.exports = router;
