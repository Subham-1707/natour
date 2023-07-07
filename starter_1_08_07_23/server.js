const dotenv  =require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const app = require('./app');
const port = process.env.PORT || 3000;

// mongoose.connect(
//   `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority`, 
//   {
//     useNewUrlParser: true,
//     useFindAndModify: false,
//     useUnifiedTopology: true
//   }
// );

mongoose.connect(process.env.DB_CONNECT,{ useNewUrlParser: true })
.then((response)=>{
    console.log("Database is connected successfully");
}).catch((error)=>{
      console.log("sorry, not connected to db");
      // console.log("error",error);
});

app.listen(port, () => {
  console.log(`app is runing on port ${port} ...`);
});
