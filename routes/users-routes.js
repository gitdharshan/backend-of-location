
const express = require('express');
const {check} = require('express-validator');
const router = express.Router();
const Usercontroller = require('../controllers/user-controllers');

router.get('/',Usercontroller.getUsers);
router.post('/signup',[
  check('name').not().isEmpty(), check('email').normalizeEmail().isEmail(),
  check('password').isLength({min: 6})

],Usercontroller.signup);
router.post('/login', Usercontroller.login);
module.exports = router;