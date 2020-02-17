const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');
const Profile = require('../../models/Profile');
// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Private

router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate(
            'user',
            ['name', 'avatar']
        ); // Populate with the info from the user model
    
        if(!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }
        
    
    }

    catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    POST api/profile
// @desc     Create or update a user profile
// @access   Private
router.post('/', [
    // 1. Authorise to see if user is valid and has valid token
    // 2. Check for any body errors
    // 3. Pull all information from the body out via destructuring
    // 4. If its a new profile, create it
    // 5. If its an old profile, update it
    auth, [  // Auth middleware
    check('status', 'Status is required') // Validation middleware
        .not()
        .isEmpty(),
    check('skills', 'Skills is required')
        .not()
        .isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Destructuring
    const {
        company,
        location,
        website,
        bio,
        skills,
        status,
        githubusername,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook
    } = req.body;

    // Build Profile Object
    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills) { //Turn the CSV nature into an array
        profileFields.skills = skills.split(',').map(skill => skill.trim()); //skill.trim means you aren't required to seperate with , and then have a space
    }

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if(profile) { // If there is a profile, update it
            profile = await Profile.findOneAndUpdate( 
                { user: req.user.id }, 
                { $set: profileFields},
                { new: true}
            );
            return res.json(profile);
        }

        else {
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);
        }
    }
    catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;