const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const roomIdList = [];
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

// our localhost port
const port = process.env.PORT || 4001;

const app = express();

// our server instance
const server = http.createServer(app);

// socketIo instance
const io = socketIO(server);

app.use(bodyParser.json());
app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.start = app.listen = function () {
  return server.listen.apply(server, arguments);
};
const router = express.Router();
const publicPath = path.join(__dirname, "../public");

app.use(express.static("public"));
app.use(router);

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/Home/index.html"));
});

router.get("/student", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/Children/index.html"));
});

router.get("/teacher", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/Teacher/index.html"));
});

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
      socket.emit("NotifyStudentOnSuccessfulJoin");
      // notifying teacher when a student joins the server
      socket.to(RoomId).emit("NotifyStudentNameToTeacher", name);
    } else {
      // notify student that room does not exist
      socket.emit("RoomDoesNotExist");
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
