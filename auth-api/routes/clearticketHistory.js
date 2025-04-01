const express = require('express');
const router = express.Router();
const db = require('../config/db');

// DELETE route for deleting a ticket by ID
router.delete('/clear-history/:ticket_id', async (req, res) => {
    const { ticket_id } = req.params;

    try {
        // Validate the input
        if (!ticket_id || isNaN(ticket_id)) {
            return res.status(400).json({ error: 'Invalid ticket ID' });
        }

        // SQL query to delete the ticket
        const query = `DELETE FROM ticket_history WHERE ticket_id = ?`;

        // Execute the query
        const [result] = await db.execute(query, [ticket_id]);

        // Check if any row was affected
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Success response
        res.status(200).json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
