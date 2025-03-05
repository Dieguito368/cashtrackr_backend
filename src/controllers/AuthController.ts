import type { Request, Response } from 'express';
import User from '../models/User';
import { hashPassword } from '../utils/auth';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        try {
            const user = new User(req.body);

            const userExists = await User.findOne({ where: { email: req.body.email } })
            
            if(userExists) {
                const error = new Error('Ya existe una cuenta con ese Email');

                res.status(409).json({ ok: false, message: error.message });

                return
            }

            user.password = await hashPassword(req.body.password);
            user.token = generateToken();

            await AuthEmail.sendConfirmationEmail({
                name: user.name,
                email: user.email,
                token: user.token
            });

            await user.save();

            res.status(201).send({ ok: true, message: "Cuenta creada correctamente" });
        } catch (error) {
            console.log({ error: `Error al crear la cuenta del usuario: ${error.mesage}` });
            
            res.status(201).send({ ok: false, mesage: '!Ocurrio un error en el servidor!' });
        }
    }
} 