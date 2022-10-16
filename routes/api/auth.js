//bring express router
const express = require('express');


//to use express router,we want to create a variable called router and we want to set that to express dot capital,our router like that.
const router = express.Router();

//bring bcrypt
const bcrypt = require('bcryptjs');

//bring middleware to bring route protected
const auth = require('../../middleware/auth');

//bring jwt
const jwt = require('jsonwebtoken');

//bring config
const config = require('config');

//check validation(name,email,pass correct or not) using express validator
const { check, validationResult } = require('express-validator')

//bring modeluser
const User = require('../../models/User');

//get router request
//callback using arrow function with request response
//then to send response set it res.send
//request type- @route GET api/Auth
//@description what route does- Test route
//@access vale- Public
router.get('/',auth,async(req,res) => {
  //try catch as make a call to database
  try{
    //find user by id and in a request in middleware we set request.user
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  }
  catch(err){
    //something went wrong then
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});



//get router request
//callback using arrow function with request response
//then to send response set it res.send
//request type- @route POST api/auth
//@description what route does- Authenticate user & get token
//@access vale- Public
// so inorder to register user we need name & email, password.
router.post('/',
[
  //check valid email or not
check('email','Please include a valid email').isEmail(),
check('password','Password is required').exists()
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

   //pull email,pass from request body
const { email,password } = req.body;

try{
//see if not user 
//findOne- return first document in collection that match
let user = await User.findOne({ email });
if(!user)
{
return res.status(400).json({ errors: [{msg:'Invalid Credentials'}]});
}


//bcrypt has a method called compare,which take plaintext password in a encrypted password and compare them and tells if it matches or not.
//compare returns a promise
//create varable match
const isMatch = await bcrypt.compare(password,user.password);
if(!isMatch){
  return res.status(400).json({ errors: [{msg:'Invalid Credentials'}]});
}









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