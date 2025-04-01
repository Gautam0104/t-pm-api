const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.put('/update-role/:role_id', async (req, res) => {
    const { role_name } = req.body;
    const { role_id } = req.params;

    try {
        // Ensure role_id exists
        if (!role_id) {
            return res.status(400).json({ error: 'Role ID is required' });
        }

        // Fetch the current role details
        const [existingRole] = await db.execute('SELECT role_name FROM roles WHERE role_id = ?', [role_id]);

        if (existingRole.length === 0) {
            return res.status(404).json({ error: 'Role not found' });
        }

        // Save the current role details to the role_history table
        const oldRoleName = existingRole[0].role_name;

        await db.execute(
            `INSERT INTO role_history (role_id, old_role_name, updated_at) 
             VALUES (?, ?, CURRENT_TIMESTAMP)`,
            [role_id, oldRoleName]
        );

        // Update the role with the new details
        const updateQuery = `
            UPDATE roles 
            SET 
                role_name = ?, 
                updated_at = CURRENT_TIMESTAMP
            WHERE 
                role_id = ?;
        `;

        const [result] = await db.execute(updateQuery, [role_name, role_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Role not found' });
        }

        res.json({ message: 'Role updated successfully' });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
