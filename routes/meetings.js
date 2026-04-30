const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all meetings
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM meetings ORDER BY meeting_date DESC');
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get meeting by ID
router.get('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM meetings WHERE id = ?', [req.params.id]);
    connection.release();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new meeting
router.post('/', async (req, res) => {
  const { title, description, meeting_date, location, meeting_type, status } = req.body;
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO meetings (title, description, meeting_date, location, meeting_type, status) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, meeting_date, location, meeting_type || 'regular', status || 'scheduled']
    );
    connection.release();
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update meeting
router.put('/:id', async (req, res) => {
  const { title, description, meeting_date, location, meeting_type, status } = req.body;
  try {
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE meetings SET title = ?, description = ?, meeting_date = ?, location = ?, meeting_type = ?, status = ? WHERE id = ?',
      [title, description, meeting_date, location, meeting_type, status, req.params.id]
    );
    connection.release();
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete meeting
router.delete('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM meetings WHERE id = ?', [req.params.id]);
    connection.release();
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
