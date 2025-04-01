const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.put('/update-user/:user_id', async (req, res) => {
    const userId = req.params.user_id;
    const { role_id, username, first_name, last_name } = req.body;

    if (!role_id || !username || !first_name || !last_name) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const updateQuery = `
        UPDATE users 
        SET 
            role_id = ?, 
            username = ?, 
            first_name = ?, 
            last_name = ?, 
            updated_at = CURRENT_TIMESTAMP
        WHERE 
            user_id = ?`;

    const historyQuery = `
        INSERT INTO user_history (user_id, role_id, username, first_name, last_name, updated_at)
        SELECT user_id, role_id, username, first_name, last_name, updated_at
        FROM users
        WHERE user_id = ?`;

    const updateValues = [role_id, username, first_name, last_name, userId];

    try {
        // Disable prepared statements for transaction-based queries
        const connection = await db.getConnection();
        await connection.query('START TRANSACTION'); // Use query instead of execute

        // Insert user history
        await connection.query(historyQuery, [userId]);

        // Update user
        const [result] = await connection.query(updateQuery, updateValues);

        if (result.affectedRows === 0) {
            await connection.query('ROLLBACK');
            return res.status(404).json({ message: 'User not found.' });
        }

        // Commit the transaction
        await connection.query('COMMIT');

        // Fetch updated user
        const [updatedUser] = await connection.query('SELECT * FROM users WHERE user_id = ?', [userId]);
        connection.release();

        res.status(200).json({ message: 'User updated successfully.', user: updatedUser[0] });
    } catch (err) {
        console.error('Error updating user:', err);

        // Rollback transaction on error
        if (connection) await connection.query('ROLLBACK');
        if (connection) connection.release();

        res.status(500).json({ error: 'Database error.' });
    }
});

module.exports = router;
