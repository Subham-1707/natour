
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
app.use(express.json()); // it parse the body data
app.use(express.urlencoded({extended:true}));
app.use(express.static(`${__dirname}/public`)); //define public folder
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
// 1 middleware
// console.log(process.env.NODE_ENV ); //development
if(process.env.NODE_ENV === "development"){
app.use(morgan('dev')); //return the endpoint url
}

// app.use((req, res, next) => {
//   console.log('Hello from the middleware');
//   next();
// });
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// end middleware

// 2 ROUTING :
  app.use('/api/v1/tours',tourRouter);
  app.use('/api/v1/users',userRouter);

  app.all("*", (req,res,next)=>{
      // res.status(404).json({
      //     status:'fail',
      //     message: `can't find ${req.originalUrl} on this server`
      // })
      // const err = new Error(`can't find ${req.originalUrl} on this server`);
      // err.status = 'fail';
      // err.statusCode = 404;
      // next(err);

       next(new AppError(`can't find ${req.originalUrl} on this server`,404));
    });

  // define Error Handling Middleware:
  app.use(globalErrorHandler);

// 3 START SERVER:
module.exports = app;
