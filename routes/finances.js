const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT f.*, m.name as member_name\
             FROM finances f LEFT JOIN members m
             ON f.member_id = m.id ORDER BY f.transaction_date DESC`
        );
        connection.release();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/summary/totals', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows]=await connection.query(
            `SELECT 
             SUM(CASE WHEN transaction_type='income' THEN amount ELSE 0 END) as total_income,
             SUM(CASE WHEN transaction_type='expense' THEN amount ELSE 0 END) as total_expense,
             FROM finances`
        );
        connection.release();
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    const {transaction_type,amount,category, description,transaction_date,payment_method,member_id} = req.body;
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'INSERT INTO finances (transaction_type, amount, category, description, transaction_date, payment_method, member_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [transaction_type, amount, category, description, transaction_date, payment_method, member_id]
        );
        connection.release();
        res.status(201).json({ id: result.insertId, ...req.body});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    const {transaction_type,amount,category, description,transaction_date,payment_method,member_id} = req.body;
    try {
        const connection = await pool.getConnection();  
        await connection.query( 
            'UPDATE finances SET transaction_type=?, amount=?, category=?, description=?, transaction_date=?, payment_method=?, member_id=? WHERE id=?',
            [transaction_type, amount, category, description, transaction_date, payment_method, member_id, req.params.id]
        );
        connection.release();
        res.json({ id: req.params.id, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query(
            'DELETE FROM finances WHERE id=?',
            [req.params.id]
        );
        connection.release();
        res.json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;