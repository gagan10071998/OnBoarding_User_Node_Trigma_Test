const router = require("express").Router();
const validations = require('../validations');
const controllers = require('../controllers');
/*
On-Boarding
*/
router.post("/signup", validations.user.validateSignup, controllers.user.signup)
router.post("/login", validations.user.validateLogin, controllers.user.login);
router.get("/logout", validations.user.isUserValid, controllers.user.logout);
router.put("/password/change", validations.user.isUserValid, validations.user.validateChangePassword, controllers.user.changePassword)
router.post("/password/forgot", validations.user.validateForgotPassword, controllers.user.forgotPassword)
router.post("/password/reset", validations.user.validateResetPassword, controllers.user.resetPassword)

module.exports = router