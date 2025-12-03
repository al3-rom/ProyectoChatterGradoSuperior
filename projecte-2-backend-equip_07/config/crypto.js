import 'dotenv/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_KEY = process.env.SECRET

export const hashPassword = async (password) => {
    if(!password || typeof(password) !== 'string') {
        throw new Error('Password vacio')
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    return hash;
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};
        
export const signAccessToken = (payload) => {
  return jwt.sign(payload, JWT_KEY, { expiresIn: '7d' });
};


