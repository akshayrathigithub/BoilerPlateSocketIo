let StudentsArr = [];
let i = 0;
let y = 0;
let flag = false;
const Socket = io("http://localhost:4001");
const JoinPop = document.getElementById("JoinPopUp");
const LeftPopUp = document.getElementById("LeftPopUp");
JoinPop.style.display = "none";
LeftPopUp.style.display = "none";
const RoomId = generateRandomId();

const DomUpdate = () => {
  const list = document.querySelector(".table-content");

  // removing previous entries from table so that new ones can be added
  while (list.hasChildNodes()) {
    list.removeChild(list.firstChild);
  }
  // sorting WPM in descending order
  StudentsArr.sort(function (a, b) {
    return b.Wpm - a.Wpm;
  });

  // adding entries for each children in table Tag
  StudentsArr.forEach((student) => {
    const Div = document.createElement("div");
    Div.className = "table-row";
    Div.innerHTML = `<div class="table-data">${student.rollno}</div><div class="table-data">${student.Words}</div> <div class="table-data">${student.Characters.length}</div><div class="table-data">${student.Wpm}</div> <div class="table-data">${student.status}</div>`;
    document.querySelector(".table-content").appendChild(Div);
  });
};

console.log(RoomId);
/* Teacher creates a room with id */
Socket.emit("TeacherCreatesNewRoom", RoomId);

/* Notifying teacher that a user has joined the server */
Socket.on("NotifyStudentNameToTeacher", (data) => {
  const JoinPopUpWindow = (time = 0) => {
    let Time = time;

    // logic to display popUp for 4seconds
    setTimeout(() => {
      if (Time === 20) {
        JoinPop.style.display = "none";
      } else {
        JoinPop.style.display = "flex";
        JoinPopUpWindow(Time + 1);
      }
    }, 200);
  };
  JoinPopUpWindow();
});

// receiving data from server through socketIO
Socket.on("SendingDataFromServerToTeacher", (Data) => {
  // if receiving the first entry
  if (StudentsArr.length === 0) {
    StudentsArr.push(Data);
  }

  // checking if a entry already exist, if exist, update with recent changes else create new one
  while (i < StudentsArr.length) {
    if (StudentsArr[i].rollno === Data.rollno) {
      StudentsArr[i].status = Data.status;
      StudentsArr[i].Words = Data.Words;
      StudentsArr[i].Characters = Data.Characters;
      StudentsArr[i].rollno = Data.rollno;
      StudentsArr[i].Wpm = Data.Wpm;
      flag = false;
      break;
    } else {
      flag = true;
    }
    i++;
  }
  i = 0;
  if (flag) {
    // add to array
    StudentsArr.push(Data);
  }

  // update Dom with recent changes
  DomUpdate();
});

/* Notifying teacher that a user has left the server */

Socket.on("DisconnectedFromServer", (data) => {
  const LeftPopUpWindow = (time = 0) => {
    let Time = time;
    // logic to display popUp for 4seconds
    setTimeout(() => {
      if (Time === 20) {
        LeftPopUp.style.display = "none";
      } else {
        LeftPopUp.style.display = "flex";
        LeftPopUpWindow(Time + 1);
      }
    }, 200);
  };
  LeftPopUpWindow();
});

function generateRandomId() {
  return Math.floor(Math.random() * 10000000);
}
