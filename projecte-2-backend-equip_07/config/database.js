import mongoose from 'mongoose';
import 'dotenv/config';
import debugLib from 'debug';

const debug = debugLib('chatter:config:database');

function connectToDatabase() {
  mongoose.connect(process.env.DB_STRING)
    .then(() => debug('MongoDB connected'))
    .catch((err) => debug('MongoDB connection error:', err));
}

export default connectToDatabase;
