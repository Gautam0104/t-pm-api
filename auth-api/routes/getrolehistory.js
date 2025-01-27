const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/role-history/:role_id', async (req, res) => {
    const { role_id } = req.params;

    try {
        const [history] = await db.execute(`
            SELECT * FROM role_history WHERE role_id = ? ORDER BY updated_at DESC
        `, [role_id]);

        res.status(200).json(history);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});





module.exports = router;