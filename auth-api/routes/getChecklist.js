const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/get-checklist/:ticket_id", async (req, res) => {
  const { ticket_id } = req.params; // Extract ticket_id from the URL parameters

  try {
    const [rows] = await db.query(
      "SELECT * FROM checklist WHERE ticket_id = ?",
      [ticket_id]
    );
    if (rows.length > 0) {
      res.json(rows);
    } else {
      res
        .status(404)
        .json({ message: "Checklist not found for this ticket_id" });
    }
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/get-checklists", async (req, res) => {
  const { ticket_id } = req.params; // Extract ticket_id from the URL parameters

  try {
    const [rows] = await db.query("SELECT * FROM checklist");
    if (rows.length > 0) {
      res.json(rows);
    } else {
      res
        .status(404)
        .json({ message: "Checklist not found for this ticket_id" });
    }
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
