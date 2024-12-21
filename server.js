const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const PlaceRoutes= require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');
const app = express();
app.use(bodyParser.json());

app.use('/api/places',PlaceRoutes);
app.use('/api/users',usersRoutes)
app.use((req,res,next) =>{
  const error = new HttpError('Could not find this route', 404);
  throw error;
})
app.use((error,req,res,next) =>{
  if(res.headerSent){
    return next(error);
  }
 res.status(error.code || 500)
 res.json({message: error.message || 'An unknown error occured'});

});
mongoose.connect(
  'mongodb+srv://Dharshan:sampathkumar5251@mydbdata.vdkhw43.mongodb.net/locationdb?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true }
)
  .then(() => {
    app.listen(5000);
    console.log("Connected to database and server started!");
  })
  .catch((err) => {
    console.error("Connection failed:", err);
  });
