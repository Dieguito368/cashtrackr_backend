import type { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import User from "../models/User";
import { sendErrorResponse } from "../utils";

declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const bearer = req.headers.authorization;

        if(!bearer) return sendErrorResponse(res, 401, "No autorizado");

        const [ , token ] = bearer.split(' ');

        if(!token) return sendErrorResponse(res, 401, "No autorizado");

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if(err) {
                if(err.name === 'TokenExpiredError')return sendErrorResponse(res, 401, "Token expirado");

                return sendErrorResponse(res, 401, "Token no válido");
            }

            if(typeof decoded === 'object' && decoded.id) {
                const user = await User.findByPk(decoded.id, { attributes: [ 'id', 'name', 'email' ] });

                if(!user) return sendErrorResponse(res, 401, "No autorizado");

                req.user = user;

                next();
            } else sendErrorResponse(res, 401, "Token no válido");
        });
    } catch (error) {
        console.log({ message: 'Error al obtener el usuario', error });
        
        res.status(500).json({ ok: false, message: '!Ocurrio un error en el servidor!' });
    }
}