import bycript from 'bcrypt';
import User from '../models/User';

export const hashPassword = async (password: User['password']) => {
    const salt = await bycript.genSalt(10);

    return await bycript.hash(password, salt); 
}

export const checkPassword =  async (passwordEntered: User['password'], passwordHashed: User['password']) => await bycript.compare(passwordEntered, passwordHashed);