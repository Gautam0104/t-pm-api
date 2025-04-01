const express = require('express');
const router = express.Router();
const db = require('../config/db');

// DELETE route for deleting a ticket by ID
router.delete('/delete-project/:project_id', async (req, res) => {
    const { project_id } = req.params;

    try {
        // Validate the input
        if (!project_id || isNaN(project_id)) {
            return res.status(400).json({ error: 'Invalid User ID' });
        }

        // SQL query to delete the ticket
        const query = `DELETE FROM projects WHERE project_id = ?`;

        // Execute the query
        const [result] = await db.execute(query, [project_id]);

        // Check if any row was affected
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'project not found' });
        }

        // Success response
        res.status(200).json({ message: 'project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
