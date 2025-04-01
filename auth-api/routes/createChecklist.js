const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/create-checklist',async(req,res)=>{
    try {
         const {ticketId, checkList, ticketTitle} = req.body;
          // Handle undefined values

                
         const query = `INSERT INTO checklist 
                        (ticket_id,checklist,ticket_title)
                         VALUES (?, ?, ?)`;
            const values = [ticketId, checkList, ticketTitle ];
          await db.execute(query,values);
          res.status(201).send('Checklist created successfully.');
      } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});




module.exports = router;