const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/users',async(req,res)=>{
    try {
        const [rows] = await db.query('SELECT * FROM users');
        res.json(rows);
      } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});




module.exports = router;