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

// Update ticket route to handle multiple image uploads
router.put('/updateticket', upload.array('images', 5), (req, res) => {
    const { ticket_id, title, description, status, priority, ticket_status } = req.body;

    console.log('Files uploaded:', req.files);
    console.log('Request body:', req.body);

    // Default to an empty array if no images were uploaded
    const images = req.files && req.files.length > 0 ? req.files.map(file => file.filename) : null; // Set to null if no images

    if (ticket_id === undefined || title === undefined || description === undefined || status === undefined || priority === undefined || ticket_status === undefined) {
        return res.status(400).json({ error: 'Ticket ID, title, description, status, priority, and ticket status are required.' });
    }

    // If there are no files, set images to null
    const query = 'UPDATE tickets SET title = ?, description = ?, status = ?, priority = ?, ticket_status = ?, images = ? WHERE ticket_id = ?';

    // Convert images array to JSON string to store in the database
    const imagesJson = images ? JSON.stringify(images) : null; // If images are null, set to null

    console.log({ ticket_id, title, description, status, priority, ticket_status, images: imagesJson });

    db.execute(query, [title, description, status, priority, ticket_status, imagesJson, ticket_id])
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
