import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';     
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import ambulanceRoutes from './routes/ambulanceRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import bedRoutes from './routes/bedRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import bloodBankRoutes from './routes/bloodBankRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import pharmacyRoutes from './routes/pharmacyRoutes.js';
import shiftRoutes from './routes/shiftRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import { initSocketServer } from './utils/socketServer.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
initSocketServer(server);

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wecare_hospital')
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WeCare backend is running',
  });
});

app.get('/api/config/razorpay', (req, res) => {
  res.status(200).json({
    keyId: process.env.RAZORPAY_KEY_ID || null,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ambulance', ambulanceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/blood-bank', bloodBankRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/staff', staffRoutes);

// Error handling middleware (optional, but good practice)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || process.env.BACKEND_PORT || 5001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
