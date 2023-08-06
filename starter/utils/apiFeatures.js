class APIFeatures{
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }
     // req.query ->> this.queryString; //sort,filer,pagination etck 
    //  queryStr {"difficulty":"easy","price":{"lt":"1500"}}
     // query ->> this.query;  //  find, create, findOneUpdate ,delete

    filter(){
         const queryObj = {...this.queryString}; // shallow copy of req.query object. 
        //  { limit: '5', difficulty: 'easy', price: { lt: '1500' } }
        //  console.log("queryObj>>",queryObj) // queryObj>> {
                                                                    //     sort: '-ratingAverage,-maxGroupSize',
                                                                    //     difficulty: 'easy',
                                                                    //     price: { lt: '1500' }
                                                                    // }
         const excludedFields = ['page','limit','sort','fields'];
         excludedFields.forEach((el)=>{
             delete queryObj[el]
         });
     
         let queryStr = JSON.stringify(queryObj);  
        // let queryStr = JSON.stringify({});  
        // console.log("queryStr",queryStr); //{}
         queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); 
        //  console.log("querystr replace",queryStr); //{"difficulty":"easy","price":{"$lt":"1500"}}
         // let query =  Tour.find(JSON.parse(queryStr));
          this.query.find(JSON.parse(queryStr));
          return this;
    }
    sort(){
           if(this.queryString.sort){
            //  console.log("sorts",this.queryString.sort); //sorts -ratingAverage,-maxGroupSize
             const fields = this.queryString.sort.split(',');
            //  console.log("fileds",fields);
            // fileds [ '-ratingAverage', '-maxGroupSize' ] convert into below by reduce
             //sorted obj { ratingAverage: -1, maxGroupSize: -1 }
             const sortObject = fields.reduce((acc, field) => {
                                   const sortField = field.startsWith('-') ? field.substring(1) : field;
                                   const sortOrder = field.startsWith('-') ? -1 : 1;
                                   acc[sortField] = sortOrder;
                                   return acc;
                               }, {});

        //  console.log("sorted obj",sortObject);
           this.query = this.query.sort(sortObject);
       }else{
             this.query = this.query.sort('-createdAt');
       }
       return this;
    }

    limitFields(){
           if(this.queryString.fields){
             let fields = this.queryString.fields.split(',').join(' ');
            //  console.log("fields",fields) // fields -name -duration 
             this.query = this.query.select(fields); // negative filed excluded from the object.
         } else{
             this.query = this.query.select('-__v');
         }
         return this;
    }
    paginate(){
     const page = this.queryString.page * 1 || 1;
     const limit = this.queryString.limit * 1  || 100;
     const skip = (page - 1) * limit;
     // page=3&limit=10 , 1-10, page 1 , 11-20 ,page 2 , 21-30 ,page 3
     this.query = this.query.skip(skip).limit(limit);
     return this; 
 
    }
}

module.exports = APIFeatures;