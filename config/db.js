//bring mongoose which are actually using to connect
const mongoose = require('mongoose');

//then we want to grab that string which we put inside default json so bring in config package
const config = require('config');
const User = require('../models/User');

//to get that value in default json
//in variable db get value of mongoURI
const db = config.get('mongoURI');

//so now to connect to mongoDB we can use Mongoose,Dot connect and pass db value in it
//and this will give us back a promise
// we can use dot catch syntax but we are using sync await.
//mongoose.connect(db);
//whenever we are using async await wrap in try block.   
//create  asyncronous arrow function wrap it in try catch block see if there is any kind of error and we are not able to connect as it fail it show's error message.
//in mongoose.connect will give promise so put await here in async func so that we can wait for that
const connectDB = async () => {
  try{
await mongoose.connect(db,
      process.env.RESTREVIEWS_DB_URI,
    {
      maxPoolSize:50,
      wtimeoutMS:2500,
      useNewUrlParser:true
    });
    console.log('MongoDB connected...')
  }
  catch(err)
  {
    //if something goes wrong
console.error(err.message);
//escape from the process that fails is done by process.exit or exit process with failure.
process.exit(1);
  }
}

// export this
module.exports = connectDB;