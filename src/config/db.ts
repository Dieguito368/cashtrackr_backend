import { Sequelize } from "sequelize-typescript";
import colors from "colors";

const url = process.env.DATABASE_URL;

const db = new Sequelize(url, {
    dialect: "postgres",
    logging: false,
    models: [ __dirname + '/../models/**/*' ],
});

export const connectDB = async () => {
    try {
        await db.authenticate();
        
        await db.sync();

        console.log(colors.bgGreen.bold("Conexión exitosa a la BD"));
    } catch (error) {
        console.log(colors.bgRed(`Falló la conexión a la BD: ${error.message}`));
    }
} 

export default db;