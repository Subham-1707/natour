const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id =>{
       return jwt.sign({id}, process.env.JWT_SECTECT,{
           expiresIn: process.env.JWT_EXPIRES_IN
       })
}

exports.signup = catchAsync(async (req,res, next) =>{
    const newUser = await User.create(req.body);
          // const newUser = await User.create({
          //      name: req.body.name,
          //      email: req.body.email,
          //      password: req.body.password,
          //      passwordConfirm: req.body.passwordConfirm
          // });

 const token = signToken(newUser._id);
    res.status(201).json({
         status : 'success',
         token,
         data: {
              user : newUser
         }
    });
});

exports.login = catchAsync( async(req, res, next) =>{
      const {email, password} = req.body;

      //1) check if email and password exist
          if(!email || !password){
              return  next(new AppError('Please provide email and password', 400));
          }
     // 2) check if uer exists && password is correct
       const user = await User.findOne({email}).select('+password');
       if(!user || !(await user.correctPassword(password, user.password))){
            return next(new AppError('Incorrect email or password', 401))
       }
     // 3) if everything is ok , send token to client

     const token =  signToken(user._id);
     res.status(200).json({
          status: 'success',
          token
     });
});

exports.protect = catchAsync(async(req, res, next)=>{
     //1) Getting token and check of it's there
          let token;
          if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1];
          }
          // console.log('token', token);
          if(!token){
                return next(new AppError('Your are not logged in ! please login', 401));
          }
     //2) verification token
            // verify a token example:
               // jwt.verify(token, 'shhhhh', function(err, decoded) {
               //      console.log(decoded.foo) // bar
               // });

           const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECTECT);
           console.log("decoded",decoded);
     //3) check if user still exists
           const currentUser = await User.findById(decoded.id);
           if(!currentUser){
                return next(new AppError('The User belonging to this token does no longer exist!',401));
           }
     //4) check if user changed password after the token was issued
          if( currentUser.changedPasswordAfter(decoded.iat)){
               return next(new AppError('User recently changed password! Please log in again!', 401));
          }
  
    // GRANT ACCESS TO PROTECTED ROUTE
     req.user = currentUser;
      next();
});