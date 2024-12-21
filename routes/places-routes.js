const express = require('express');
const {check} = require('express-validator');
const router = express.Router();
const placeControllers = require('../controllers/place-controllers');

router.get('/:pid',placeControllers.getPlaceById);

router.get('/user/:uid',placeControllers.getPlaceByUserId)
router.post('/',[
  check('title').not().isEmpty(),check('description').isLength({min: 5}),
  check('address').not().isEmpty()
]
  ,placeControllers.createPlace);
router.patch('/:pid', placeControllers.updatePlaceById);
router.delete('/:pid',placeControllers.deletePlace);
module.exports = router;