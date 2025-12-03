import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const authorSchema = new Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true },
}, { _id: false });

const bioSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  author: { type: authorSchema, required: true },
  tags: { type: [String], default: [] },
  image: { type: Buffer },
}, { timestamps: true });

export default model('Bio', bioSchema);
