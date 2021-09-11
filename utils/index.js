const Messages = require('../constants').LANGS
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const fs = require("fs");
module.exports = {
    /*
    Response Functions
    */
    response: async (res, status, message, data, lang) => {
        if (status != 200) {
            return await res.status(status).send({ status: status, message: await Messages[lang][message] });
        }
        return await res.status(status).send({ status: status, message: await Messages[lang][message], result: data });
    },
    /*
    Bcrypt Functions
    */
    hashPasswordUsingBcrypt: async (password) => { return bcrypt.hashSync(password, 10); },
    comparePasswordUsingBcrypt: async (pass, hash) => { return bcrypt.compareSync(pass, hash) },
    /*
    JWT Functions
    */
    jwtSign: async (payload) => {
        try {
            return jwt.sign(
                { _id: payload._id },
                config.get("JWT_OPTIONS").SECRET_KEY,
                {
                    expiresIn: config.get("JWT_OPTIONS").EXPIRES_IN
                }
            );
        } catch (error) {
            throw error;
        }
    },
    jwtVerify: async (token) => {
        try {
            return jwt.verify(token, config.get("JWT_OPTIONS").SECRET_KEY);
        } catch (error) {
            throw error;
        }
    },
    logger: async (req, res, next) => {
        console.log("API HIT", "\n|\nv\n|\nv");
        const LANGS = await getLanguages()
        if (!LANGS.includes(req.header('Accept-Language'))) { req.lang = 'en' }
        else { req.lang = req.header('Accept-Language') }
        next();
    },
    generateOtp: async () => {
        try {
            var digits = '0123456789';
            let OTP = '';
            for (let i = 0; i < config.get("OTP_OPTIONS.LENGTH"); i++) { OTP += digits[Math.floor(Math.random() * 10)]; }
            return OTP;
        } catch (error) {
            throw error;
        }
    },
}


/*
Get Languages List
*/
const getLanguages = async () => {
    let fileNames = []
    fs.readdirSync('constants/langs').forEach(file => {
        if (file != 'index.js') { file = file.replace('.js', ''); fileNames.push(file) }
    })
    return fileNames
}