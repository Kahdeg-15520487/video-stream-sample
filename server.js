const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
//const videoJson = require('./videoJson')
const videoJson = require('./videoConfig')
const config = require('./config')
const port = config["port"]
var mountutil = require('linux-mountutils')

// Start Of Actual Code

app.use(express.static(path.join(__dirname, 'public'))) // Define Public as Static
app.engine('pug', require('pug').__express)
app.set("view engine", "pug")
app.set("views", path.join(__dirname, "views"))
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/videoList.html')
})
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
  } 
  else 
  {
    res.sendFile(__dirname + '/public/error.html')
  }
})

app.listen(parseInt(port), function () {
  console.log('Listening on port 8087!')
})