const express = require('express');
const router = express.Router();
const db = require('../config/db');

// API route to save Kanban board order
router.post("/save-kanban-order", async (req, res) => {
    const { order } = req.body; // Expects an array of board IDs and their new order

    if (!Array.isArray(order)) {
        return res.status(400).json({ message: "Invalid order format" });
    }

    try {
        // Clear the existing order
        await db.query("DELETE FROM kanban_order");

        // Insert the new order into the database
        const query = "INSERT INTO kanban_order (board_id, position) VALUES ?";
        const values = order.map((boardId, index) => [boardId, index + 1]);

        await db.query(query, [values]);

        res.status(200).json({ message: "Order saved successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error saving new order", error: err });
    }
});

module.exports = router;
