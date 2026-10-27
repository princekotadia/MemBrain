import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import inputRoutes from './routes/route.js';

const app = express();

const clientUrl = (process.env.CLIENT_URL || '').trim().replace(/\/+$/, '');

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/+$/, '');

      if (
        cleanOrigin === clientUrl ||
        cleanOrigin === 'http://localhost:5173' ||
        cleanOrigin === 'http://127.0.0.1:5173' ||
        cleanOrigin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }

      // Default fallback allows the origin dynamically in development
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use('/try', inputRoutes);

app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`);
});
