const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/project',async(req,res)=>{
    try {
         const {project_name, project_leader_id, description, status, project_type, total_eta} = req.body;
          // Handle undefined values
                const leaderId = project_leader_id || null;
                const desc = description || null;
                const projStatus = status || 0;
                const projectType = project_type || null;
                const eta = total_eta || 0;
                
         const query = `INSERT INTO projects 
                        (project_name,project_leader_id,description,project_status, project_type, total_eta,  created_at, updated_at)
                         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;
            const values = [project_name, leaderId, desc, projStatus, projectType, eta ];
          await db.execute(query,values);
          res.status(201).send('Project created successfully.');
      } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});




module.exports = router;