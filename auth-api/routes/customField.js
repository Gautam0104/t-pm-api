const express = require("express");
const router = express.Router();
const db = require("../config/db");
const e = require("express");

router.get("/custom-field/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    const [customFields] = await db.execute(
      `SELECT custom_field_id AS id, name, type, ticket_id FROM custom_field WHERE project_id = ?`,
      [projectId]
    );

    const enrichedFields = await Promise.all(
      customFields.map(async (field) => {
        if (field.type === "dropdown") {
          const [options] = await db.execute(
            `SELECT id, label, color FROM custom_field_dropdown_option WHERE custom_field_id = ?`,
            [field.id]
          );

          // Only add options if any exist
          if (options.length > 0) {
            return { ...field, options };
          }
        }

        // Return field as-is if not dropdown or options are empty
        return field;
      })
    );

    res.status(200).json(enrichedFields);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/custom-field-value", async (req, res) => {
  try {
    const [customFields] = await db.execute(
      `SELECT * FROM custom_field_value as cfv
        LEFT JOIN custom_field as cf ON cfv.ticket_id = cf.custom_field_id`
    );
    res.status(200).json(customFields);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/custom-field-value", (req, res) => {
  const { ticketId, value } = req.body;

  // Validate request body
  if (!ticketId || !value) {
    return res.status(400).json({ error: "ticket id and value is required." });
  }

  const query = `
        INSERT INTO custom_field_value (ticket_id,value) 
        VALUES (?, ?);
    `;

  db.execute(query, [ticketId, value])
    .then((results) => {
      res.status(201).json({
        message: "field value created successfully.",
        field_value_id: results.insertId
      });
    })
    .catch((err) => {
      console.error("Database error:", err);
      res.status(500).json({ error: "Database error occurred." });
    });
});

// Create custom field
router.post("/custom-field", async (req, res) => {
  const { customName, customType, options = [], projectId } = req.body;

  try {
    // 1. Insert into custom_field table
    const [result] = await db.execute(
      `INSERT INTO custom_field (name, type, project_id) VALUES (?, ?, ?)`,
      [customName, customType, projectId]
    );

    const customFieldId = result.insertId;

    // 2. If type is dropdown, insert options
    if (customType === "dropdown" && options.length > 0) {
      const insertOptions = options.map((opt) =>
        db.execute(
          `INSERT INTO custom_field_dropdown_option (custom_field_id, label, color) VALUES (?, ?, ?)`,
          [customFieldId, opt.label, opt.color]
        )
      );

      await Promise.all(insertOptions);
    }

    res.status(201).json({ message: "Custom field created", customFieldId });
  } catch (error) {
    console.error("Insert error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete all custom fields by ticket ID
router.delete("/custom-field/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    // 1. Get all custom field IDs for this ticket
    const [fields] = await db.execute(
      `SELECT custom_field_id FROM custom_field WHERE project_id = ?`,
      [projectId]
    );

    if (fields.length === 0) {
      return res
        .status(404)
        .json({ message: "No custom fields found for this ticket" });
    }

    const fieldIds = fields.map((f) => f.custom_field_id);

    // 2. Delete dropdown options
    await db.execute(
      `DELETE FROM custom_field_dropdown_option WHERE custom_field_id IN (${fieldIds
        .map(() => "?")
        .join(",")})`,
      fieldIds
    );

    // 3. Delete custom fields
    await db.execute(
      `DELETE FROM custom_field WHERE custom_field_id IN (${fieldIds
        .map(() => "?")
        .join(",")})`,
      fieldIds
    );

    res.status(200).json({
      message: "Custom fields deleted for the ticket",
      deletedFieldIds: fieldIds
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/fetch-custom-field-value", async (req, res) => {
  const { projectId, customName, customType } = req.body;

  try {
    // 1. Fetch all ticket IDs under this project
    const [tickets] = await db.execute(
      `SELECT ticket_id FROM tickets WHERE project_id = ?`,
      [projectId]
    );

    if (tickets.length === 0) {
      return res
        .status(404)
        .json({ message: "No tickets found for this project" });
    }

    // 2. Prepare values for bulk insert
    const insertValues = tickets.map((row) => [
      row.ticket_id,
      projectId,
      customName,
      customType
    ]);

    // 3. Insert into custom_field_value table
    await db.query(
      `INSERT INTO custom_field_value (ticket_id, project_id, name, type) VALUES ?`,
      [insertValues]
    );

    res
      .status(201)
      .json({ message: "Custom field values inserted successfully" });
  } catch (error) {
    console.error("Insert error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/custom-field-value/:ticketId", async (req, res) => {
  const { ticketId } = req.params;
  const { value } = req.body; // Assuming you're sending the new value in the request body

  try {
    // Update the custom field value for the given ticket ID
    const [result] = await db.execute(
      `UPDATE custom_field_value SET value = ? WHERE ticket_id = ?`,
      [value, ticketId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Custom field value not found" });
    }

    res
      .status(200)
      .json({ message: "Custom field value updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/get-custom-field-value/:ticketId", async (req, res) => {
  const { ticketId } = req.params;

  try {
    // Fetch the custom field value for the given ticket ID
    const [result] = await db.execute(
      `SELECT * FROM custom_field_value WHERE ticket_id = ?`,
      [ticketId]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Custom field value not found" });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/custom-field-values/:projectId/:ticketId", async (req, res) => {
  const { projectId, ticketId } = req.params;

  try {
    // Step 1: Fetch custom fields for the project
    const [customFields] = await db.execute(
      `SELECT custom_field_id AS id, name, type FROM custom_field WHERE project_id = ?`,
      [projectId]
    );

    // Step 2: Fetch custom field values for the ticket
    const [fieldValues] = await db.execute(
      `SELECT * FROM custom_field_value WHERE ticket_id = ?`,
      [ticketId]
    );

    // Step 3: Match by name and combine value
    const matchedFields = customFields.map((field) => {
      const match = fieldValues.find((fv) => fv.name === field.name);
      return {
        ...field,
        value: match ? match.value : null
      };
    });

    // Step 4: If dropdown, attach options
    const enrichedFields = await Promise.all(
      matchedFields.map(async (field) => {
        if (field.type === "dropdown") {
          const [options] = await db.execute(
            `SELECT id, label, color FROM custom_field_dropdown_option WHERE custom_field_id = ?`,
            [field.id]
          );
          return { ...field, options };
        }
        return field;
      })
    );

    res.status(200).json(enrichedFields);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/custom-field-value-by-ticket/:ticketId", async (req, res) => {
  const { ticketId } = req.params;

  try {
    // Fetch the custom field value for the given ticket ID
    const [result] = await db.execute(
      `SELECT * FROM custom_field_value WHERE ticket_id = ?`,
      [ticketId]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Custom field value not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
