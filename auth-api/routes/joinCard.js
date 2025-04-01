const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/get-join-cards", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM join_card");
    if (rows.length > 0) {
      res.json(rows);
    } else {
      res
        .status(404)
        .json({ message: "join-card not found for this ticket_id" });
    }
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// get join card by ticket-id
router.get("/get-join-card/:ticket_id", async (req, res) => {
  const { ticket_id } = req.params; // Extract ticket_id from the URL parameters

  try {
    const [rows] = await db.query(
      "SELECT * FROM join_card WHERE ticket_id = ?",
      [ticket_id]
    );
    if (rows.length > 0) {
      res.json(rows);
    } else {
      res
        .status(404)
        .json({ message: "join-card not found for this ticket_id" });
    }
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// join card
router.post("/add-join-card/", async (req, res) => {
  const { ticket_id, joined_username } = req.body;

  if (!ticket_id || !joined_username) {
    return res
      .status(400)
      .json({ message: "ticket_id and joined_username are required" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO join_card (ticket_id, joined_username) VALUES (?, ?)",
      [ticket_id, joined_username]
    );

    res.status(201).json({
      message: "join-card created successfully",
      join_card_id: result.insertId
    });
  } catch (error) {
    console.error("Database insert error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// delete join card by ticket-id
router.delete("/delete-join-card/:ticket_id", async (req, res) => {
  const { ticket_id } = req.params; // Extract ticket_id from the URL parameters

  try {
    const [result] = await db.query(
      "DELETE FROM join_card WHERE ticket_id = ?",
      [ticket_id]
    );
    if (result.affectedRows > 0) {
      res.json({ message: "join-card deleted successfully" });
    } else {
      res
        .status(404)
        .json({ message: "join-card not found for this ticket_id" });
    }
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
