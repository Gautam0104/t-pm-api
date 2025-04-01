const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Make sure you have the correct DB config

// API route to copy data with a new ticket_status
router.post('/copy-row/:id', async (req, res) => {
    const { id } = req.params;
    const { ticketStatus } = req.body;

    try {
        // 1. Select the row by id
        const [rows] = await db.query('SELECT * FROM tickets WHERE ticket_id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Row not found' });
        }

        const {project_id, title, created_by, description, images, card_image } = rows[0];

        // 2. Insert a new row with copied values and the new ticket_status
        const [result] = await db.query(
            'INSERT INTO tickets (project_id, title, description, created_by, ticket_status, images, card_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [project_id, title, description, created_by,  ticketStatus, images, card_image]
        );

        res.json({ message: 'Row copied successfully', insertedId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/copy-row/status/:status', async (req, res) => {
    const { status } = req.params;
    const { ticketStatus } = req.body;

    try {
        // 1. Select rows by ticket_status
        const [rows] = await db.query('SELECT * FROM tickets WHERE ticket_status = ?', [status]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No rows found with the given status' });
        }

        // 2. Loop through the rows and insert a copy of each with the new ticketStatus
        const insertedIds = [];
        for (const row of rows) {
            const { project_id, title, created_by, description, images, card_image } = row;

            const [result] = await db.query(
                'INSERT INTO tickets (project_id, title, description, created_by, ticket_status, images, card_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [project_id, title, description, created_by, ticketStatus, images, card_image]
            );

            insertedIds.push(result.insertId);
        }

        res.json({ message: 'Rows copied successfully', insertedIds });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
