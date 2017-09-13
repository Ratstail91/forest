var express = require('express');
var app = express();
var http = require('http').Server(app);
var fs = require('fs');

app.use('/audio/styles', express.static(__dirname + '/styles'));

app.get('/audio', function(req, res) {
  res.sendFile(__dirname + '/index.html');
  console.log("a user connected to /audio");
});

app.get('/music', function(req, res) {
  var fileID = req.query.id;
  console.log("Query for: " + fileID);

  var file = __dirname + '/music/' + fileID;
  fs.exists(file, function(exists) {
    if (exists) {
      var stream = fs.createReadStream(file);
      stream.pipe(res);
    }
    else {
      res.write('404 - file not found');
      res.end();
    }
  });
});

http.listen(3000, function() {
  console.log('listening to *:3000');
});
