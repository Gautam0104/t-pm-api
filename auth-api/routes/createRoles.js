const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/create-roles', (req, res) => {
    const { roleName} = req.body;

    // Validate request body
    if (!roleName) {
        return res.status(400).json({ error: 'Role name is required.' });
    }

    const query = `
        INSERT INTO roles (role_name) 
        VALUES (?);
    `;

    db.execute(query, [roleName])
        .then((results) => {
            res.status(201).json({ message: 'Role created successfully.', role_id: results.insertId });
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Database error occurred.' });
        });
});

module.exports = router;
