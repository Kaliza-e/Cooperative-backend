const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const {jsPDF} = require('jspdf');
const xlsx = require('xlsx');


router.get('/members/pdf', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [members] = await connection.query('SELECT * FROM members');
    connection.release();

    const doc = new jsPDF();
    doc.text('Members Report', 20, 10);
    
    let yPos = 30;
    members.forEach((member, index) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 10;
      }
      doc.text(`${index + 1}. ${member.name} - ${member.role}`, 20, yPos);
      doc.text(`   Email: ${member.email || 'N/A'} | Phone: ${member.phone || 'N/A'}`, 20, yPos + 5);
      yPos += 15;
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.send(doc.output('arraybuffer'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export members to Excel
router.get('/members/excel', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [members] = await connection.query('SELECT * FROM members');
    connection.release();

    const worksheet = xlsx.utils.json_to_sheet(members);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Members');

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=members.xlsx');

    res.send(xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' }));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export finances to Excel
router.get('/finances/excel', async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [finances] = await connection.query(
      `SELECT f.*, m.name as member_name
       FROM finances f
       LEFT JOIN members m ON f.member_id = m.id
       ORDER BY f.transaction_date DESC`
    );

    connection.release();

    const worksheet = xlsx.utils.json_to_sheet(finances);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Finances');

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=finances.xlsx');

    res.send(xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' }));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;