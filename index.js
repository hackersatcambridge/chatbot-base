const express = require('express');
const bodyParser = require('body-parser');
const utils = require('./utils');

const app = express();

app.use(bodyParser.json());

// Let's make a chatbot!

app.listen(3000, () => {
  console.log('Server is ready to go');
});
