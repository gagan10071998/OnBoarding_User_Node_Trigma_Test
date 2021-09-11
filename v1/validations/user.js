const { REGEX, ENUMS, CODES, MESSAGES } = require('../../constants');
const joi = require("joi");
const config = require('config')
const universal = require('../../utils')
const MODELS = require('../../models');

const validateSchema = async (req, res, next, schema) => {
    try {
        const { error, value } = await schema.validate(req.body);
        if (error) throw error.details ? error.details[0].message.replace(/['"]+/g, '') : "";
        else next()
    } catch (error) { next(error); }
};

const validateSignup = async (req, res, next) => {
    let schema = joi.object().keys({
        firstName: joi.string().required(),
        lastName: joi.string().required(),
        email: joi.string().regex(REGEX.EMAIL).trim().lowercase().required(),
        phone: joi
            .string()
            .regex(REGEX.PHONE)
            .min(5)
            .required(),
        countryCode: joi
            .string()
            .regex(REGEX.COUNTRY_CODE)
            .trim()
            .min(2)
            .required(),
        dob: joi.string().regex(REGEX.DOB).required(),
        gender: joi.number().valid(...ENUMS.GENDER).required(),
        password: joi
            .string()
            .min(4)
            .alphanum()
            .required()
    });
    return await validateSchema(req, res, next, schema);
};

const validateLogin = async (req, res, next) => {
    let schema = joi.object().keys({
        email: joi.string().regex(REGEX.EMAIL).trim().lowercase().required(),
        password: joi
            .string()
            .min(4)
            .alphanum()
            .required()
    });
    return await validateSchema(req, res, next, schema);
};

const validateChangePassword = async (req, res, next) => {
    let schema = joi.object().keys({
        oldPassword: joi
            .string()
            .min(4)
            .alphanum()
            .required(),
        newPassword: joi
            .string()
            .min(4)
            .alphanum()
            .required()
    });
    return await validateSchema(req, res, next, schema);
};

const validateForgotPassword = async (req, res, next) => {
    let schema = joi.object().keys({
        email: joi.string().regex(REGEX.EMAIL).trim().lowercase().required()
    });
    return await validateSchema(req, res, next, schema);
};

const validateResetPassword = async (req, res, next) => {
    let schema = joi.object().keys({
        otp: joi.string().regex(REGEX.OTP).length(config.get("OTP_OPTIONS.LENGTH")).required(),
        password: joi
            .string()
            .min(4)
            .alphanum()
            .required(),
        email: joi.string().regex(REGEX.EMAIL).trim().lowercase().required()
    });
    return await validateSchema(req, res, next, schema);
};



const isUserValid = async (req, res, next) => {
    try {
        if (req.user && req.user.guestMode) {
            next();
        } else if (req.headers.authorization) {
            const accessToken = req.headers.authorization;
            const decodeData = await universal.jwtVerify(accessToken);
            if (!decodeData) return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.USER_NOT_EXIST, {}, req.lang);
            const userData = await MODELS.user.findOne({ _id: decodeData._id }).lean().exec();
            if (userData && userData.authToken != accessToken) {
                return await universal.response(res, CODES.UN_AUTHORIZED, MESSAGES.INVALID_AUTH_TOKEN, {}, req.lang);
            }
            else if (userData) {
                req.user = userData;
                next();
            } else return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.USER_NOT_EXIST, {}, req.lang);
        }
        else return await universal.response(res, CODES.UN_AUTHORIZED, MESSAGES.USER_NOT_AUTHORIZED, {}, req.lang);
    } catch (error) {
        next(error)
    }
};


module.exports = {
    validateSignup,
    validateLogin,
    validateChangePassword,
    validateForgotPassword,
    validateResetPassword,
    isUserValid
}