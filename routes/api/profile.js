//bring express router
const express = require('express');

//bring request package
const request = require('request');
//bring config
const config = require('config');


//to use express router,we want to create a variable called router and we want to set that to express dot capital,our router like that.
const router = express.Router();

//bring auth
const auth = require('../../middleware/auth');




//bring express validator
const { check, validationResult } = require('express-validator');

//bring models profile
const Profile = require('../../models/Profile');
//bring user model
const User = require('../../models/User');


//GET CURRENT PROFILE

//get router request
//callback using arrow function with request response
//then to send response set it res.send
//request type- @route GET api/profile'me
//@description what route does- get current users profile
//@access vale- Private
//whatever routes we want to protect we add second parameter to do so.
router.get('/me', auth, async (req, res) => {
  //use async wait because we are using mongoose and returning promise
  try {
    //find first user id
    //set user id that comes in with 
    //populate this with the name of user and avatar stored as array
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);

 //check to see no profile
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
//send along profile
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


//CREATE AND UPDATE PROFILE ROUTES
// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post(
  '/',
  [
  auth,
  [
  check('status', 'Status is required').notEmpty(),
  check('skills', 'Skills is required').notEmpty(),
  ]
],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
//pulling all these fields out
    // destructure the request
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
      // spread the rest of the fields we don't need to check
    } = req.body;

    // build a profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills){
      //profilefield set as an array then .split to split by comma as separate or delimiter then trim
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    //Build social object
     profileFields.social = {}
    //check
if(youtube) profileFields.social.youtube = youtube;
if(twitter) profileFields.social.twitter = twitter;
if(facebook) profileFields.social.facebook = facebook;
if(linkedin) profileFields.social.linkedin = linkedin;
if(instagram) profileFields.social.instagram = instagram;
    try{
      //find the first user with id
      let profile = await Profile.findOne({user: req.user.id});
      if(profile){
        //if finds the profile update it
        //update
        profile = await Profile.findOneAndUpdate(
          //find the user with request user id
          {user: req.user.id },
          //set profile fields mongo method
          { $set: profileFields},
          { new: true}
        );
        return res.json(profile);
      }
      //if profile is not found
      //Create Profile
      profile = new Profile(profileFields);
    //save profile
    await profile.save();
      //return profile
      res.json(profile);

    }
    //if does not find user display error msg
    catch(err)
{
console.error(err.message);
res.status(500).send('Server Error');
}  
}
);


//To GET ALL PROFILES AND PROFILE BY USERID
//@route GET api/profile
//@des GET all profiles
//@access Public
router.get('/', async(req, res) =>{
  try {
    //create variable profiles
    //get it using await profile.find() method
  // also add name and avatar part of user model
  const profiles = await Profile.find().populate('user',['name','avatar']);
  res.json(profiles);
  } 
  //if does not find user display error msg
  catch (error) {
    console.error(err.message);
  res.status(500).send('Server Error');
  }
  });



//GET PROFILE BY USERID
  //@route GET api/profile/user/:user_id
//@des GET profile by user id
//@access Public
router.get('/user/:user_id', async(req, res) =>{
  try {
    //create variable profiles
    //get it using await profile.find() method
  // also add name and avatar part of user model
  const profile = await Profile.findOne({ user: req.params.user_id}).populate('user',['name','avatar']);

  //check profile
if(!profile)
return res.status(400).json({msg:'Profile not found'});
  res.json(profile);
  } 
  //if does not find user display error msg
  catch (err) {
    console.error(err.message);
    //check for certain error
    //kind method
    if(err.kind == 'ObjectId'){
      return res.status(400).json({ msg:'Profile not found' });
    }
  res.status(500).send('Server Error');
  }
  });



  //DELETE PROFILE AND USER COMPLETELY
//@route DELETE api/profile
//@des  Delete profile,user & posts
//@access Public
router.delete('/', auth, async(req, res) =>{
  try {
    //remove profile
    //@todo- remove users posts
  await Profile.findOneAndRemove({ user: req.user.id });
  await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: 'User deleted'});
  } 
  //if does not find user display error msg
  catch (error) {
    console.error(err.message);
  res.status(500).send('Server Error');
  }
  });





  //ADD PROFILE EXPERIENCE
  // @route   PUT api/profile/experience
