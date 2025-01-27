const express = require('express');
const router = express.Router();
const db = require('../config/db');  // Assuming db is your database connection

// Assuming role_id is passed as a URL parameter
router.delete('/delete-role/:role_id', async (req, res) => {
  const { role_id } = req.params; // Correct way to extract role_id from the URL parameter

  if (!role_id) {
    return res.status(400).json({ error: "Role ID is required" });
  }

  try {
    // Your query to delete the role from the database
    const result = await db.query('DELETE FROM roles WHERE role_id = ?', [role_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
