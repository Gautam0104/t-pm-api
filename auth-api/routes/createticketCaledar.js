const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/calendar-create-ticket', (req, res) => {
    const { title, description, due_date, created_at } = req.body;

    // Validate request body
    if (!title || !description || !due_date || !created_at) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const query = `
        INSERT INTO tickets (title, description, due_date, ticket_created_at) 
        VALUES (?, ?, ?, NOW());
    `;

    db.execute(query, [title, description, due_date, ticket_created_at])
        .then((results) => {
            res.status(201).json({ message: 'Ticket created successfully.', results });
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Database error' });
        });
});


module.exports = router;