//bring express router
const express = require('express');

//to use express router,we want to create a variable called router and we want to set that to express dot capital,our router like that.
const router = express.Router();

//check validation(name,email,pass correct or not) using express validator
const { check, validationResult } = require('express-validator')

//bring usermodel
const User = require('../../models/User');
//bring gravatar
const gravatar = require('gravatar'); 
//bring bycrpt for encrypted password
const bcrypt = require('bcryptjs');
//bring jwt
const jwt = require('jsonwebtoken');
//get jwt from defaultjson
const config = require('config');




//get router request
//callback using arrow function with request response
//then to send response set it res.send
//request type- @route POST api/users
//@description what route does- Register user
//@access vale- Public
// so inorder to register user we need name & email, password.
router.post('/',
[
  //check function to check for name 
  //second parameter with custom error message
  //otherwise some generic message
  check('name','Name is required').not().isEmpty(),
  //check valid email or not
check('email','Please include a valid email').isEmail(),
check('password','Please enter a password with 6 or more characters').isLength({min: 6})
],

async(req,res) => {
  //in console request body because that's  the object of data taht's going tosend to this route.
  //inorder for this to work request stop body.
  //we have to initialize the middleware for the body parser.in server.js
   const errors = validationResult(req);
   if(!errors.isEmpty()){
     return res.status(400).json({ errors: errors.array() });
     //if does not match details give 400 with some errors 
   }

   //pull name,email,pass from request body
const { name,email,password } = req.body;

try{
//see if user exists
//findOne- return first document in collection that match
let user = await User.findOne({ email });
if(user)
{
return res.status(400).json({ errors: [{msg:'User already exists'}]});
}


//Get users gravatar
const avatar = gravatar.url(email,{
  //s-size
  s:'200',
  //rating
  //pg so that we can't have any naked people or anything
  r: 'pg',
  //mm give (d)default image as user icon
  d:'mm'
})

user = new User({//object
  name,
  email,
  avatar,
  password
  //password is object here
});


//Encrypt password using bycrpt
//create a variable salt to do hashing with
//get promise from bcrypt gensalt
const salt = await bcrypt.genSalt(10);
//hash password
//hash takes plain text password and then salt
user.password = await bcrypt.hash(password,salt);
//save to data base
//anything that returna promise put await in front it
await user.save();

//Return jsonwebtoken bcz when user register in frontend get looged in right away.so to have logged in have token.
//create a payload
  const payload = {
user:{
id: user.id
}
  }
jwt.sign(payload, config.get('jwtSecret'),
{ expiresIn: 36000000000 },
(err, token) => {
  if(err) throw err;
  res.json({ token });
  //inside callback will we get the either an error or token
  //if we get the token or we don't get an error,then we're going to send that token back to the client
});



}
//if error then it give message server error
catch(err)
{
  console.error(err.message);
  res.status(500).send('Server error');
}
});



//export route
module.exports = router;