// @desc    Add experience to profile
// @access  Private
 //auth is middleware here
 
 router.put('/experience',[auth,[
   check('title','Title is required')
   .not()
   .isEmpty(),
   check('company','Company is required')
   .not()
   .isEmpty(),
   check('from','From date is required')
   .not()
   .isEmpty(),
 ]
],
  async(req,res) =>{
    //check for errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
    }
    //do destructuring and pull out some stuff
    const{
      title,
      company,
      location,
      from,
      to,
      current,
      description
      } = req.body;
      //create a new object here name newExperience
const newExp = {
  title,
  company,
  location,
  from,
  to,
  current,
  description
};
//deal with mongodb try-catch
try {
  const profile = await Profile.findOne({ user: req.user.id });  
  profile.experience.unshift(newExp);
 await profile.save();
 res.json(profile);
} 
catch (err) {
  console.error(err.message);
  res.status(500).send('Server Error');
}

 }
 );




 //DELETE PROFILE EXPERIENCE
 //@route DELETE/api/profile/experience/:exp_id
 //@des Delete experience from profile
 //@access Private
 router.delete('/experience/:exp_id',auth,async(req,res) =>{
try {
  const profile = await Profile.findOne({user: req.user.id });
  //get experience to remove
// so Get remove index
//declare variable name removeIndex
//map through it
// pass an item and return just ID and match it to request 

const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
//splice because we want to take something out and the index inside remove index and we want to take out 1
profile.experience.splice(removeIndex,1);
//save profile
await profile.save();
//sending back response
res.json(profile);
} catch (err) {
  console.error(err.message);
  res.status(500).send('Server Error');
}
 });











//ADD AND DELETE PROFILE EDUCATION

  //ADD PROFILE EDUCATION
  // @route   PUT api/profile/education
// @desc    Add education to profile
// @access  Private
 //auth is middleware here
 
 router.put('/education',[auth,[
  check('school','School is required')
  .not()
  .isEmpty(),
  check('degree','Degree is required')
  .not()
  .isEmpty(),
  check('fieldofstudy','Field of study is required')
  .not()
  .isEmpty(),
  check('from','From date is required')
  .not()
  .isEmpty(),
]
],
 async(req,res) =>{
   //check for errors
   const errors = validationResult(req);
   if(!errors.isEmpty()){
     return res.status(400).json({ errors: errors.array() });
   }
   //do destructuring and pull out some stuff
   const{
     school,
     degree,
     fieldofstudy,
     from,
     to,
     current,
     description
     } = req.body;
     //create a new object here name newExperience
const newEdu = {
  school,
  degree,
  fieldofstudy,
 from,
 to,
 current,
 description
};
//deal with mongodb try-catch
try {
 const profile = await Profile.findOne({ user: req.user.id });  
 profile.education.unshift(newEdu);
await profile.save();
res.json(profile);
} 
catch (err) {
 console.error(err.message);
 res.status(500).send('Server Error');
}

}
);




//DELETE PROFILE EDUCATION
//@route DELETE/api/profile/education/:edu_id
//@des Delete education from profile
//@access Private
router.delete('/education/:edu_id',auth,async(req,res) =>{
try {
 const profile = await Profile.findOne({user: req.user.id });
 //get education to remove
// so Get remove index
//declare variable name removeIndex
//map through it
// pass an item and return just ID and match it to request 

const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
//splice because we want to take something out and the index inside remove index and we want to take out 1
profile.education.splice(removeIndex,1);
//save profile
await profile.save();
//sending back response
res.json(profile);
} catch (err) {
 console.error(err.message);
 res.status(500).send('Server Error');
}
});



//Create route github 
//@route GET api/profile/github/:username
//@desc Get user repos from Github
//@access Public
router.get('/github/:username',(req,res) => {
  try {
    //construct an options object
    const options = {
      //req.params.username - to get username
      //repos-respository
      //sort=created:asc -means sorting in ascending order
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    };
    request(options,(error, response, body) => {
//check errors
if(error)
console.error(error);
//check 200 response
//if not 200 then let's send back a 404 error and profile isn't found
if(response.statusCode !== 200){
  return res.status(404).json({msg: 'No Github profile found'});
}
  //body is not going to it's just basically going to be a regular string with escaped quotes so pass json.parse
  res.json(JSON.parse(body));

    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});






//export route
module.exports = router;