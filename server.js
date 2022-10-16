//get express and make it run
const express = require('express');

//get database
const connectDB = require('./config/db');

//initialize are app variable with express
const app = express();

//Connect Database
connectDB();

// Init Middleware
app.use(express.json({extended: false}));




  //get request to slash and put in our call back with request response
  //req,res- request,response
  //res.send-resident send ,which will just send data to the browser 
  app.get('/', (req, res) => res.send('API Running'));

//Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));







//it will look for enivironment variable called port
//And when we deploy to Hiroku, that's where it's going to get the port number. locally running on port 5000
//if there is no environment variable set it will just default to 5000
const PORT = process.env.PORT || 5000;

//we need to take a app variable and we want to listen on port
//inside listen passing port and then just callback so if we want something to happen.
//then in console log put  a template literal and some text
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
