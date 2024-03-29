const  mongoose  = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please tell us your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm a password'],
        validate: {
            // this only works for create or save to create new user   
            validator: function(el){
                   return el === this.password;
               },
               message :'password are not the same'
        }
    },
    passwordChangedAt: Date,

});

// use pre mongoose middleware for encrypt password:
 userSchema.pre('save', async function(next){
    // only run this function if password was actually modified
    if(!this.isModified('password')) return next();

    //Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    
    // Delete the passwordConfirm field:
    this.passwordConfirm = undefined;
    next();
 });

//  Instance method available to all the documents for certain collection:
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    //    this.password point to current document 's password but in model password is false.so it isn't available
    return await bcrypt.compare(candidatePassword, userPassword);
 
} 

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000,10); //convert millisecond to second.
         return JWTTimestamp < changedTimeStamp; // 100 < 200 but 300 < 200
        }
    return false;
    // False means NOT changed
}

const User = mongoose.model('User',userSchema);
module.exports = User;