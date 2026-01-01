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

// Configure CORS to allow requests from frontend
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://recruitment-management-system-flame.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
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