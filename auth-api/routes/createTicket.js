const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/ticket',async(req,res)=>{
    try {
         const {project_id, title, description, status, priority, created_by, due_date} = req.body;
          // Handle undefined values
                const projectId = project_id || null;
                const ticketTitle = title || null;
                const desc = description || null;
                const ticketStatus = status || 0;
                const ticketPriority = priority || null;
                const createdBy = created_by || null;
                const dueDate = due_date || 0;
                
         const query = `INSERT INTO tickets
                        (project_id, title, description, status, priority, created_by, due_date, created_at, updated_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
            const values = [projectId, ticketTitle, desc, ticketStatus, ticketPriority, createdBy, dueDate ];
          await db.execute(query,values);
          res.status(201).send('Ticket created successfully.');
      } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});




module.exports = router;