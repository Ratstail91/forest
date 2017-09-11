var express = require('express');
var app = express();
var http = require('http').Server(app);
var formidable = require('formidable');
var fs = require('fs');

app.use('/styles', express.static(__dirname + '/styles'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.post('/fileupload', function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var oldpath = files.filetoupload.path;
    var newpath = __dirname + '/dl/' + files.filetoupload.name;
    fs.rename(oldpath, newpath, function(err) {
      if (err) throw (err);
      res.write('file uploaded!');
      res.end();
    });
  });
});

app.get('/dl', function(req, res) {
  var files = fs.readdirSync('dl');
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Access-Control-Allow-Origin': '*'
  });
  files.forEach(function(f) {
    res.write('<li><a href="http://forest.krgamestudios.com:3001/upload/dl/' + f + '">' + f + '</a></li>');
    app.get('/upload/dl/' + f, function(req, res) {
      var file = __dirname + '/dl/' + f;
      res.download(file);
    });
  });
  res.end();
});

http.listen(3001, function() {
  console.log('listening to *:3001');
});
