const express = require('express');
const router = express.Router();
const db = require('../config/db');
//get whole project data
router.get('/tickets',async(req,res)=>{
    try {
        const query = `
        SELECT 
              *
        FROM 
            tickets AS ticket
        LEFT JOIN 
            projects AS project ON ticket.project_id = project.project_id
        LEFT JOIN 
            users AS user ON ticket.created_by = user.user_id;
    `;
        const [rows] = await db.execute(query);
        res.json(rows);
      } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});



module.exports = router;