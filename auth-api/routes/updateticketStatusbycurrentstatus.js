const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Update ticket status where ticket_status and project_id match specific values
router.put('/update-ticket-current-status/:currentStatus/:projectId', async (req, res) => {
    try {
        const { currentStatus, projectId } = req.params;
        const { newStatus } = req.body;

        // Validate inputs
        if (!currentStatus || !newStatus || !projectId) {
            return res.status(400).json({ error: 'currentStatus, newStatus, and projectId parameters are required' });
        }

        // Query to update ticket status
        const query = 'UPDATE tickets SET ticket_status = ? WHERE ticket_status = ? AND project_id = ?';
        const [result] = await db.execute(query, [newStatus, currentStatus, projectId]);

        // Check if any rows were affected
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: `No tickets found with status: ${currentStatus} for project ID: ${projectId}` });
        }

        // Send success response
        res.status(200).json({ message: `Updated tickets from status ${currentStatus} to ${newStatus} for project ID: ${projectId}` });
    } catch (error) {
        console.error('Database update error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
