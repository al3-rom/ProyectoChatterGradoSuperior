import mongoose from 'mongoose';
import User from './User.js';
const { Schema, model } = mongoose;

const messagesSchema = new Schema({
    author: {
            id: {type: Schema.Types.ObjectId,  required:true,  ref: User},
            name: {type: String, required: true},
            email: {type: String, required: true}
    },
    content: {type: String, required: true}
}, {timestamps: true});


const chatSchema = new Schema({
    title: {type: String},
    image: {type: Buffer},
    creator: {
        id: { type: Schema.Types.ObjectId,  required:true, ref: User},
        name: {type: String,  required:true},
        email: {type: String,  required:true}
    },
    participants: [{
        id: {type: Schema.Types.ObjectId,  required:true,  ref: User},
        name: {type: String, required:true},
        email: {type: String, required:true}
    }, ],
    messages: [{type: messagesSchema}]
}, { timestamps: true });


export default model('Chat', chatSchema);