const express = require('express')
const http = require('http')
const socketIO = require('socket.io')

// our localhost port
const port = 4001

const app = express()

// our server instance
const server = http.createServer(app)

const io = socketIO(server)

io.on('connection', socket => {
  socket.broadcast.emit("Userconnected", "userConnected")
  console.log('connected')
   socket.on('ChildToServer', (Data) => {
    const currtime = (new Date() / 1000).toFixed(0)
    const WPM = (((Data.Characters.length) * 60) / (5 * (currtime - (Data.Wpm)))).toFixed(0)
    Data.Wpm = WPM
    socket.broadcast.emit("ServerToTeacher", Data)
  })

  socket.on('disconnect', () => {
    console.log("Disconnected")
    socket.broadcast.emit("DisconnectedFromServer","Userdisconnected")
  })
})


server.listen(port, () => console.log(`Listening on port ${port}`))
