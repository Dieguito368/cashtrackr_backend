import express from 'express';
import morgan from 'morgan';
import { connectDB } from './config/db';
import budgetRouter from './routes/budgetRouter';

const app = express();

connectDB();

app.use(express.json());

app.use('/api/budgets', budgetRouter);

app.use(morgan('dev'));



export default app;