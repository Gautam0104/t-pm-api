const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../config/db');
const path = require('path');

// Configure multer storage options
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Set the directory where images will be stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Set a unique filename
    }
});

const upload = multer({ storage: storage });

// Update ticket route to handle multiple image uploads and a single card_image
router.put('/updateticket', upload.fields([
    { name: 'images', maxCount: 5 }, // Multiple images
    { name: 'card_image', maxCount: 1 } // Single card_image
]), async (req, res) => {
    const { ticket_id, title, description, status, priority, due_date, ticket_status, ticket_eta, ticket_owner } = req.body;

    if (!ticket_id || !title || !description || !status || !priority || !due_date || !ticket_status || !ticket_eta || !ticket_owner) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Fetch the current state of the ticket
        const [currentTicket] = await db.execute(`SELECT * FROM tickets WHERE ticket_id = ?`, [ticket_id]);

        if (currentTicket.length === 0) {
            return res.status(404).json({ error: 'Ticket not found.' });
        }

        const ticket = currentTicket[0];

        console.log('Current ticket data:', ticket);

        // Insert current state into the history table
        const insertHistoryQuery = `
            INSERT INTO ticket_history (ticket_id, previous_title, previous_description, previous_status, previous_priority, previous_due_date, previous_ticket_status, previous_ticket_eta, previous_images, previous_card_image, previous_ticket_owner)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const historyParams = [
            ticket.ticket_id, ticket.title, ticket.description, ticket.status, ticket.priority,
            ticket.due_date, ticket.ticket_status, ticket.ticket_eta, ticket.images, ticket.card_image, ticket_owner
        ];

        console.log('History insert params:', historyParams);

        await db.execute(insertHistoryQuery, historyParams);

        console.log('History record inserted successfully.');

        // Handle file uploads
        const images = req.files['images']?.map(file => file.filename) || null;
        const card_image = req.files['card_image']?.[0]?.filename || null;

        // Convert images array to JSON
        const imagesJson = images ? JSON.stringify(images) : null;

        // Update the ticket
        const updateQuery = `
            UPDATE tickets 
            SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, ticket_status = ?, images = ?, card_image = ?, ticket_eta = ?, ticket_owner = ?
            WHERE ticket_id = ?
        `;

        const updateParams = [title, description, status, priority, due_date, ticket_status, imagesJson, card_image, ticket_eta, ticket_owner, ticket_id];

        const [updateResult] = await db.execute(updateQuery, updateParams);

        console.log('Update query executed:', updateResult);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ error: 'Ticket not found.' });
        }

        // Retrieve the updated record
        const [updatedTicket] = await db.execute(`SELECT * FROM tickets WHERE ticket_id = ?`, [ticket_id]);

        res.status(200).json({
            message: 'Ticket updated successfully.',
            updatedTicket: updatedTicket[0]
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});



module.exports = router;
