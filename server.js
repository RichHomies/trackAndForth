var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/'));
app.get('/', function(request, response){
  response.send('./index.html');
});

var server = app.listen(3000, function () {
  var port = server.address().port;
  console.log('Smart Shopping listening at http://localhost:%s', port);
});