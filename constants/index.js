module.exports = {
    CODES: require('./codes'),
    MESSAGES: require('./messages'),
    LANGS: require('./langs'),
    REGEX: {
        EMAIL: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        PHONE: /^[0-9]+$/,
        COUNTRY_CODE: /^[0-9,+]+$/,
        DOB: /^\d{2}\/\d{2}\/\d{4}$/,
        PASSWORD: /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[a-zA-Z!#$%&? " + "])[a - zA - Z0 - 9!#$ %&?]{ 8, 20 } $ /,
        OTP: /^[0-9]*$/
    },
    ENUMS: {
        STATUS: [
            1, // ACTIVE
            2  // UNACTIVE
        ],
        GENDER: [
            0, // MALE
            1  // FEMALE
        ]
    }
}