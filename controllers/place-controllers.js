const { v4: uuidv4 } = require('uuid'); // Correct import for uuid v4

const {validationResult} = require('express-validator');
const mongoose= require('mongoose');
const HttpError =  require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Places = require('../models/place');
const User= require('../models/user');


const getPlaceById = async (req,res,next) =>{
  const placeId = req.params.pid;
  let place;
   try{
      place = await Places.findById(placeId);

   }
   catch(err){
    const error = new HttpError(
      'Something went wrong, could not find a place.',500
    );
   return next(error);
  }

  if(!place){
   const error  = new HttpError('Could not find a place for provided id', 404);
    return next(error);

  }
  res.json({place:place.toObject({getters: true})});
};

const getPlaceByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userwithplaces;
  try {
    userwithplaces = await User.findById(userId).populate('places');
  } catch (err) {
    const error = new HttpError(
      'Fetching places failed, please try again later.',
      500
    );
    return next(error);
  }

  if (!userwithplaces || userwithplaces.places.length === 0) {
    return next(
      new HttpError('Could not find places for the provided user ID.', 404)
    );
  }

  res.json({
    places: userwithplaces.places.map(place =>
      place.toObject({ getters: true })
    ),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data', 422));
  }

  let { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Places({
    title,
    description,
    address,
    location: coordinates,
    image: 'https://i.ytimg.com/vi/jbJqhp82-0g/maxresdefault.jpg',
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided creator ID', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession(); // Start the session
    sess.startTransaction(); // Start the transaction
    await createdPlace.save({ session: sess }); // Save the place within the session
    user.places.push(createdPlace); // Add the created place to the user's places
    await user.save({ session: sess }); // Save the user within the session
    await sess.commitTransaction(); // Commit the transaction
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again', 500);
    return next(error);
  }

  res.status(201).json({
    place: createdPlace.toObject({ getters: true }),
  });
};


const updatePlaceById =  async (req,res,next) =>{

  const errors=validationResult(req);
  if(!errors.isEmpty()){
    return next(new HttpError('Invalid inputs, passed check your data'))
  }

  const{title,description} = req.body;
  const placeId = req.params.pid;
  let place;
  try{
  place = await Places.findById(placeId);
  }
  catch(err){
const error = new HttpError(
  'Something went error, couldnot update place.',
  500
);
return next(error);
  }
  if(!place){
    return next(new HttpError('Could not find a place for provided id',404));

  }
  place.title = title;
  place.description = description;
  try{
   await place.save();
  }
  catch(err){
const error = new HttpError('Something went error',500);
return next(error);
  }
  res.status(200).json({
    place: place.toObject({getter: true})
  })
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Places.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete the place',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find place for this ID.', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    // Delete the place using session
    await place.deleteOne({ session: sess });

    // Remove the reference from the creator's places array
    place.creator.places.pull(place);

    // Save the updated creator document
    await place.creator.save({ session: sess });

    // Commit the transaction
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete the place.',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'Deleted place.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace =  deletePlace;