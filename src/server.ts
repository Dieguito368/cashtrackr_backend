import express from 'express';
import morgan from 'morgan';
import budgetRouter from './routes/budgetRouter';
import authRouter from './routes/authRouter';

const app = express();

app.use(morgan('dev'));

app.use(express.json());

app.use('/api/budgets', budgetRouter);
app.use('/api/auth', authRouter);

export default app;