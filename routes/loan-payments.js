const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all payments for a loan
router.get('/loan/:loanId', async (req, res) => {
  try {
    const query = `
      SELECT * FROM loan_payments
      WHERE loan_id = ?
      ORDER BY payment_date DESC
    `;
    const [payments] = await db.query(query, [req.params.loanId]);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record loan payment
router.post('/', async (req, res) => {
  try {
    const { loan_id, payment_date, amount_paid, payment_method, notes } = req.body;

    if (!loan_id || !payment_date || !amount_paid) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check loan exists
    const [loans] = await db.query(
      'SELECT * FROM loans WHERE id = ?',
      [loan_id]
    );

    if (loans.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const loan = loans[0];

    // Check total paid so far
    const [payments] = await db.query(
      'SELECT SUM(amount_paid) as total FROM loan_payments WHERE loan_id = ?',
      [loan_id]
    );

    const totalPaid = payments[0].total || 0;

    const remaining = loan.amount - totalPaid;

    // Prevent overpayment
    if (amount_paid > remaining) {
      return res.status(400).json({
        error: `Overpayment not allowed. Remaining balance: ${remaining}`
      });
    }

    // Insert payment
    const query = `
      INSERT INTO loan_payments
      (loan_id, payment_date, amount_paid, payment_method, notes)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      loan_id,
      payment_date,
      amount_paid,
      payment_method,
      notes
    ]);

    res.status(201).json({
      id: result.insertId,
      message: 'Payment recorded successfully'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const query = 'SELECT * FROM loan_payments WHERE id = ?';
    const [payments] = await db.query(query, [req.params.id]);
    if (payments.length === 0) return res.status(404).json({ error: 'Payment not found' });
    res.json(payments[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update payment
router.put('/:id', async (req, res) => {
  try {
    const { payment_date, amount_paid, payment_method, notes } = req.body;

    const query = `
      UPDATE loan_payments
      SET payment_date = ?, amount_paid = ?, payment_method = ?, notes = ?
      WHERE id = ?
    `;
    await db.query(query, [payment_date, amount_paid, payment_method, notes, req.params.id]);

    res.json({ message: 'Payment updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete payment
router.delete('/:id', async (req, res) => {
  try {
    const query = 'DELETE FROM loan_payments WHERE id = ?';
    await db.query(query, [req.params.id]);
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
