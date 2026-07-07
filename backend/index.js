import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import http from 'http';
import { Server } from 'socket.io';
import Message from './models/Message.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

// Configure dotenv
dotenv.config();
console.log("Mongo URI:", process.env.MONGODB_URI);
console.log("Node Env:", process.env.NODE_ENV);

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/messages', messageRoutes);

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join_room', (appointmentId) => {
    socket.join(appointmentId);
    console.log(`User joined room/appointment: ${appointmentId}`);
  });

  socket.on('send_message', async (data) => {
    const { appointmentId, senderId, receiverId, text } = data;
    try {
      const newMessage = new Message({
        appointment: appointmentId,
        sender: senderId,
        receiver: receiverId,
        text,
      });
      await newMessage.save();

      const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name email role');
      
      io.to(appointmentId).emit('receive_message', populatedMessage);
    } catch (err) {
      console.error('Socket message save error:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Base Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Telemedicine Consultation Portal API is running...',
  });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error('Unhandled Server Error:', err.stack);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export { io };
