const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/user/:user_id', async (req, res) => {
    try {
        // Extracting `user_id` from params
        const { user_id } = req.params;

        // Validate that user_id is provided
        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Query to fetch user details
        const query = `
                        SELECT 
                            users.*,
                            roles.role_name 
                            
                        FROM 
                            users
                        JOIN 
                            roles
                        ON 
                            users.role_id = roles.role_id
                        WHERE 
                            users.user_id = ?`;
        const [row] = await db.execute(query, [user_id]);

        // Return the fetched rows
        res.json(row);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
