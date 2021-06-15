import mongoose from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {type: String, require:[true]},
    email: {type: String, require:[true], unique:true},
    password: {type: String, require:[true]}
});

// Validator
userSchema.plugin(uniqueValidator, { message: 'Error, email already exist.'});

// Convertir a modelo
const User = mongoose.model('User', userSchema);

export default User;