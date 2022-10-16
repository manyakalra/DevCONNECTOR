//bring mongoose
const mongoose = require('mongoose');

//create schema
//create variable called userschema set that to new mongoose.schema that's going to take in an object with all the fields that we want
const UserSchema = new mongoose.Schema({
  //name field with string type
name: {
  type: String,
  required: true
},
 email: {
   type: String,
   required: true,
   unique: true//one user can't register with same email
 },
password: {
  type: String,
  required: true
},
//attach profile image
avatar: {
  type: String
},
date: {
  type: Date,
  default: Date.now
}
});

module.exports = User = mongoose.model('user',UserSchema);