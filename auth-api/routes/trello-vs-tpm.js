const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/feature-comparison',async(req,res)=>{
    try {
        const [rows] = await db.query('SELECT * FROM feature_comparison');
        res.json(rows);
      } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});




module.exports = router;