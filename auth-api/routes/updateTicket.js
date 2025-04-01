const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../config/db");
const path = require("path");
const moment = require("moment");

// Configure multer storage options
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Set the directory where images will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Set a unique filename
  }
});

const upload = multer({ storage: storage });

router.put(
  "/update-ticket",
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "card_image", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        ticket_id,
        title,
        description,
        status,
        priority,
        due_date,
        ticket_status,
        ticket_eta,
        ticket_owner
      } = req.body;

      if (
        !ticket_id ||
        !title ||
        !description ||
        !status ||
        !priority ||
        !due_date ||
        !ticket_status ||
        !ticket_eta ||
        !ticket_owner
      ) {
        return res.status(400).json({ error: "All fields are required." });
      }

      // Fetch the current state of the ticket
      const [currentTicket] = await db.execute(
        `SELECT * FROM tickets WHERE ticket_id = ?`,
        [ticket_id]
      );

      if (currentTicket.length === 0) {
        return res.status(404).json({ error: "Ticket not found." });
      }

      const ticket = currentTicket[0];
      const changes = [];

      // Compare old and new values
      if (ticket.title !== title)
        changes.push(`Title changed from '${ticket.title}' to '${title}'`);
      if (ticket.description !== description)
        changes.push(`Description updated`);
      if (ticket.status !== status)
        changes.push(`Status changed from '${ticket.status}' to '${status}'`);
      if (ticket.priority !== priority)
        changes.push(
          `Priority changed from '${ticket.priority}' to '${priority}'`
        );
      if (
        moment(ticket.due_date).format("YYYY-MM-DD") !==
        moment(due_date).format("YYYY-MM-DD")
      ) {
        const oldDueDate = moment(ticket.due_date).format("MMMM Do YYYY");
        const newDueDate = moment(due_date).format("MMMM Do YYYY");
        changes.push(
          `Due date changed from '${oldDueDate}' to '${newDueDate}'`
        );
      }
      if (ticket.ticket_status !== ticket_status)
        changes.push(
          `Ticket status changed from '${ticket.ticket_status}' to '${ticket_status}'`
        );
      if (ticket.ticket_eta !== ticket_eta)
        changes.push(
          `Ticket ETA changed from '${ticket.ticket_eta}' to '${ticket_eta}'`
        );
      if (ticket.ticket_owner !== ticket_owner)
        changes.push(
          `Ticket owner changed from '${ticket.ticket_owner}' to '${ticket_owner}'`
        );

      // Insert into history table
      await db.execute(
        `
            INSERT INTO ticket_history (ticket_id, previous_title, previous_description, previous_status, previous_priority, previous_due_date, previous_ticket_status, previous_ticket_eta, previous_images, previous_card_image, previous_ticket_owner)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          ticket.ticket_id,
          ticket.title,
          ticket.description,
          ticket.status,
          ticket.priority,
          ticket.due_date,
          ticket.ticket_status,
          ticket.ticket_eta,
          ticket.images,
          ticket.card_image,
          ticket.ticket_owner
        ]
      );

      // Debugging: Check uploaded files
      console.log("Received Files:", req.files);

      // Handle file uploads
      const images = req.files?.images?.map((file) => file.filename) || null;
      const card_image = req.files?.card_image?.[0]?.filename || null;

      // Convert images array to JSON
      const imagesJson = images ? JSON.stringify(images) : ticket.images;
      const newCardImage = card_image || ticket.card_image;

      if (images) changes.push(`Images updated`);
      if (card_image) changes.push(`Card image updated`);

      // Update the ticket
      const [updateResult] = await db.execute(
        `
            UPDATE tickets 
            SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, ticket_status = ?, images = ?, card_image = ?, ticket_eta = ?, ticket_owner = ?
            WHERE ticket_id = ?
        `,
        [
          title,
          description,
          status,
          priority,
          due_date,
          ticket_status,
          imagesJson,
          newCardImage,
          ticket_eta,
          ticket_owner,
          ticket_id
        ]
      );

      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: "Ticket not found." });
      }

      // 🛠 **Insert into `ticket_changes` with `changed_by = 'Admin'`**
      if (changes.length > 0) {
        const insertChangesQuery = `
                INSERT INTO ticket_changes (ticket_id, change_description, changed_by, changed_at)
                VALUES ${changes.map(() => "(?, ?, ?, NOW())").join(", ")}
            `;

        const changedBy = req.body.changed_by || "Unknown"; // Retrieve from request or default to "Unknown"

        const changesParams = changes.flatMap((change) => [
          ticket_id,
          change,
          changedBy
        ]);

        console.log("Inserting Changes:", changesParams);

        await db.execute(insertChangesQuery, changesParams);
      }

      // Retrieve the updated record
      const [updatedTicket] = await db.execute(
        `SELECT * FROM tickets WHERE ticket_id = ?`,
        [ticket_id]
      );

      // Log updates to the console
      console.log("Ticket Updated Successfully:", {
        message: "Ticket updated successfully.",
        changes: changes.length > 0 ? changes : ["No changes made"],
        updatedTicket: updatedTicket[0]
      });

      res.status(200).json({
        message: "Ticket updated successfully.",
        changes: changes.length > 0 ? changes : ["No changes made"],
        updatedTicket: updatedTicket[0]
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

module.exports = router;
