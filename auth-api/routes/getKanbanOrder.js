// routes/getKanbanOrder.js

const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Import the MySQL connection

// API route to get the saved Kanban board order
router.get("/get-kanban-order", async (req, res) => {
    try {
        // Use async/await to handle promise-based query
        const [rows] = await db.query("SELECT * FROM kanban_order ORDER BY position");

        // Map the results to get the order of board IDs
        const orderArray = rows.map(row => row.board_id);

        // Send the order array in the response
        res.status(200).json({ order: orderArray });
    } catch (err) {
        // Handle any errors that occur during the query
        console.error("Error fetching order:", err);
        res.status(500).json({ message: "Error fetching order" });
    }
});

module.exports = router;
