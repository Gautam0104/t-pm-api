const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.put('/updateUser/:user_id', async (req, res) => {
    const userId = req.params.user_id;
    const { role_id, username, first_name, last_name } = req.body;

    // Basic validation
    if (!role_id || !username || !first_name || !last_name) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const query = `
        UPDATE users 
        SET 
            role_id = ?, 
            username = ?, 
            first_name = ?, 
            last_name = ?, 
            updated_at = CURRENT_TIMESTAMP
        WHERE 
            user_id = ?`;

    const values = [role_id, username, first_name, last_name, userId];

    try {
        const [result] = await db.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Fetch and return the updated user
        const [updatedUser] = await db.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
        res.status(200).json({ message: 'User updated successfully.', user: updatedUser[0] });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Database error.' });
    }
});

module.exports = router;
