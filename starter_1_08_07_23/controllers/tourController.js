const Tour = require('./../models/tourModel');

exports.aliasTopTours = (req, res, next) =>{
     req.query.limit = '5';
     req.query.sort = 'price';
     req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
     next();
}

exports.createTour = async (req, res) => {
   try {
          // const newTour = new Tour({});
          // newTour.save();
        const newTour =  await Tour.create(req.body);
        res.status(201).json({
            status:'success',
            data: newTour
        });
   } catch (error) {
    res.status(400).json({
      status:'fail',
      message: error
  });
   }
}


exports.getALLTours = async (req, res) => {
  try {
    // BUILD QUERY:
    // 1 A) FILTERIN:
    const queryObj = {...req.query}; // shallow copy of req.query object.
    console.log("queryObj>>",queryObj)
    const excludedFields = ['page','limit','sort','fields'];
    excludedFields.forEach((el)=>{
         delete queryObj[el]
    });

    // 1 B) ADVANCE FILTERING:
    //   gte,lte,gt,lt (greater than equal,...)
    //  {difficulty:'easy', duration: {gte: '5'}}
     let queryStr = JSON.stringify(queryObj);  // {"difficulty":"easy","duration":{"gte":"10"}}
     console.log("queryStr",queryStr);
     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); 
      // console.log("json pare",JSON.parse(queryStr)); // {difficulty: 'easy', duration: {'$gte': '10'}}
    let query =  Tour.find(JSON.parse(queryStr));
    // or exactly same:
      //  const tours = await Tour.find()
      //               .where('duration').equals(5)
      //               .where('difficulty').equals('easy')
   
    //  2) SORTING:
        if(req.query.sort){
             const fields = req.query.sort.split(',');
             const sortObject = fields.reduce((acc, field) => {
            const sortField = field.startsWith('-') ? field.substring(1) : field;
            const sortOrder = field.startsWith('-') ? -1 : 1;
            acc[sortField] = sortOrder;
            return acc;
          }, {});

          console.log("sorted obj",sortObject);
           query = query.sort(sortObject)
        }else{
             query = query.sort('-createdAt');
        }
     // 3) LIMITING:
        if(req.query.fields){
           let fields = req.query.fields.split(',').join(' ');
           console.log("fields",fields)
           query = query.select(fields);
        } else{
           query = query.select('-__v');
        }
        // console.log("fields>>>> ",query);
      // 4) PAGINATION:
           const page = req.query.page * 1 || 1;
           const limit = req.query.limit * 1  || 100;
           const skip = (page - 1) * limit;
        // page=3&limit=10 , 1-10, page 1 , 11-20 ,page 2 , 21-30 ,page 3
         query = query.skip(skip).limit(limit);

         if(req.query.page){
            const numTours = await Tour.countDocuments();
            if(skip >= numTours){
               throw new Error('This page does not exist');
            }
         }
         console.log("pagination>>>> ",query);

              //  EXECUTE QUERY:
          const tours = await query;
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

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({_id: req.params.id}); same

    // get handler
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
    
  } catch (error) {
       res.status(400).json({
        status: 'fail',
        message: error
       })
  }
}

exports.updateTour = async (req, res) => {
   try {
        const updateTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
              new : true,
              runValidators: true
         });
         res.status(200).json({
          status: 'success',
          data: {
            tour:updateTour,
          },
        });
   } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error
     })
   }
}

exports.deleteTour = async (req, res) => {
  try {
    const deleteTour = await Tour.findByIdAndDelete(req.params.id);
     res.status(200).json({
      status: 'success',
      message:"deleted",
      data: {},
    });
} catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error
    })
}
}
// working with file :
// =========================
// const fs = require('fs');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// // param middleware handler:
// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is : ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid Id',
//     });
//   }
//   next();
// };
// // check tour name and price:
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };

// exports.getALLTours = (req, res) => {
//   // get handler
//   res.status(200).json({
//     status: 'success',
//     requestedAt: req.requestTime,
//     result: tours.length,
//     data: {
//       tours,
//     },
//   });
// };
// exports.getTour = (req, res) => {
//   // get handler id :
//   const id = req.params.id * 1;
//   const tour = tours.find((el) => el.id === id);
//   // convert string no to acutal no.
//   if (!tour) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid Id',
//     });
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// };
// exports.createTour = (req, res) => {
//   const new_id = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: new_id }, req.body);
//   tours.push(newTour);
//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (error) => {
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tours: newTour,
//         },
//       });
//     }
//   );
// };
// exports.updateTour = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: 'updated  tours ...',
//     },
//   });
// };
// exports.deleteTour = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     data: null,
//   });
// };
