const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/ticket-history/:ticket_id', async (req, res) => {
    const { ticket_id } = req.params;

    try {
        const [history] = await db.execute(`
            SELECT * FROM ticket_history WHERE ticket_id = ? ORDER BY updated_at DESC
        `, [ticket_id]);

        res.status(200).json(history);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});





module.exports = router;