import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import inputRoutes from './routes/route.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
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
