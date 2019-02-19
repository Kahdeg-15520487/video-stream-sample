const express = require('express')
const fs = require('fs')
const path = require('path')
const formidable = require('formidable');
const app = express()
//const videoJson = require('./videoJson')
const videoJson = require('./videoConfig')
const config = require('./config')
const port = config["port"]
var mountutil = require('linux-mountutils')
const {
  exec
} = require('child_process');

// Start Of Actual Code

app.use(express.static(path.join(__dirname, 'public'))) // Define Public as Static
app.use(express.static(path.join(__dirname, 'thumbnail')))
app.engine('pug', require('pug').__express)
app.set("view engine", "pug")
app.set("views", path.join(__dirname, "views"))
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/videoList.html')
})
app.get('/refresh/', function (req, res) {
  console.log("refresh");
  exec('dotnet run', (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      console.log("node couldn't execute the command");
      console.log("msg: " + err.message);
      console.log(err.fileName);
      console.log(err.lineNumber);
      return;
    }

    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
  res.redirect('/');
});
// Get Video To Play
app.get('/play/:VIDEO', function (req, res) {
  var videoID = req.params.VIDEO.toString();
  if (videoJson.hasOwnProperty(videoID)) {
    //var path = "/home/clarkhacks/UsbStick/movies" + videoJson[videoID].path // Path To Movies
    var path = videoJson[videoID].path // Path To Movies
    const stat = fs.statSync(path)
    const fileSize = stat.size
    const range = req.headers.range
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1] ?
        parseInt(parts[1], 10) :
        fileSize - 1

      const chunksize = (end - start) +
        1
      const file = fs.createReadStream(path, {
        start,
        end
      })
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4'
      }

      res.writeHead(206, head)
      file.pipe(res)
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4'
      }
      res.writeHead(200, head)
      fs.createReadStream(path).pipe(res)
    }
  } else {
    res.sendFile(__dirname + '/public/error.html')
  }
})

app.get('/upload/', function (req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.write('<form action="upload" method="post" enctype="multipart/form-data">');
  res.write('<input type="file" name="filetoupload"><br>');
  res.write('<input type="submit">');
  res.write('</form>');
  return res.end();
})
app.post('/upload/', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path;
      var newpath = 'E:/Download/Video/' + files.filetoupload.name;
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        res.write('File uploaded and moved!');
        res.end();
      });
    });
})

app.listen(parseInt(port), function () {
  console.log('Listening on port 8087!')
})