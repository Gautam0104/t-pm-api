const express = require('express');
const router = express.Router();
const db = require('../config/db');
//get single project data
router.get('/project/:id', async (req,res)=>{
    try {
        const { id } = req.params;

        // Validate ID
        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID parameter' });
        }
        // Query to fetch the record by ID
        const query = 'SELECT * FROM projects AS project LEFT JOIN users AS user ON project.project_leader_id = user.user_id WHERE project_id = ?';
        const [rows] = await db.execute(query, [id]);
        // Check if data exists
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No record found with the given ID' });
        }
        // Send the result
        res.status(200).json(rows[0]);
      } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});



module.exports = router;