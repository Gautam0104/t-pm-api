const express = require('express');
const router = express.Router();
const db = require('../config/db');

// DELETE route for deleting a ticket by ID
router.delete('/deleteUser/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        // Validate the input
        if (!user_id || isNaN(user_id)) {
            return res.status(400).json({ error: 'Invalid User ID' });
        }

        // SQL query to delete the ticket
        const query = `DELETE FROM users WHERE user_id = ?`;

        // Execute the query
        const [result] = await db.execute(query, [user_id]);

        // Check if any row was affected
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'user not found' });
        }

        // Success response
        res.status(200).json({ message: 'user deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
