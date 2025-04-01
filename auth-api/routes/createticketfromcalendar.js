const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/calendar-ticket',async(req,res)=>{
    try {
         const {project_id, title, description, calendar} = req.body;
          // Handle undefined values
                const projectId = project_id || null;
                const ticketTitle = title || null;
                const desc = description || null;
                const ticketcalendar = calendar || null;
                
         const query = `INSERT INTO tickets
                        (project_id, title, description, ticket_created_at, updated_at, calendar)
                         VALUES (?, ?, ?, NOW(), NOW(), ?)`;
            const values = [projectId, ticketTitle, desc, ticketcalendar ];
          await db.execute(query,values);
          res.status(201).send('Ticket created successfully.');
      } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});




module.exports = router;