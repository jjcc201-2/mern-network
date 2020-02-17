const express = require('express');
const router = express.Router();


// @route    GET api/users
// @desc     Register user
// @access   Public (whether or not you need a token to access this route)
router.get('/', (req, res) => res.send('User Route'));

module.exports = router;