import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import paymentRoutes from './routes/payment.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import productRoutes from './routes/products.js';
import adminRoutes from './routes/admin.js';


const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
    cors : { origin: process.env.CLIENT_URL, credentials: true}
})

//middlewares 
app.use(helmet());
app.use(cors({origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const limiter = rateLimit({ windowMs: 15*60*1000, max: 100});
app.use('/api', limiter);
app.use('/api/auth', authRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes); 

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

await connectDB();
httpServer.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
})
