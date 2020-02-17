const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');

const User = require('../../models/User');

// @route    GET api/auth
// @desc     Test Route
// @access   Public
router.get('/', auth, async (req, res) => {
    try {
        // Get user information
        const user = await User.findById(req.user.id).select('-password'); // Don't include password
        res.json(user);
    } 
    catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}); // Including the auth middleware will cause the route to be protected


// @route    POST api/auth
// @desc     Authenticate User and Get Token
// @access   Public
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); //Bad request
    }

    const { email, password } = req.body; //Destructuring

    // Before authentication a previuosly registered user:
        // 1. See if they exist
        // 2. Check if password matches
        // 3. Return jsonwebtoken for authentication
    try {
        // See if the user exists
        let user = await User.findOne({ email });

        if(!user) {
            return res
                .status(400)
                .json({ errors: [ { msg: 'Invalid Credentials' }]});
        }


        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res
                .status(400)
                .json({ errors: [ { msg: 'Invalid Credentials' }]});
        }

        // Return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload, // Pass in payload
            config.get('jwtSecret'), // Pass in secret
            { expiresIn: 360000 }, // 3600 is 1 hour. Chane this to 3600 later
            (err, token) => {
                if(err) throw err;
                res.json({ token });
            }
        );
    } 
    catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;