const mongoose = require('mongoose')

const AdminSchema = new mongoose.Schema({
 email: {
   type: String,
   required: true,
   unique: true,
   lowercase: true,
   trim: true
 },
 password: {
   type: String,
   required: true
 }
}, {
 timestamps: true // Afegeix createdAt i updatedAt automàticament
});


module.exports = mongoose.model('Admin', AdminSchema);
