import dotenv from 'dotenv';
import User from '../models/User.js';
import { hashPassword, comparePassword, signAccessToken } from '../config/crypto.js';
import { ValidarEmailPass, UserExist } from '../lib/validation.js';
import { sendSuccess, sendError } from "../lib/response.js";

dotenv.config();

export const authRegister = async (req, res) => {
  try {
    await ValidarEmailPass(res, req.body);

    const { email, password, nom, cognoms, dataNaixement, descripcio, idiomes } = req.body;

    if (!email || !password || !nom || !cognoms || !dataNaixement || !descripcio) {
      return sendError(res, 'Faltan campos requeridos!', 400);
    }

    const existingUser = await User.findOne({ email });
    await UserExist(res, existingUser);

    const avatarBuffer = req.file?.buffer;

    await User.create({
      email,
      password: await hashPassword(password),
      nom,
      cognoms,
      dataNaixement: new Date(dataNaixement),
      idiomes,
      descripcio,
      avatar: avatarBuffer
    });

    return sendSuccess(res, { email }, 'User registered successfully', 201);
  } catch (err) {
    console.error(err);
    return sendError(res, 'Error registering user', 500, { error: err.message });
  }
};

export const authLogin = async (req, res) => {
  try {
    await ValidarEmailPass(res, req.body);

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return sendError(res, 'Autenticación fallida. Usuario no encontrado.', 404);

    const isValid = await comparePassword(password, user.password);
    if (!isValid) return sendError(res, 'Autenticación fallida. Contraseña incorrecta.', 403);

    const payload = { user: user.id, timestamp: Date.now() };
    const accessToken = signAccessToken(payload);

    return sendSuccess(res, { accessToken }, 'Authorized successfully');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Error logging in', 500, { error: err.message });
  }
};

export const authLogout = async (req, res) => {
  try {
    return sendSuccess(res, { logout: true }, 'Logout successful');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Error logging out', 500, { error: err.message });
  }
};