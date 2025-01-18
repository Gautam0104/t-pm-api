// get single ticket by project id
const express = require('express');
const router = express.Router();
const db = require('../config/db');
//get single project data
router.get('/ticket/:id', async (req,res)=>{
    try {
        const { id } = req.params;

        // Validate ID
        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID parameter' });
        }
        // Query to fetch the record by ID
         const query = `
        SELECT 
              *
        FROM 
            tickets AS ticket
        LEFT JOIN 
            projects AS project ON ticket.project_id = project.project_id
        LEFT JOIN 
            users AS user ON ticket.created_by = user.user_id
            WHERE project.project_id = ?
    `;
        const [rows] = await db.execute(query, [id]);
        // Check if data exists
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No record found with the given ID' });
        }
        // Send the result
        res.status(200).json(rows);
      } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});



module.exports = router;