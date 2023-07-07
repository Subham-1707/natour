
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
app.use(express.json()); // it parse the body data
app.use(express.urlencoded({extended:true}));
app.use(express.static(`${__dirname}/public`)); //define public folder
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
// 1 middleware
if(process.env.NODE_ENV === "development"){
app.use(morgan('dev')); //return the endpoint url
}

// app.use((req, res, next) => {
//   console.log('Hello from the middleware');
//   next();
// });
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

// end middleware

// 2 ROUTING :
  app.use('/api/v1/tours',tourRouter);
  app.use('/api/v1/users',userRouter);

// 3 START SERVER:
module.exports = app;
