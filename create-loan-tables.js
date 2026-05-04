const pool = require('./config/db');

async function ensureLoanTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS loans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      member_id INT NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      interest_rate DECIMAL(5, 2) DEFAULT 0,
      loan_date DATE NOT NULL,
      due_date DATE NOT NULL,
      purpose TEXT,
      monthly_payment DECIMAL(10, 2) DEFAULT 0,
      status ENUM('active', 'paid', 'overdue') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
      INDEX idx_loan_member_id (member_id),
      INDEX idx_loan_status (status)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS loan_payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      loan_id INT NOT NULL,
      payment_date DATE NOT NULL,
      amount_paid DECIMAL(10, 2) NOT NULL,
      payment_method VARCHAR(100),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
      INDEX idx_payment_loan_id (loan_id),
      INDEX idx_payment_date (payment_date)
    )
  `);

  const [loanTables] = await pool.query("SHOW TABLES LIKE 'loans'");
  const [paymentTables] = await pool.query("SHOW TABLES LIKE 'loan_payments'");
  console.log(`loans table: ${loanTables.length ? 'ready' : 'missing'}`);
  console.log(`loan_payments table: ${paymentTables.length ? 'ready' : 'missing'}`);
}

ensureLoanTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
