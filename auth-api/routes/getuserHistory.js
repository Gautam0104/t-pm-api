const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/user-history/:userId', async (req, res) => {
    const userId = req.params.userId; // or wherever you're getting the user_id
        // Validate userId
        if (!userId) {
            return res.status(400).send('User ID is required');
        }
    const query = `
    SELECT user_history.*, roles.role_name 
    FROM user_history 
    JOIN roles ON user_history.role_id = roles.role_id 
    WHERE user_id = ? 
    ORDER BY user_history.updated_at DESC;
    `;
    
    try {
        const [rows] = await db.execute(query, [userId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching user history');
    }
});





module.exports = router;