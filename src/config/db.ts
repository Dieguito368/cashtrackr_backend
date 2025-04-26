import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import colors from 'colors';

dotenv.config();

const url = process.env.DATABASE_URL;
const db = new Sequelize(url, {
    host: "localhost",
    dialect: "mysql",
    models: [ __dirname + '/../models/**/*' ],
    logging: false,
    // dialectOptions: {
    //     ssl: {
    //         rejectUnauthorized: true
    //     }
    // }
});

export const connectDB = async () => {
    try {
        await db.authenticate();
        
        db.sync();

        console.log(colors.bgGreen.bold("Conexión exitosa a la BD"));
    } catch (error) {
        console.log(colors.bgRed(`Falló la conexión a la BD: ${error.message}`));
    }
} 