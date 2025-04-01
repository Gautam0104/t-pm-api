const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Ensure this is correctly configured

// API route to copy data and update existing ticket_status
router.post("/copy-board", (req, res) => {
  const { currentStatus, newStatus } = req.body;

  console.log("Received data:", req.body);

  // Validate input
  if (!currentStatus || !newStatus) {
    console.log("Missing currentStatus or newStatus");
    return res
      .status(400)
      .json({ error: "Please provide both currentStatus and newStatus" });
  }

  // SQL query to copy tickets with a new ticket_status
  const copyQuery = `
    INSERT INTO tickets (project_id, title, description, status, priority, created_by, due_date, ticket_created_at, updated_at, ticket_status, images, card_image, ticket_eta, ticket_owner, calendar)
    SELECT project_id, title, description, status, priority, created_by, due_date, ticket_created_at, updated_at, ?, images, card_image, ticket_eta, ticket_owner, calendar
    FROM tickets
    WHERE ticket_status = ?;
  `;

  // SQL query to update original tickets
  const updateQuery = `
    UPDATE tickets
    SET ticket_status = ?
    WHERE ticket_status = ?;
  `;

  console.log("Executing copy query with params:", newStatus, currentStatus);

  // Execute the copy query
  db.query(copyQuery, [newStatus, currentStatus], (err, copyResults) => {
    if (err) {
      console.error("Error executing copy query:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error during copy query" });
    }

    console.log("Copy query results:", copyResults);

    // Now update only the original rows
    db.query(updateQuery, [newStatus, currentStatus], (err, updateResults) => {
      if (err) {
        console.error("Error executing update query:", err);
        return res
          .status(500)
          .json({ error: "Internal Server Error during update query" });
      }

      console.log("Update query results:", updateResults);

      // Respond with success
      res.status(200).json({
        message: "Data copied and original records updated successfully!",
        copiedRows: copyResults.affectedRows,
        updatedRows: updateResults.affectedRows
      });
    });
  });
});

module.exports = router;
