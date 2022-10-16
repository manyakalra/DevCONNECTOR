//bring express
const express = require('express');
//bring router
const router = express.Router();
//bring express validator
const { check, validationResult } = require('express-validator');
//bring auth middleware
const auth = require('../../middleware/auth');
//bring post model
const Post = require('../../models/Post');
//bring profile model
const Profile = require('../../models/Profile');
//bring user model
const User = require('../../models/User');




//create ADD POST ROUTER

//@route Post api/posts
//@des Create a post
//@access Private
router.post('/',[
auth,[
check('text','Text is required').not().isEmpty()
  ]
],
 async (req,res) => {
const errors = validationResult(req);
//check errors
if(!errors.isEmpty()){
  return res.status(400).json({ errors: errors.array() });
}
//trycatch
try {
  //find user by id
const user = await User.findById(req.user.id).select('-password');


// create new object for newPost having text name etc fields
const newPost = new Post({
  text: req.body.text,
  name: user.name,
  avatar: user.avatar,
  user: req.user.id
});
//create variable called post
// save
const post = await newPost.save();
res.json(post);

} catch (err) {
  console.error(err.message);
  res.status(500).send('Server Error');
}


});


//GET AND DELETE POSTS


//GET ALL POSTS
//@route Get api/posts
//@des Get all posts
//@access Private
router.get('/',auth,async(req,res)=>{
try {
  //sort by date in descending order
  const posts = await Post.find().sort({date: -1});
  res.json(posts);
} catch (err) {
  console.error(err.message);
  res.status(500).send('Server Error');
}
});



//GET SINGLE POST
//@route Get api/posts/:id
//@des Get post by ID
//@access Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
//check if post there or not with that id
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
if(err.kind === 'ObjectId'){
  return res.status(404).json({ msg: 'Post not found' });
}
    res.status(500).send('Server Error');
  }
});




//DELETE A POST
//@route DELETE api/posts/:id
//@des delete a posts
//@access Private
router.delete('/:id',auth,async(req,res)=>{
  try {
    const post = await Post.findById(req.params.id);
    if(!post){
      return res.status(404).json({ msg: 'Post not found' });
    }
    //check user wheather the owner of the post delete it
    //req.user.id is string and this.post.user is method so to match it use toString()
    if(post.user.toString() !== req.user.id) {

      return res.status(401).json({msg: 'User not authorized'});
    }
    await post.remove();
    res.json({msg: 'Post removed'});
  } catch (err) {
    console.error(err.message);
    if(err.kind === 'ObjectId'){
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
  });




  //POST LIKES
  //PUT REQUEST updating post
  //@route PUT api/posts/like/:id
  //@desc  like a post
  //@access Private
  router.put('/like/:id',auth,async(req,res) => {
try {
  const post = await Post.findById(req.params.id);

  //check if the post has already been liked
  //done by filter-highorder array method
  //likes-array
  //comparethe current iteration ie current user to the user that's logged in
  //turn it into string so used toString
  //length>0 means aleardy been liked
if(post.likes.filter(like => like.user.toString() == req.user.id).length > 0){
//if true return 
return res.status(400).json({msg: 'Post already liked'});
}
post.likes.unshift({user: req.user.id});
//save
await post.save();
res.json(post.likes);

} catch (err) {
  console.error(err.message);
  res.status(500).send('Server Error');
  
}
  }); 





  //POST UNLIKES
  //PUT REQUEST updating post
  //@route PUT api/posts/unlike/:id
  //@desc  unlike a post
  //@access Private
  router.put('/unlike/:id',auth,async(req,res) => {
    try {
      const post = await Post.findById(req.params.id);
      //check if the post has already been liked
      //done by filter-highorder array method
      //likes-array
      //comparethe current iteration ie current user to the user that's logged in
      //turn it into string so used toString
      //length>0 means aleardy been liked
    if(post.likes.filter(like => like.user.toString() == req.user.id).length === 0){
    //if true return 
    return res.status(400).json({msg: 'Post has not yet been liked'});
    }
  //Get remove index
const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
post.likes.splice(removeIndex, 1);


    //save
    await post.save();
    res.json(post.likes);
    
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
      
    }
      }); 






       

//create ADD AND REMOVE COMMENTS  ROUTE

//@route Post api/posts/comments/:id
//@des Comment on a post
//@access Private
// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
router.post(
  '/comment/:id',
  [
  auth,
  [

  check('text', 'Text is required').not().isEmpty(),
  ]
],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);



//DELETE COMMENT
//@route DELETE api/posts/comment/:id/:comment_id
//@desc Delete comment
//@access Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }
    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
//Get remove index
const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
post.comments.splice(removeIndex, 1);
    await post.save();

    return res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});




//export router
module.exports = router;

