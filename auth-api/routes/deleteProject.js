const express = require('express');
const router = express.Router();
const db = require('../config/db');
//get single project data
router.delete('/deleteProject/:id', async (req,res)=>{
    try {
        const { id } = req.params;

        // Validate ID
        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID parameter' });
        }
        // Query to fetch the record by ID
        const query = 'DELETE FROM projects WHERE project_id = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
              console.error('Error executing query:', err);
              return res.status(500).json({ error: 'Database error' });
            }
        
            if (result.affectedRows === 0) {
              return res.status(404).json({ message: 'Record not found' });
            }
        
            res.json({ message: 'Record deleted successfully' });
          });
      } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});



module.exports = router;