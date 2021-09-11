const router = require('express').Router();
const Routes = require('./routes/');
router.use('/user', Routes.user);
module.exports = router;