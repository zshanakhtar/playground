const router = require('express').Router();
const User = require('../model/User');
const {registerValidation, loginValidation} = require('../validation')
const bcrypt = require('bcryptjs');

router.post('/register', async (req,res) => {
    
    //validation
    const { error } = registerValidation(req.body);
    if (error)
        return res.status(400).send(error.details[0].message);
    
    //checking if email exists already
    const emailExists = await User.findOne({email: req.body.email});
    if (emailExists)
        return res.status(400).send('Email already exists');
        
        //hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        
        //create new user
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        try{
            const savedUser = await user.save();
            res.send({user : savedUser._id});
        }catch(err){
            res.status(400).send(err);
        }
    });
    
    router.post('/login', async (req,res) => {
        //validation
        const { error } = loginValidation(req.body);
        if (error)
        return res.status(400).send(error.details[0].message);
        
        //checking if email exists
        const user = await User.findOne({email: req.body.email});
        if (!user)
            return res.status(400).send('Email or password wrong');
        
        //Checking Password
        const validPass = await bcrypt.compare(req.body.password, user.password);
        if(!validPass)
            return res.status(400).send('Email or password incorrect');
        
        return res.send('Logged In');
    });

module.exports =router;