const { v4: uuidv4 } = require('uuid')
const {validationResult}  = require('express-validator');
const HttpError = require('../models/http-error');
const User = require('../models/user.js');
const DUMMY_USERS = [
  {
    id: 'u1',
    name:'Dharshan',
    email:'dharshann2004@gmail.com',
    password: 'sbt5251'
  }
]


const getUsers = async (req,res,next) => {
  let users;
  try{
   users =await User.find({}, '-password');
  }
   catch(err){
const error = new HttpError(
  'Fetching users failed please try again later',500
);
return next(error);
   }
   res.json({users: users.map(user => user.toObject({getters: true}))});

 
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid input passed, please check your data', 432));
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email }); // Use `await` here
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later',
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead',
      422
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: 'https://i.ytimg.com/vi/jbJqhp82-0g/maxresdefault.jpg',
    password,
    places:[]
  }); // Use the `User` Mongoose model to create the user

  try {
    await createdUser.save(); // Save the user to the database
  } catch (err) {
    const error = new HttpError('Sign up failed, please try again', 500);
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};


const login = async (req,res,next) =>{
const{email,password}=  req.body;

let existingUser;
try{
existingUser = await User.findOne({email:email})
}
catch(err){
 const error = new HttpError(
  'Logging in failed please try again later', 500
 );
 return next(error);
}
  if(!existingUser || existingUser.password != password){
    const error = new HttpError(
      'Invalid credentails, could not log you in', 401
    );
    return next(error);
  }
 res.json({message: 'LOGGED IN!'})
};

exports.getUsers=  getUsers;
exports.signup = signup;
exports.login = login;