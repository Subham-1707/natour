const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

exports.aliasTopTours = (req, res, next) =>{
     req.query.limit = '5';
     req.query.sort = 'price';
     req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
     next();
}


exports.getALLTours = async (req, res) => {
  try {
         //  EXECUTE QUERY:
         const features = new APIFeatures(Tour.find(), req.query)
          .filter()
          .sort()
          .limitFields()
          .paginate();
          const tours = await features.query; // await Tour.find();
              // get handler
            res.status(200).json({
              status: 'success',
              result: tours.length,
              data: {
                tours:tours
              },
            });
    
  } catch (error) {
       res.status(400).json({
        status: 'fail',
        message: error
       })
  }
 
};

// * WORKING FINE WITH TRY CATCH
// exports.createTour = async (req, res) => {
//   try {
//          // const newTour = new Tour({});
//          // newTour.save();
//        const newTour =  await Tour.create(req.body);
//        res.status(201).json({
//            status:'success',
//            data: newTour
//        });
//   } catch (error) {
//    res.status(400).json({
//      status:'fail',
//      message: error
//  });
//   }
// }

// * IMPORTANT CONCEPT* USE THIS getrid of TRY CATCH with handler middleware: 

exports.createTour = catchAsync(async (req, res, next)=> {
        const newTour =  await Tour.create(req.body);
        res.status(201).json({
            status:'success',
            data: newTour
        });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({_id: req.params.id}); same
      if(!tour){
        return next(new AppError(`NO tour found with that ID`,404));
      }
    // get handler
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
});

// using error handler:
exports.updateTour = catchAsync(async (req, res, next) => {
        const updateTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
              new : true,
              runValidators: true
         });
         if(!updateTour){
          return next(new AppError(`NO tour found with that ID`,404));
        }
         res.status(200).json({
          status: 'success',
          data: {
            tour:updateTour,
          },
        });
})
exports.deleteTour =catchAsync( async (req, res, next) => {
      const deleteTour = await Tour.findByIdAndDelete(req.params.id);
      if(!deleteTour){
        return next(new AppError(`NO tour found with that ID`,404));
      }
      res.status(200).json({
        status: 'success',
        message:"deleted",
        data: {},
      });
}
);
exports.getTourStats = async (req,res) =>{
    try {
         const stats = await Tour.aggregate([
            {
               $match: {ratingsAverage : { $gte: 4.5 } }
            },
            {
               $group : {
                   _id : {$toUpper: "$difficulty"},
                    numTours: {$sum: 1},
                    numRatings: {$sum: "$ratingsQuantity"},
                    avgRating: { $avg: "$ratingsAverage"},
                    avgPrice: {$avg: "$price" },
                    minPrice: {$min: "$price"},
                    maxPrice: {$max: "$price"}
               }
            },
            {
               $sort: {avgPrice: -1}
            },
            // {
            //    $match: {_id: {$ne: 'EASY'}}
            // }
         ]);   

         res.status(200).json({
          status: 'success',
          data: {
             stats,
          },
        });

    } catch (error) {
      res.status(400).json({
        status: 'fail',
        message: error
      })
    }
}

exports.getMonthlyPlan = async (req,res)=>{
     try {
            const year = req.params.year * 1; //2021
            const plan = await Tour.aggregate([
            // how many tours in each month of a given year:
                {
                    $unwind: "$startDates",
                },
                {
                    $match : {
                          //  match is use to select document:
                          startDates: {
                              $gte: new Date(`${year}-01-01`),
                              $lte: new Date(`${year}-12-31`),
                          } 
                      }
                },
                {
                    $group: {
                      _id: {$month: "$startDates"},
                      numTourStart: { $sum:1 },
                      tours: {$push: "$name"}
                    }
                },
                {
                  $addFields: {month: "$_id"}
                },
                {
                  $project: {
                      _id:0
                  }
                },
                {
                    $sort: {numTourStart: -1}
                },
                {
                  $limit : 12
                }

            ]);
             
            res.status(200).json({
              status: 'success',
              data: {
                plan,
              },
            });
    
     } catch (error) {
      res.status(400).json({
        status: 'fail',
        message: error
      });
     }
}