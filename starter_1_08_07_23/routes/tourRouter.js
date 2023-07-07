const express = require('express');
const tourController = require('./../controllers/tourController');
const router = express.Router();

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getALLTours);

router
  .route('/')
  .get(tourController.getALLTours)
  .post(tourController.createTour); //checkbody is middleware

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
