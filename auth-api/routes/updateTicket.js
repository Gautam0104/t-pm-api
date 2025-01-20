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
]), (req, res) => {
    const { ticket_id, title, description, status, priority, due_date, ticket_status } = req.body;

    console.log('Files uploaded:', req.files);
    console.log('Request body:', req.body);

    // Process uploaded images
    const images = req.files['images'] && req.files['images'].length > 0
        ? req.files['images'].map(file => file.filename)
        : null; // Default to null if no images

    // Process uploaded card_image
    const card_image = req.files['card_image'] && req.files['card_image'][0]
        ? req.files['card_image'][0].filename
        : null; // Default to null if no card_image

    if (ticket_id === undefined || title === undefined || description === undefined || status === undefined || priority === undefined || due_date === undefined || ticket_status === undefined) {
        return res.status(400).json({ error: 'Ticket ID, title, description, status, priority, and ticket status are required.' });
    }

    const query = `
        UPDATE tickets 
        SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, ticket_status = ?, images = ?, card_image = ?
        WHERE ticket_id = ?
    `;

    // Convert images array to JSON string to store in the database
    const imagesJson = images ? JSON.stringify(images) : null; // If images are null, set to null

    console.log({ ticket_id, title, description, status, priority, due_date, ticket_status, images: imagesJson, card_image });

    db.execute(query, [title, description, status, priority, due_date, ticket_status, imagesJson, card_image, ticket_id])
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
