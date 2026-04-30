const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all members
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM members');
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get member by ID
router.get('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM members WHERE id = ?', [req.params.id]);
    connection.release();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new member
router.post('/', async (req, res) => {
  const { name, email, phone, role, status, joining_date } = req.body;
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO members (name, email, phone, role, status, joining_date) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, role, status || 'active', joining_date]
    );
    connection.release();
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update member
router.put('/:id', async (req, res) => {
  const { name, email, phone, role, status, joining_date } = req.body;
  try {
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE members SET name = ?, email = ?, phone = ?, role = ?, status = ?, joining_date = ? WHERE id = ?',
      [name, email, phone, role, status, joining_date, req.params.id]
    );
    connection.release();
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete member
router.delete('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM members WHERE id = ?', [req.params.id]);
    connection.release();
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
