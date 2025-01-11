const express = require('express');
const router = express.Router();
const db = require('../config/db');
//get single project data
router.put('/ticket/:id', async (req,res)=>{
    const ticketId = req.params.id;
    const { title, description, status, priority, due_date } = req.body;
    if (!title || !description || !status || !priority || !due_date) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {

        // Query to update the record by ID
        const query = `UPDATE tickets
                            SET 
                                title = ?, 
                                description = ?, 
                                status = ?, 
                                priority = ?, 
                                due_date = ?, 
                                updated_at = NOW()
                            WHERE 
                                ticket_id = ?;`;
        const [result] = await db.execute(query, [title, description, status, priority, due_date, ticketId]);
        // Check if data exists
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        // Send the result
        res.json({ message: 'Ticket updated successfully' });
      } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});



module.exports = router;