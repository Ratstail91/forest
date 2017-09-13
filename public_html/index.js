var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var formidable = require('formidable');
var fs = require('fs');

var musicDir = '/music/';

app.use('/styles', express.static(__dirname + '/styles'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

function audioAll(socket) {
  console.log("sending file list...");

  //update the single client with the names of all files present
  fs.readdir(__dirname + musicDir, function(err, files) {
    socket.emit('audio all', JSON.stringify(files));

    console.log("file list sent");
  });
}

function audioAdd(filename) {
  console.log("sending single file:" + filename);

  //update all clients with the name of a new file
  io.sockets.emit('audio add', JSON.stringify([filename]));

  console.log("file name sent");
}

function audioDel(filename) {
  console.log('deleting file:' + filename);

  if (filename.indexOf('..') != -1) {
    console.log('WARNING: attempted filesystem manipulation detected');
    return;
  }

  //update all clients with the name of a deleted file
  io.sockets.emit('audio del', filename);
  fs.unlink(__dirname + musicDir + filename);

  console.log('file deleted');
}

//handle connections
io.on('connection', function(socket) {
  console.log('a user connected');
  //send that user the song list
  audioAll(socket);

  //prep other components
  socket.on('disconnect', function() {
    console.log('a user disconnected');
  });

  socket.on('delete', audioDel);
  socket.on('play', function(filename) {
    io.sockets.emit('audio play', filename);
  });
});

//handle uploads
app.post('/fileupload', function(req, res) {
  //receive and save the file
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    //move the file to a new location
    var oldpath = files.filetoupload.path;
    var newpath = __dirname + musicDir + encodeURI(files.filetoupload.name);
    fs.rename(oldpath, newpath, function(err) {
      if (err) throw (err);
      res.write('file uploaded!');
      res.end();

      audioAdd(files.filetoupload.name);
    });
  });
});

//NOTE: not musicDir
app.get('/music', function(req, res) {
  var fileID = req.query.id;
  console.log("Query for: " + fileID);

  var file = __dirname + musicDir + fileID;
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