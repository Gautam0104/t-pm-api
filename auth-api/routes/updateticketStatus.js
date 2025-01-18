const express = require('express');
const router = express.Router();
const db = require('../config/db');
//get single project data
router.put('/updateticketStatus', (req, res) => {
    const { ticket_id, ticket_status } = req.body;

    // Check if any required field is undefined
    if (ticket_id === undefined || ticket_status === undefined) {
        return res.status(400).json({ error: 'Ticket ID and status are required.' });
    }

    const query = 'UPDATE tickets SET ticket_status = ? WHERE ticket_id = ?';
    
    // Log the values for debugging
    console.log({ ticket_id, ticket_status });

    db.execute(query, [ticket_status, ticket_id])
        .then((results) => {
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Ticket not found.' });
            }
            res.status(200).json({ message: 'Ticket status updated successfully.' });
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Database error' });
        });
});


module.exports = router;