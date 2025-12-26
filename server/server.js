const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

const connectDB = require('./config/db');
connectDB();

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const resumeRoutes = require('./routes/resumeRoutes');

app.use(cors());
app.use(express.json());

app.use('/auth' , authRoutes);
app.use('/jobs' , jobRoutes);
app.use('/applications' , applicationRoutes);
app.use('/resume' , resumeRoutes);

app.get('/' , (req,res) => {
    res.status(200).send('API is running...');
})

app.listen(process.env.PORT , () => {
    console.log('Server is running on port 5000');
});