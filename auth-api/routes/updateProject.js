const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.put('/update-project/:project_id', async (req, res) => {
    const { project_name, description, project_status, project_type, total_eta } = req.body;
    const { project_id } = req.params;

    try {
        // Ensure project_id exists
        if (!project_id) {
            return res.status(400).json({ error: 'Project ID is required' });
        }

        const query = `
            UPDATE projects 
            SET 
                project_name = ?, 
                description = ?, 
                project_status = ?, 
                project_type = ?, 
                total_eta = ?, 
                updated_at = CURRENT_TIMESTAMP
            WHERE 
                project_id = ?;
        `;

        const [result] = await db.execute(query, [
            project_name,
            description,
            project_status,
            project_type,
            total_eta,
            project_id,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ message: 'Project updated successfully' });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
