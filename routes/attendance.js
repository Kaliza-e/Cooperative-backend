const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all attendance records
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT a.*, m.name as member_name, mt.title as meeting_title 
       FROM attendance a 
       JOIN members m ON a.member_id = m.id 
       JOIN meetings mt ON a.meeting_id = mt.id 
       ORDER BY a.marked_at DESC`
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance by meeting ID
router.get('/meeting/:meeting_id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT a.*, m.name as member_name 
       FROM attendance a 
       JOIN members m ON a.member_id = m.id 
       WHERE a.meeting_id = ?`,
      [req.params.meeting_id]
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record attendance
router.post('/', async (req, res) => {
  const { meeting_id, member_id, status } = req.body;

  try {
    const connection = await pool.getConnection();

    const query = `
      INSERT INTO attendance (meeting_id, member_id, status)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE status = VALUES(status)
    `;

    await connection.query(query, [
      meeting_id,
      member_id,
      status || 'absent'
    ]);

    connection.release();

    res.status(201).json({
      meeting_id,
      member_id,
      status
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update attendance
router.put('/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE attendance SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    connection.release();
    res.json({ id: req.params.id, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete attendance record
router.delete('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM attendance WHERE id = ?', [req.params.id]);
    connection.release();
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
