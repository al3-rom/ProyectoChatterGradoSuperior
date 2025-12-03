import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const kissSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bioId: {
      type: Schema.Types.ObjectId,
      ref: 'Bio',
      required: true
    }
  },
  { timestamps: true }
);

// indice unico para evitar kisses duplicados
kissSchema.index({ author: 1, bioId: 1 }, { unique: true });

export default model('Kiss', kissSchema);
