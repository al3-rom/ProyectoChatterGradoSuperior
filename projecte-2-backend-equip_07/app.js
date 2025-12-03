import 'dotenv/config';
import express from 'express';
import connectToDatabase from './config/database.js';

import passport from 'passport';
import registrarEstrategiaJwtPassport from './middleware/jwt-passport.js';
import requireAuth from './middleware/requireAuth.js';

import auth from './routes/auth.routes.js';
import cors from 'cors';
import users from './routes/users.routes.js';
import bios from './routes/bios.routes.js';
import chats from './routes/chats.routes.js';
import prueba from './routes/prueba.js';

const app = express();

// connect to database
connectToDatabase();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const allowedOrigins = [
  'http://localhost:5173',
  /^https:\/\/.*\.vercel\.app$/,
  process.env.FRONTEND_URL,    
].filter(Boolean);

// middlewares
registrarEstrategiaJwtPassport(passport);
app.use(passport.initialize());

app.use(express.json());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, 
  })
);

// Log helpers
const log = (msg) => console.log(`\x1b[36m▶\x1b[0m ${msg}`);
const ok  = (msg) => console.log(`\x1b[32m✔\x1b[0m ${msg}`);

// routes públicas
app.use('/api/auth', auth);
app.use('/api/prueba', requireAuth, prueba);

// rutas privadas (requieren JWT)
app.use('/api/users', requireAuth, users);
app.use('/api/bios', requireAuth, bios);
app.use('/api/chats', requireAuth, chats);

// start server
app.listen(PORT, () => {
  ok('Server started');
  log(`Running at: http://${HOST}:${PORT}.`);
});

export default app;
