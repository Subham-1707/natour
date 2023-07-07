const dotenv  =require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./../../models/tourModel');

mongoose.connect(process.env.DB_CONNECT,{ useNewUrlParser: true })
.then((response)=>{
    console.log("Database is connected successfully");
}).catch((error)=>{
      console.log("sorry, not connected to db");
      // console.log("error",error);
});

// Read the Json File:
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// import data into db:
const importData = async ()=>{
     try {
         await Tour.create(tours);
         console.log('Data successfully loaded');
     } catch (error) {
        console.log(err);
     }
     process.exit();
};

// Delete all data from db:
const deleteData = async () =>{
      try {
              await Tour.deleteMany();
              console.log('Data successfully deleted');
      } catch (error) {
         console.log(error);
      }
      process.exit();
}

if(process.argv[2] === '--import'){
    importData();
}else if(process.argv[2] === '--delete'){
      deleteData();
}
// using command line:
console.log(process.argv);
