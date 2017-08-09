var express = require('express');
var path = require('path');

var app = express();

var server = app.listen(3000, function() {
  console.log("Express server has started on port 3000.");
});

app.use('/', express.static(path.join(__dirname, './')));

app.get('/', function(req, res) {
  res.render('index');
})
