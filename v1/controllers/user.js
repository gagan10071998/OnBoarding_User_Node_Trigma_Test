const { MESSAGES, CODES, ENUMS } = require('../../constants')
const universal = require('../../utils')
const MODELS = require('../../models')
const config = require('config')
const PROJECTIONS = require('../projections').user
const moment = require('moment')
module.exports = {
    /*
    On-Boarding
    */
    signup: async (req, res, next) => {
        try {
            req.body.status = ENUMS.STATUS[0];
            let isUserExists = await MODELS.user.findOne({ email: req.body.email, isDeleted: false }).lean().exec();
            if (isUserExists) return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.USER_ALREADY_EXIST, "", req.lang)
            isUserExists = await MODELS.user.findOne({ phone: req.body.phone, countryCode: req.body.countryCode, isDeleted: false }).lean().exec();
            if (isUserExists) return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.USER_ALREADY_EXIST, "", req.lang);
            if (req.body.password) req.body.password = await universal.hashPasswordUsingBcrypt(req.body.password);
            let user = await new MODELS.user(req.body).save();
            req.body.authToken = await universal.jwtSign(user);
            user = await MODELS.user.findByIdAndUpdate(user._id, req.body).lean()
            user = await MODELS.user.findById(user._id, PROJECTIONS.signup).lean()
            return await universal.response(res, CODES.OK, MESSAGES.USER_REGISTERED_SUCCESSFULLY, user, req.lang)
        }
        catch (error) {
            next(error);
        }
    },
    login: async (req, res, next) => {
        try {
            let isUserExists = await MODELS.user.findOne({ email: req.body.email, isDeleted: false }).lean().exec();
            if (!isUserExists) return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.USER_NOT_EXIST, "", req.lang)
            let isMatched = await universal.comparePasswordUsingBcrypt(req.body.password, isUserExists.password);
            if (!isMatched) return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.INVALID_LOGIN_CREDENTIALS, "", req.lang)
            delete req.body.password
            delete req.body.email
            req.body.authToken = await universal.jwtSign(isUserExists);
            req.body.status = ENUMS.STATUS[0];
            isUserExists = await MODELS.user.findByIdAndUpdate(isUserExists._id, req.body).lean()
            isUserExists = await MODELS.user.findById(isUserExists._id, PROJECTIONS.signup).lean()
            return await universal.response(res, CODES.OK, MESSAGES.USER_LOGGEDIN_SUCCESSFULLY, isUserExists, req.lang)
        }
        catch (error) {
            next(error);
        }
    },
    logout: async (req, res, next) => {
        try {
            await MODELS.user.findOneAndUpdate({ "_id": req.user._id }, { status: ENUMS.STATUS[1] })
            return await universal.response(res, CODES.OK, MESSAGES.USER_LOGGED_OUT_SUCCESSFULLY, "", req.lang)
        }
        catch (error) {
            next(error);
        }
    },
    changePassword: async (req, res, next) => {
        try {
            let isMatched = await universal.comparePasswordUsingBcrypt(req.body.oldPassword, req.user.password);
            if (!isMatched) return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.OLD_PASSWORD_IS_INCORRECT, "", req.lang)
            delete req.body.oldPassword
            req.body.newPassword = await universal.hashPasswordUsingBcrypt(req.body.newPassword);
            await MODELS.user.findByIdAndUpdate(req.user._id, { password: req.body.newPassword }).lean()
            return await universal.response(res, CODES.OK, MESSAGES.PASSWORD_CHANGED_SUCCESSFULLY, "", req.lang)
        }
        catch (error) {
            next(error);
        }
    },
    resetPassword: async (req, res, next) => {
        try {
            let otpExist = await MODELS.otp.findOne({ "code": parseInt(req.body.otp) }).lean();
            if (otpExist) {
                if (moment(otpExist.expiredAt) <= moment()) return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.OTP_CODE_EXPIRED, "", req.lang)
                let user = await MODELS.user.findOne({ "_id": otpExist.userId, isDeleted: false }).lean().exec();
                if (user.email != req.body.email) return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.INVALID_REQUEST, "", req.lang)
                let newPassword = await universal.hashPasswordUsingBcrypt(req.body.password);
                await MODELS.user.findOneAndUpdate({ "_id": otpExist.userId }, { password: newPassword });
                return await universal.response(res, CODES.OK, MESSAGES.PASSWORD_RESET_SUCCESSFULLY, "", req.lang)
            }
            else return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.INVALID_OTP_CODE, "", req.lang)
        }
        catch (error) {
            next(error);
        }
    },
    forgotPassword: async (req, res, next) => {
        try {
            let isUserExists = await MODELS.user.findOne({ email: req.body.email, isDeleted: false }).lean().exec();
            if (!isUserExists) return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.USER_NOT_EXIST, "", req.lang)
            req.body.userId = isUserExists._id;
            let otpAlreadySent = await MODELS.otp.findOne({ userId: req.body.userId }).lean().exec();
            if (otpAlreadySent) {
                if (moment(otpAlreadySent.expiredAt) > moment()) return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.OTP_ALREADY_SENT_TO_PROVIDED_EMAIL, "", req.lang)
                await MODELS.otp.deleteOne({ userId: req.body.userId });
            }
            req.body.code = await universal.generateOtp();
            req.body.expiredAt = moment().add(config.get("OTP_OPTIONS.EXPIRES"), config.get("OTP_OPTIONS.IN"));
            await MODELS.otp(req.body).save();
            return await universal.response(res, CODES.OK, MESSAGES.PASSWORD_RESET_OTP_SENT_SUCCESSFULLY, { code: req.body.code }, req.lang)
        }
        catch (error) {
            next(error);
        }
    }
}