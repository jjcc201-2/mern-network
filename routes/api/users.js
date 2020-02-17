const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');

// @route    POST api/users
// @desc     Register user
// @access   Public (whether or not you need a token to access this route)
router.post('/', [
    check('name', 'Name is required')
        .not()
        .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); //Bad request
    }

    const { name, email, password } = req.body; //Destructuring

    try {
        // See if the user exists
        let user = await User.findOne({ email });

        if(user) {
            return res.status(400).json({ errors: [ { msg: 'User already exists' }]});
        }
        // Get users gravatar
        const avatar = gravatar.url(email, {
            s: '200', // Size
            r: 'pg', // Rating of avatar i.e. pg friendly
            d: 'mm' // Default image
        })

        user = new User({
            name, 
            email,
            avatar,
            password
        });

        // Encrpyt password
        const salt = await bcrypt.genSalt(10); // Generate salt

        user.password = await bcrypt.hash(password, salt); // Hash password

        await user.save(); // Add user 

        // Return jsonwebtoken
        res.send('User registered');
    } 
    catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;