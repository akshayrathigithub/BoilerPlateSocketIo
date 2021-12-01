const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const roomIdList = [];

// our localhost port
const port = 4001;

const app = express();

// our server instance
const server = http.createServer(app);

// socketIo instance
const io = socketIO(server);

// connecting website to socketIo
io.on("connection", (socket) => {
  // when teacher creates a new room
  socket.on("TeacherCreatesNewRoom", (Id) => {
    roomIdList.push(Id);
    socket.join(Id);
    socket.emit("NewRoomCreated", Id);
  });

  // when students joins a room with id
  socket.on("StudentJoinsRoom", ({ RoomId, name }) => {
    if (roomIdList.includes(RoomId)) {
      socket.join(RoomId);
      socket.emit("NotifyStudent");
      // notifying teacher when a student joins the server
      socket.to(RoomId).emit("NotifyStudentNameToTeacher", name);
    } else {
      socket.to(RoomId).emit("RoomDoesNotExist");
    }
  });

  // receiving data from children
  socket.on("RecevingDataFromStudentToServer", ({ Data, Id }) => {
    // formula to calculate WPM(words per minute)
    const currtime = (new Date() / 1000).toFixed(0);
    const WPM = (
      (Data.Characters.length * 60) /
      (5 * (currtime - Data.Wpm))
    ).toFixed(0);
    Data.Wpm = WPM;

    // sending calculated WPM to teacher
    socket.to(Id).emit("SendingDataFromServerToTeacher", Data);
  });
  socket.on("disconnect", () => {
    // notifying teacher when a student leaves the server
    socket.broadcast.emit("DisconnectedFromServer", "Userdisconnected");
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
