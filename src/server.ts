import express from 'express';
import morgan from 'morgan';
import { connectDB } from './config/db';
import budgetRouter from './routes/budgetRouter';
import authRouter from './routes/authRouter';

const app = express();

connectDB();

app.use(express.json());

app.use('/api/budgets', budgetRouter);
app.use('/api/auth', authRouter);

app.use(morgan('dev'));



export default app;