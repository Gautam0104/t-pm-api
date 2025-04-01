const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.put('/calendar-update', (req, res) => {
    const { ticket_id, title, description, end, calendar } = req.body;

    // Validate request body
    if (!ticket_id || !title || !description || !end) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const query = `
        UPDATE tickets 
        SET title = ?, description = ?, due_date = ?, calendar = ?
        WHERE ticket_id = ?;
    `;

    db.execute(query, [title, description, end, calendar, ticket_id])
        .then((results) => {
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Ticket not found.' });
            }
            res.status(200).json({ message: 'Ticket updated successfully.' });
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Database error' });
        });
});

module.exports = router;
