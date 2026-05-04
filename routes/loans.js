const express = require('express');
const router = express.Router();
const pool = require('../config/db');

const LOANS_WITH_BALANCE_QUERY = `
  SELECT
    l.*,
    m.name AS member_name,
    COALESCE((
      SELECT SUM(lp.amount_paid)
      FROM loan_payments lp
      WHERE lp.loan_id = l.id
    ), 0) AS total_paid,
    (l.amount - COALESCE((
      SELECT SUM(lp.amount_paid)
      FROM loan_payments lp
      WHERE lp.loan_id = l.id
    ), 0)) AS remaining_balance
  FROM loans l
  LEFT JOIN members m ON l.member_id = m.id
`;

router.get('/', async (req, res) => {
  try {
    const [loans] = await pool.query(`${LOANS_WITH_BALANCE_QUERY} ORDER BY l.created_at DESC`);
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/member/:member_id', async (req, res) => {
  try {
    const [loans] = await pool.query(
      `${LOANS_WITH_BALANCE_QUERY} WHERE l.member_id = ? ORDER BY l.created_at DESC`,
      [req.params.member_id]
    );
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/summary/stats', async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT
        COUNT(*) AS total_loans,
        COALESCE(SUM(amount), 0) AS total_loan_amount,
        COALESCE(SUM(CASE WHEN status = 'active' THEN amount ELSE 0 END), 0) AS active_loans_amount,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS paid_loans_amount
      FROM loans
    `);

    res.json(stats[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [loans] = await pool.query(`${LOANS_WITH_BALANCE_QUERY} WHERE l.id = ?`, [req.params.id]);
    if (loans.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    res.json(loans[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { member_id, amount, interest_rate, loan_date, due_date, purpose, monthly_payment } = req.body;
    if (!member_id || !amount || !loan_date || !due_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await pool.query(
      `INSERT INTO loans (member_id, amount, interest_rate, loan_date, due_date, purpose, monthly_payment, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [member_id, amount, interest_rate || 0, loan_date, due_date, purpose || null, monthly_payment || 0, 'active']
    );

    res.status(201).json({ id: result.insertId, message: 'Loan created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { amount, interest_rate, loan_date, due_date, status, purpose, monthly_payment } = req.body;

    await pool.query(
      `UPDATE loans
       SET amount = ?, interest_rate = ?, loan_date = ?, due_date = ?, status = ?, purpose = ?, monthly_payment = ?
       WHERE id = ?`,
      [amount, interest_rate || 0, loan_date, due_date, status || 'active', purpose || null, monthly_payment || 0, req.params.id]
    );

    res.json({ message: 'Loan updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM loans WHERE id = ?', [req.params.id]);
    res.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;



