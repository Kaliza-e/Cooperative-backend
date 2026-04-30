const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT t.*, m.name as assigned_to_name 
       FROM tasks t 
       LEFT JOIN members m ON t.assigned_to = m.id 
       ORDER BY t.due_date ASC`
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get task by ID
router.get('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    connection.release();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new task
router.post('/', async (req, res) => {
  const { title, description, assigned_to, assigned_by, due_date, priority, status } = req.body;
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO tasks (title, description, assigned_to, assigned_by, due_date, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, assigned_to, assigned_by, due_date, priority || 'medium', status || 'pending']
    );
    connection.release();
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  const { title, description, assigned_to, assigned_by, due_date, priority, status } = req.body;
  try {
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE tasks SET title = ?, description = ?, assigned_to = ?, assigned_by = ?, due_date = ?, priority = ?, status = ? WHERE id = ?',
      [title, description, assigned_to, assigned_by, due_date, priority, status, req.params.id]
    );
    connection.release();
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    connection.release();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
