const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/automation-data", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM automation");
    res.json(rows);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// get automation data by ticket id
router.get("/automation-data/:ticketId", async (req, res) => {
  const ticketId = req.params.ticketId;
  try {
    const [rows] = await db.query(
      "SELECT * FROM automation WHERE ticket_id = ?",
      [ticketId]
    );
    console.log(rows); // Log rows to inspect the returned data
    res.json(rows); // This should return an array of results
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/automation-data", async (req, res) => {
  const { ticketId, buttonTitle, buttonAction } = req.body;

  // Check if ticketId, buttonTitle, or buttonAction is missing
  if (!ticketId || !buttonTitle || !buttonAction) {
    return res
      .status(400)
      .json({ error: "Ticket ID, Title, and Action are required" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO automation (ticket_id, button_title, button_action) VALUES (?, ?, ?)",
      [ticketId, buttonTitle, buttonAction]
    );

    res.status(201).json({
      message: "Data inserted successfully",
      insertedId: result.insertId
    });
  } catch (error) {
    console.error("Database insert error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/update-ticket-status-automation", async (req, res) => {
  const { ticketId, ticketStatus } = req.body;

  // Validate the required fields
  if (!ticketId || !ticketStatus) {
    return res
      .status(400)
      .json({ error: "Ticket ID and Ticket Status are required" });
  }

  try {
    // Update the ticket status in the database
    const [result] = await db.query(
      "UPDATE tickets SET ticket_status = ? WHERE ticket_id = ?",
      [ticketStatus, ticketId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Respond with success
    res.status(200).json({
      message: "Ticket status updated successfully",
      ticketId,
      ticketStatus
    });
  } catch (error) {
    console.error("Database update error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/update-ticket-by-status", async (req, res) => {
  const { currentStatus, newStatus } = req.body;

  // Validate the required fields
  if (!currentStatus || !newStatus) {
    return res
      .status(400)
      .json({ error: "Current Status and New Status are required" });
  }

  try {
    // Update the ticket status in the database where the current status matches
    const [result] = await db.query(
      "UPDATE tickets SET ticket_status = ? WHERE ticket_status = ?",
      [newStatus, currentStatus]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "No tickets found with the given status" });
    }

    // Respond with success
    res.status(200).json({
      message: "Ticket status updated successfully",
      updatedCount: result.affectedRows,
      currentStatus,
      newStatus
    });
  } catch (error) {
    console.error("Database update error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.put("/update-ticket-by-status", async (req, res) => {
  const { currentStatus, newStatus } = req.body;

  console.log("Request Body:", req.body); // Log the request body

  if (!currentStatus || !newStatus) {
    return res
      .status(400)
      .json({ error: "Current Status and New Status are required" });
  }

  try {
    const [result] = await db.query(
      "UPDATE tickets SET ticket_status = ? WHERE ticket_status = ?",
      [newStatus, currentStatus]
    );

    console.log("Query Result:", result); // Log the query result

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "No tickets found with the given status" });
    }

    res.status(200).json({
      message: "Ticket status updated successfully",
      updatedCount: result.affectedRows,
      currentStatus,
      newStatus
    });
  } catch (error) {
    console.error("Database update error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// copy card automation

router.post("/copy-row-automation/:id", async (req, res) => {
  const { id } = req.params;
  const { ticketStatus } = req.body;

  try {
    // 1. Select the row by id
    const [rows] = await db.query("SELECT * FROM tickets WHERE ticket_id = ?", [
      id
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Row not found" });
    }

    const { project_id, title, created_by, description, images, card_image } =
      rows[0];

    // 2. Insert a new row with copied values and the new ticket_status
    const [result] = await db.query(
      "INSERT INTO tickets (project_id, title, description, created_by, ticket_status, images, card_image) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        project_id,
        title,
        description,
        created_by,
        ticketStatus,
        images,
        card_image
      ]
    );

    res.json({
      message: "Row copied successfully",
      insertedId: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// delete automation button
router.delete("/automation-data/:id", async (req, res) => {
  const { id } = req.params;
  console.log("Received DELETE request for ID:", id); // Debugging line

  try {
    const result = await db.query("DELETE FROM automation WHERE id = ?", [id]);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Record deleted successfully" });
    } else {
      res.status(404).json({ error: "Record not found" });
    }
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// update ticket eta or due date
router.put("/automation-ticket-eta", (req, res) => {
  console.log("Request Body:", req.body); // Debugging log

  const { ticket_id, ticket_eta } = req.body;

  if (ticket_id === undefined || ticket_eta === undefined) {
    return res.status(400).json({ error: "Ticket ID and eta are required." });
  }

  const query = "UPDATE tickets SET ticket_eta = ? WHERE ticket_id = ?";
  db.execute(query, [ticket_eta, ticket_id])
    .then((results) => {
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Ticket not found." });
      }
      res.status(200).json({ message: "Ticket eta updated successfully." });
    })
    .catch((err) => {
      console.error("Database error:", err);
      res.status(500).json({ error: "Database error" });
    });
});
// remove all checklist
router.delete("/remove-checklist/:id", async (req, res) => {
  const { id } = req.params;
  console.log("Received DELETE request for ID:", id); // Debugging line

  try {
    const result = await db.query("DELETE FROM checklist WHERE ticket_id = ?", [
      id
    ]);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Record deleted successfully" });
    } else {
      res.status(404).json({ error: "Record not found" });
    }
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
