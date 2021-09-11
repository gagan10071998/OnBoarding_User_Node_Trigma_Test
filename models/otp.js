const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId
const Schema = mongoose.Schema;
const OtpModel = new Schema({
    expiredAt: {
        type: Date
    },
    code: {
        type: Number
    },
    userId: {
        type: ObjectId
    },
    email: {
        type: String
    }
}, { timestamps: true });
const Otp = mongoose.model('otps', OtpModel);
module.exports = Otp;