var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function(request, response){

});

app.post('/', )


var server = app.listen(3000, function () {
  var port = server.address().port;
  console.log('Smart Shopping listening at http://localhost:%s', port);
});