const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.put('/calendarUpdate', (req, res) => {
    const { ticket_id, title, description, due_date, created_at } = req.body;

    // Validate request body
    if (!ticket_id || !title || !description  ) {
        return res.status(400).json({ error: 'All fields are required, including ticket_status.' });
    }

    const query = `
        UPDATE tickets 
        SET title = ?, description = ?, due_date = ?, ticket_created_at = ?
        WHERE ticket_id = ?;
    `;

    db.execute(query, [title, description, due_date, created_at, ticket_id])
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
