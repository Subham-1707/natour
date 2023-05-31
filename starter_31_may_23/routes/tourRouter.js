const express = require('express');
const tourController = require('./../controllers/tourController');
// const {getALLTours,getTour} = require('./../controllers/tourController'); // we can also do it.
const router = express.Router();
// param Middleware:
router.param('id', tourController.checkID);

router
  .route('/')
  .get(tourController.getALLTours)
  .post(tourController.checkBody, tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
