const express = require("express");
const router = express.Router();
const db = require("../config/db");

// POST API to add a new board item
router.post("/add-new-board", async (req, res) => {
  try {
    // Extract values from request body
    const { boardTitle, boardName } = req.body;

    // Validate input
    if (!boardTitle) {
      return res.status(400).json({ error: "boardTitle is required" });
    }
    if (!boardName) {
      return res.status(400).json({ error: "boardName is required" });
    }

    // Get the max order value (default to 0 if no records exist)
    const [rows] = await db.query(
      "SELECT MAX(`order`) AS maxOrder FROM kanban_board"
    );
    const lastOrder = rows[0]?.maxOrder || 0;

    // Insert new board with the incremented order value
    const [result] = await db.query(
      "INSERT INTO kanban_board (board_title, board_name, `order`) VALUES (?, ?, ?)",
      [boardTitle, boardName, lastOrder + 1]
    );

    // Respond with success message
    res.status(201).json({
      message: "Board item added",
      data: { id: result.insertId, boardTitle, boardName, order: lastOrder + 1 }
    });
  } catch (error) {
    console.error("Error in /add-new-board:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

// GET API to fetch all board items
router.get("/get-boards", async (req, res) => {
  const { board_name } = req.query;

  if (!board_name) {
    return res.status(400).json({ error: "Missing board_name parameter" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM kanban_board WHERE board_name = ?",
      [board_name]
    );
    res.json(rows);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/delete-board/:id", async (req, res) => {
  try {
    const boardId = req.params.id;

    if (!boardId) {
      return res.status(400).json({ error: "Board ID is required" });
    }

    // Check if the board exists
    const [rows] = await db.query(
      "SELECT * FROM kanban_board WHERE board_id = ?",
      [boardId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Board not found" });
    }

    // Delete the board
    await db.query("DELETE FROM kanban_board WHERE board_id = ?", [boardId]);

    res
      .status(200)
      .json({ message: "Board deleted successfully", id: boardId });
  } catch (error) {
    console.error("Error in /deleteboard:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

router.put("/update-board/:id", async (req, res) => {
  try {
    const boardId = req.params.id;
    const { boardTitle } = req.body;

    if (!boardId) {
      return res.status(400).json({ error: "Board ID is required" });
    }
    if (!boardTitle) {
      return res.status(400).json({ error: "boardTitle is required" });
    }

    // Check if the board exists
    const [rows] = await db.query("SELECT * FROM kanban_board WHERE id = ?", [
      boardId
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Board not found" });
    }

    // Update the board title
    await db.query("UPDATE kanban_board SET board_title = ? WHERE id = ?", [
      boardTitle,
      boardId
    ]);

    res.status(200).json({
      message: "Board updated successfully",
      data: { id: boardId, boardTitle }
    });
  } catch (error) {
    console.error("Error in /updateboard:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

module.exports = router;
