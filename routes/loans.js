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

