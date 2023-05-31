// 4 START SERVER:
const app = require('./app');
const port = 3000;
app.listen(port, () => {
  console.log(`app is runing on port ${port} ...`);
});
