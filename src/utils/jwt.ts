import jwt from 'jsonwebtoken';
import User from '../models/User';

export const generateJWT = (id: User['id']) : string => jwt.sign({ id }, process.env.JWT_SECRET, {  expiresIn: '30d' });