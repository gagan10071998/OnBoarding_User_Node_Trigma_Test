const { ENUMS } = require('../constants');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserModel = new Schema({
    firstName: {
        type: String,
        default: "",
        lowercase: true,
        trim: true
    },
    lastName: {
        type: String,
        default: "",
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    countryCode: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        default: ''
    },
    status:{
        type: Number,
        enums: ENUMS.STATUS
    },
    authToken: {
        type: String,
        default: ''
    },
    dob:{
        type: String,
        default: ''
    },
    gender: {
        type: Number,
        enums: ENUMS.GENDER
    },
    isDeleted:{
        type: Boolean,
        default: false
    }
}, { timestamps: true });
UserModel.index({ email: 1, phone: 1 })
const User = mongoose.model('users', UserModel);
module.exports = User;