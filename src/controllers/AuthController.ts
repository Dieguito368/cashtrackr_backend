import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { hashPassword, checkPassword } from '../utils/auth';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';
import { generateJWT } from '../utils/jwt';
import { sendErrorResponse } from '../utils';

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

            res.status(201).json({ ok: true, message: "Cuenta creada correctamente" });
        } catch (error) {
            console.log({ message: 'Error al crear la cuenta del usuario', error });
            
            res.status(500).json({ ok: false, message: '!Ocurrio un error en el servidor!' });
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const token = req.body.token.toString();

            const user = await User.findOne({ where: { token } });

            if(!user) {
                const error = new Error('Token no válido');

                res.status(401).json({ ok: false, message: error.message });

                return;
            }

            user.confirmed = !user.confirmed;
            user.token = null;

            await user.save();

            res.status(200).json({ ok: true, message: 'Cuenta confirmada correctamente' });
        } catch (error) {
            console.log({ message: 'Error al confirmar la cuenta del usuario', error });
            
            res.status(500).json({ ok: false, message: '!Ocurrio un error en el servidor!' });
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ where: { email } });

            if(!user) {
                const error = new Error('No pudimos encontrar su cuenta de CrashTrackr');

                res.status(404).json({ ok: false, message: error.message });

                return;
            }

            if(!user.confirmed) {
                const error = new Error('La cuenta no ha sido confirmada');
    
                res.status(403).json({ ok: false, message: error.message });
                
                return;
            }

            const isPasswordCorrect = await checkPassword(password, user.password);
            
            if(!isPasswordCorrect) {
                const error = new Error('La contraseña no es correcta');

                res.status(401).json({ ok: false, message: error.message });
                
                return;
            }

            res.status(200).json({ ok: true, token: generateJWT(user.id) });
        } catch (error) {
            console.log({ message: 'Error al loguear al usuario', error });
            
            res.status(500).json({ ok: false, message: '!Ocurrio un error en el servidor!' });
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;

            const user = await User.findOne({ where: { email } });

            if(!user) {
                const error = new Error('No pudimos encontrar su cuenta de CrashTrackr');

                res.status(404).json({ ok: false, message: error.message });

                return;
            }

            if(!user.confirmed) {
                const error = new Error('La cuenta no ha sido confirmada');
    
                res.status(403).json({ ok: false, message: error.message });
                
                return;
            }

            user.token = generateToken();

            await user.save();

            await AuthEmail.sendPasswordResetToken({
                name: user.name,
                email: user.email,
                token: user.token
            });

            res.status(200).json({ ok: true, message: "Revisa tu correo y restablece la contraseña" });
        } catch (error) {
            console.log({ message: 'Error al recuperar la contraseña del usuario', error });
            
            res.status(500).json({ ok: false, message: '!Ocurrio un error en el servidor!' });
        }
    }
    
    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;

            const user = await User.findOne({ where: { token } });

            if(!user) {
                const error = new Error('Token no válido');

                res.status(404).json({ ok: false, message: error.message });

                return;
            }

            res.status(200).json({ ok: true, message: "Token válido" });
        } catch (error) {
            console.log({ message: 'Error al recuperar la contraseña del usuario', error });
            
            res.status(500).json({ ok: false, message: '!Ocurrio un error en el servidor!' });
        }
    }

    static resetPasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params;
            const { password } = req.body;

            const user = await User.findOne({ where: { token } });

            if(!user) {
                const error = new Error('Token no válido');

                res.status(404).json({ ok: false, message: error.message });

                return;
            }

            user.password = await hashPassword(password);
            user.token = null;

            await user.save();

            res.status(200).json({ ok: true, message: "Contraseña reseteada correctamente" });
        } catch (error) {
            console.log({ message: 'Error al resetear la contraseña del usuario', error });
            
            res.status(500).json({ ok: false, message: '!Ocurrio un error en el servidor!' });
        }
    }
    
    static getUser = (req: Request, res: Response) => {
        res.status(200).json({ ok: true, user: req.user });
    }

    static updateCurrentUserPassworrd = async (req: Request, res: Response) => {
        try {
            const { current_password: currentPassword, new_password: newPassword } = req.body;

            const user = await User.findByPk(req.user.id);

            if(!user) sendErrorResponse(res, 401, 'No autorizado');

            const isPasswordCorrect = await checkPassword(currentPassword, user.password);

            if(!isPasswordCorrect) return sendErrorResponse(res, 401, "La contraseña actual es incorrecta");

            user.password = await hashPassword(newPassword);

            await user.save();

            res.status(200).json({ ok: true, user: "Contraseña actualizada correctamente" });
        } catch (error) {
            console.log({ message: 'Error al actualizar la contraseña del usuario', error });
            
            res.status(500).json({ ok: false, message: '!Ocurrio un error en el servidor!' });
        }
    }

    static checkPassword = async (req: Request, res: Response) => {
        try {
            const { current_password: currentPassword } = req.body;

            const user = await User.findByPk(req.user.id);

            if(!user) sendErrorResponse(res, 401, 'No autorizado');

            const isPasswordCorrect = await checkPassword(currentPassword, user.password);

            if(!isPasswordCorrect) return sendErrorResponse(res, 401, "La contraseña actual es incorrecta");

            res.status(200).json({ ok: true, message: "La contraseña actual es correcta" });
        } catch (error) {
            console.log({ message: 'Error al actualizar la contraseña del usuario', error });
            
            res.status(500).json({ ok: false, message: '!Ocurrio un error en el servidor!' });
        }
    }
}