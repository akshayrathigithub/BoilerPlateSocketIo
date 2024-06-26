const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const roomIdList = [];
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

// our localhost port
const port = 4005;

const app = express();

// our server instance
const server = http.createServer(app);

// socketIo instance
const io = socketIO(server);

// Define CSP middleware function
const setCSPHeader = (req, res, next) => {
  // Set Content-Security-Policy header
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' backend.akshayrathi.com fonts.gstatic.com; style-src 'self' fonts.googleapis.com 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
  );
  // Call next middleware function
  next();
};

// Use CSP middleware for all routes
app.use(setCSPHeader);

// Define CORS options
const corsOptions = {
  origin: ['https://akshayrathi.com', 'https://project.akshayrathi.com']
};

// Apply CORS middleware with the defined options
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.start = app.listen = function () {
  return server.listen.apply(server, arguments);
};
const router = express.Router();
const publicPath = path.join(__dirname, "/public");

app.use("/socket-io-app", express.static(publicPath));
app.use(router);

router.get("/socket-io-app", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/Home/index.html"));
});

router.get("/socket-io-app/student", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/Children/index.html"));
});

router.get("/socket-io-app/teacher", (req, res) => {
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
