const express=require('express');
const cors=require('cors');
const bodyParser=require('body-parser');
require('dotenv').config();
const app=express();


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/members',require('./routes/members'));
app.use('/api/meetings',require('./routes/meetings'));
app.use('/api/tasks',require('./routes/tasks'));
app.use('/api/loans',require('./routes/loans'));
app.use('/api/attendance',require('./routes/attendance'));
app.use('/api/finances',require('./routes/finances'));
app.use('/api/exports',require('./routes/exports'));
app.use('/api/loan-payments',require('./routes/loan-payments'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});


