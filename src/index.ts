import "dotenv/config";
import server from './server';
import colors from 'colors';
import { connectDB } from './config/db';

const port = process.env.PORT || 4000;

const startServer = async () => {
    await connectDB();

    server.listen(port, () => console.log(colors.bgCyan.bold(`Servidor funcionando en el puerto: ${port}`)));
}

startServer();