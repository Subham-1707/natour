const mongoose = require("mongoose");
const validator = require("validator");
const slugify = require('slugify');
const tourSchema = new mongoose.Schema({
    name:{
         type:String,
         required:[true,'A tour must have a name'],
         unique:true,
         trim:true,
    },
    slug: String,
    duration:{
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize:{
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty:{
        type: String,
        required: [true, 'A tour must have a difficulty']
    },
    ratingsAverage:{
        type:Number,
        default: 4.5
    },
    ratingsQuantity:{
        type:Number,
        default: 0
    },
    price:{
        type:Number,
        required:[true,"Price is required"]
    },
    priceDiscount: Number,
    summary:{
        type : String,
        trim: true
    },
    description:{
        type: String,
        trim:true
    },
    imageCover:{
        type: String,
        required:[true, 'A tour must have a cover Image']
    },
    images:[String],
    createAt:{
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates:[Date],  
    secrectTour: {
         type: Boolean,
         default : false,
    }
 },
    {
        toJSON: {virtuals : true},
        toObject: {virtuals : true}
    }
);

// virtula in mongoose:
tourSchema.virtual('durationWeeks').get(function() {
       return this.duration / 7;
});

// 1) DOCUMENT MIDDLEWARE: RUNS BEFORE .save() and .create() event only.
tourSchema.pre('save', function(next){
    // console.log(this); // point to the current document.
    this.slug  = slugify(this.name, {lower: true});
    next();
});
// tourSchema.pre('save', function(next){
//     // console.log(this); // point to the current document.
//     console.log('coming from second pre middleware');
//     next();
// });

// tourSchema.post('save', function(doc,next){
//     // console.log(this); //post doesn't have this , it has finished document
//     // console.log(doc);
//     next();
// })

// 2) Query middleware in mongoose:
tourSchema.pre(/^find/, function(next){
// tourSchema.pre('find', function(next){
    //   console.log(this); //this point to the current query object
      this.find({secrectTour: {$ne:true}});
     next();
})
// tourSchema.pre('findOne', function(next){
//     this.find({secrectTour: {$ne:true}});
//     next();
// })


// 3) AGGREATION MIDDLEWARE:
 tourSchema.pre('aggregate', function(next){
//  console.log(this.pipeline());
    this.pipeline().unshift({$match: {secrectTour: {$ne: true}}});    
   next();
 });
const Tour = mongoose.model("Tour",tourSchema);
module.exports = Tour;

