
const fs = require('fs');
const express = require('express');
const { error } = require('console');
const app = express();
const port = 3000;
 
app.use(express.json());
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);
app.get('/api/v1/tours', (req, res) => {  // get handler
   res.status(200).json({
         status: 'success',
         result : tours.length,
         data : {
             tours
         }
   })
})

app.post("/api/v1/tours",(req, res)=>{
   const new_id = tours[tours.length -1].id+1;
   const newTour = Object.assign({id:new_id },req.body);
   tours.push(newTour);
   fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours),error =>{
       res.status(201).json({
          status : 'success',
          data:{
              tours: newTour
          }
       });
   });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})