//bring mongoose
const mongoose = require('mongoose');

//create a vairable Schema
const Schema = mongoose.Schema;


//create a  variable and pass in an object here
//want post to be connected to the user
const PostSchema = new Schema({
  //create post refer to user
  user: {
    //type of schema
  type: Schema.Types.ObjectId,
  ref: 'users'
  },
  text: {
    type:String,
    required:true
  },
  name: {
    type: String
  },
  avatar: {
    type: String
  },
  //likes in array of user object which has id
  //a single user can only like a ceratin post once,they can't just keep on clicking and keep raising the likes.
  likes: [{
user: {
type: Schema.Types.ObjectId,
ref: 'users'
    }
  }
],
comments: [{
  user: {
type: Schema.Types.ObjectId,
ref: 'users'
  },
  text: {
    type:String,
    required: true
  },
  name:{
    type:String
  },
  avatar: {
    type:String
  },
  date: {
    type: Date,
    default: Date.now
  }
}
],
date: {
  type: Date,
  default: Date.now
}
});

//export post model
module.exports = Post = mongoose.model('post',PostSchema);