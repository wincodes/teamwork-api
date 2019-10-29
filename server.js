const express = require('express');
const bodyParser = require('body-parser');

//initialize express
const app = express();

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//setup the port
const port = process.env.PORT || 7000;

app.get('/api/v1', (req, res) => {
  res.json('Hello World')
});

//start the server
app.listen(port, () => console.log(`server started at Port ${port}`));