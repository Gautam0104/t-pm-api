const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/username/:username', async (req, res) => {
    try {
        // Extracting `user_id` from params
        const { username } = req.params;

        // Validate that user_id is provided
        if (!username) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Query to fetch user details
        const query = 'SELECT * FROM users  JOIN roles ON users.role_id = roles.role_id WHERE username = ?';
        const [row] = await db.execute(query, [username]);

        // Return the fetched rows
        res.json(row);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
