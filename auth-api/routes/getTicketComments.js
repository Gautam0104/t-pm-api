const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/get-comments/:ticket_id", async (req, res) => {
  const { ticket_id } = req.params;

  if (!ticket_id) {
    return res.status(400).json({ error: "Ticket ID is required" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM ticket_changes WHERE ticket_id = ?",
      [ticket_id]
    );
    res.json(rows);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
