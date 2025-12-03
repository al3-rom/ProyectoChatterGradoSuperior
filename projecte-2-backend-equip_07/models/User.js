import mongoose from 'mongoose';
const { model } = mongoose;

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  cognoms: { type: String, required: true },
  email: { type: String, required: true, unique: true, immutable: true },
  password: { type: String, required: true },
  dataNaixement: { type: Date, required: true },
  descripcio: { type: String, required: true },
  idiomes: { type: [String], required: false },
  avatar: { type: Buffer, required: false } 
});

export default model('User', userSchema);