const express = require('express');
const router = express.Router();
const db = require('../config/db');
//get whole project data
router.get('/projects',async(req,res)=>{
    try {
        const [rows] = await db.query('SELECT * FROM projects AS project LEFT JOIN users AS user ON project.project_leader_id = user.user_id');
        res.json(rows);
      } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});



module.exports = router;