const express = require('express')
const http = require('http')
const socketIO = require('socket.io')

// our localhost port
const port = 4001

const app = express()

// our server instance
const server = http.createServer(app)

// socketIo instance
const io = socketIO(server)

// connecting website to socketIo
io.on('connection', socket => {

  // notifying teacher when a student joins the server
  socket.broadcast.emit("Userconnected", "userConnected")

  // receiving data from children
  socket.on('ChildToServer', (Data) => {

    // formula to calculate WPM(words per minute)
    const currtime = (new Date() / 1000).toFixed(0)
    const WPM = (((Data.Characters.length) * 60) / (5 * (currtime - (Data.Wpm)))).toFixed(0)
    Data.Wpm = WPM

    // sending calculated WPM to teacher
    socket.broadcast.emit("ServerToTeacher", Data)
  })
  socket.on('disconnect', () => {
    
    // notifying teacher when a student leaves the server
    socket.broadcast.emit("DisconnectedFromServer", "Userdisconnected")
  })
})

server.listen(port, () => console.log(`Listening on port ${port}`))
