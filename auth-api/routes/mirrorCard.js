const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Copy ticket and update project_id & ticket_status
router.post("/ticket/mirroring/:ticket_id", async (req, res) => {
  const { ticket_id } = req.params;
  const { new_project_id, new_ticket_status } = req.body; // Accepting new status

  try {
    // Step 1: Fetch the existing ticket data
    const [ticketData] = await db.execute(
      `SELECT * FROM tickets WHERE ticket_id = ?`,
      [ticket_id]
    );

    if (ticketData.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const ticket = ticketData[0];

    // Step 2: Insert a new ticket with the copied data and updated fields
    const insertQuery = `
            INSERT INTO tickets 
                (title, description, ticket_status, priority, project_id, created_by) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

    const [result] = await db.execute(insertQuery, [
      ticket.title,
      ticket.description,
      new_ticket_status, // Updating ticket_status
      ticket.priority,
      new_project_id, // Updating project_id
      ticket.created_by
    ]);

    // Step 3: Fetch the newly inserted ticket
    const [newTicket] = await db.execute(
      `SELECT * FROM tickets WHERE ticket_id = ?`,
      [result.insertId]
    );

    res.json({ message: "Card mirrored successfully", ticket: newTicket[0] });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
