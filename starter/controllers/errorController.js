const AppError = require("../utils/appError");

const handleCastErrorDB = (err) =>{
     const message = `Invalid ${err.path}: ${err.value} `;
     return new AppError(message, 400);
}
const handleDuplicateFieldDB = (err) =>{
     const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
     const message = `Duplicate field value: ${value}. Please use another value`;
     return new AppError(message, 400);
}
const handleValidateErrorDB = (err)=>{
    const  errors = Object.values(err.errors).map(el => el.message)
     const message = `Invalid input Data. ${errors.join('. ')}`;
     return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token, Please log in again!',401);

const handleJWTExpiredError = () => new AppError('Your token has expired!, Please Log in again', 401);

const sendErrorDev = (err, res)=>{
    res.status(err.statusCode).json({
        status: err.status,
        error:err,
        message: err.message,
        stack: err.stack
   });
}
const sendErrorProd = (err, res)=>{
    // Opertational, trusted error: send message to client
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
       });
    //    Progamming or other unknown error: don't leak error details
    }else{
           console.log('ERROR',err);
           res.status(500).json({
              status: 'error',
              message: 'Something went very wrong'
           });
    }
}

// middleware error handling in express:
module.exports = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'   
    
    if(process.env.Node_ENV === 'development'){
        sendErrorDev(err, res);
    }else if(process.env.Node_ENV === 'production'){
        let error = {...err};
        if(error.name === 'CastError')  
           error = handleCastErrorDB(error); 
        if(error.code === 11000) 
           error = handleDuplicateFieldDB(error);
        if(error.name === 'ValidationError') 
           error = handleValidateErrorDB(error);
        if(error.name === 'JsonWebTokenError')
           error = handleJWTError(); 
        if(error.name === 'TokenExpiredError')
           error = handleJWTExpiredError();          
        sendErrorProd(error, res);
    }
   
  };

//   for production start: npm run start:prod