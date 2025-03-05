import bycript from 'bcrypt';

export const hashPassword = async (password) => {
    const salt = await bycript.genSalt(10);

    return await bycript.hash(password, salt); 
}