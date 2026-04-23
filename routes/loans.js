const express=require('express');
const router=express.Router();
const pool=require('../config/db');


router.get('/',async(req,res)=>{
    try{
        const query=
        `SELECT l.*, m.name as member_name, 
        (SELECT SUM(amount_paid) FROM loan_payments
        WHERE loan_id = l.id) as total_paid)
        as total_paid,
        (l.amount - COALESCE((
        SELECT SUM(amount_paid) FROM loan_payments))
        WHERE loan_id = l.id, 0)) as remaining_balance
        FROM loans l
        LEFT JOIN members m ON l.member_id = m.id
        ORDER BY l.created_at DESC`;  
        
        const [loans]=await pool.query(query);
        res.json(loans);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id',async(req,res)=>{
    try{
        const query=
        `SELECT l.*, m.name as member_name,
        (SELECT SUM(amount_paid) FROM loan_payments
        WHERE loan_id = l.id) as total_paid,
        (l.amount - COALESCE((
        SELECT SUM(amount_paid) FROM loan_payments
        WHERE loan_id = l.id), 0)) as remaining_balance
        FROM loans l
        LEFT JOIN members m ON l.member_id = m.id
        WHERE l.id = ?`;
        const [loans]=await pool.query(query,[req.params.id]);
        if(loans.length===0){
            return res.status(404).json({ error:'Loan not found' });
        }
        res.json(loans[0]);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
});

router.get('/member/:member_id',async(req,res)=>{
    try{
        const query=
        `SELECT l.*, m.name as member_name,
        (SELECT SUM(amount_paid) FROM 
        loan_payments
        WHERE loan_id = l.id) as total_paid,
        (l.amount - COALESCE((
        SELECT SUM(amount_paid) FROM loan_payments
        WHERE loan_id = l.id), 0)) as remaining_balance
        FROM loans l
        LEFT JOIN members m ON l.member_id = m.id
        WHERE l.member_id = ?
        ORDER BY l.created_at DESC`;

        const [loans]=await pool.query(query,[req.params.member_id]);
        res.json(loans);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
});

router.post('/',async(req,res)=>{
    try{
        const {member_id,amount,interest_rate,
            loan_date,due_date,purpose,
            monthly_payment}=req.body;
        if(!member_id || !amount || !loan_date || !due_date){
            return res.status(400).json({ error:'Missing required fields' });
        }

        const query=`
        INSERT INTO loans (member_id, amount,
         interest_rate, loan_date, due_date,
          purpose, monthly_payment)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        const [result]=await pool.query(query,
            [member_id,
             amount, 
             interest_rate || 0, 
             loan_date,
             due_date,
             purpose,
             monthly_payment 
            ]);
          res.status(201).json({ 
            id: result.insertId, 
            message:'Loan created successfully'
        });  
    }catch(error){
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id',async(req,res)=>{
    try{
       const {amount,interest_rate,loan_date,
        due_date,status, purpose,monthly_payment}=req.body; 

       const query=`
        UPDATE loans
         SET amount=?, interest_rate=?, 
         loan_date=?, due_date=?,status=?,
          purpose=?, monthly_payment=?
         WHERE id=?`;
    
      await pool.query(query,[
        amount,
        interest_rate || 0,
        loan_date,
        due_date,
        status,
        purpose,
        monthly_payment,
        req.params.id
      ]);
      res.json({ message:'Loan updated successfully' });
    }catch(error){
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id',async(req,res)=>{
  try {
    const query = 'DELETE FROM loans WHERE id = ?';
    await pool.query(query, [req.params.id]);
    res.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/summary/stats',async(req,res)=>{
    try{
        const query=`
        SELECT 
        COUNT(*) as total_loans,
        SUM(amount) as total_loan_amount,
        SUM(CASE WHEN status='active' THEN amount ELSE 0 END)
         as active_loans_amount,
        SUM(CASE WHEN status='paid' THEN amount ELSE 0 END)
        as paid_loans_amount
        FROM loans`;

      const [stats]=await pool.query(query);
      res.json(stats[0] || {});
    }catch(error){
     res.status(500).json({ error: error.message });
    }
});

module.exports=router;



