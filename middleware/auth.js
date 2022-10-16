//bring jwt
const jwt = require('jsonwebtoken');
//bring config
const config = require('config');

//export middleware function taking request,response &next
//middleware function is basically just a function that has access to the request
//next is callback that we have to run once we are done
//moves on to the next place of middleware

module.exports = function(req,res,next){
//get token from the header
//create a variable token
//we get it with  requests because we have access to request object,which has a header property.
const token = req.header('x-auth-token');
//x-auth-token is header key that we want to send along,that we want to send token in.

//check if no token
if(!token)
{
  return res.status(401).json({mssg: 'No token, authorization denied'});
}

//Verify token
try{
  //decode the token
  const decoded = jwt.verify(token, config.get('jwtSecret'));

  //request object and assign value to user
  //set decoded value which has user in playload attach with user id in playload
  req.user = decoded.user;
  
//call next
  next();
}
//catch will run if token not valid
catch(err){
  res.status(401).json({msg:'Token is not valid'});
    
}
}