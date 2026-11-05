const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/members', require('./routes/members'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/finances', require('./routes/finances'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/exports', require('./routes/exports'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/loan-payments', require('./routes/loan-payments'));


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
