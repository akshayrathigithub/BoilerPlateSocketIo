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
const secretCodeCopyText = document.getElementById("secret-code-copy");
const joiningLinkCopyText = document.getElementById("joining-link-copy");
const secretCodeCopyTextDashboard = document.getElementById(
  "secret-code-copy-dashboard"
);
const joiningLinkCopyTextDashboard = document.getElementById(
  "joining-link-copy-dashboard"
);
const studentUrl = "https://projects.akshayrathi.com/socket-io-app/student";
const continueBtn = document.querySelector(".continue-btn");
const popupWrapper = document.getElementById("PopUpWrapper");
const totalActiveStudentTag = document.getElementById("totalActiveStudents");
const dashboardWrapper = document.querySelector(".wrapper");
let totalActiveStudents = 0;

// set secret code
secretCodeCopyText.querySelector("input.text").value = RoomId;
secretCodeCopyTextDashboard.querySelector("input.text").value = RoomId;

// set joining link
joiningLinkCopyText.querySelector("input.text").value = studentUrl;
joiningLinkCopyTextDashboard.querySelector("input.text").value = studentUrl;

const copyTextToClipboard = (parent) => {
  const input = parent.querySelector("input.text");
  input.select();
  document.execCommand("copy");
  parent.classList.add("active");
  window.getSelection().removeAllRanges();
  setTimeout(function () {
    parent.classList.remove("active");
  }, 2500);
};

secretCodeCopyText
  .querySelector("button")
  .addEventListener("click", function () {
    copyTextToClipboard(secretCodeCopyText);
  });

joiningLinkCopyText
  .querySelector("button")
  .addEventListener("click", function () {
    copyTextToClipboard(joiningLinkCopyText);
  });

secretCodeCopyTextDashboard
  .querySelector("button")
  .addEventListener("click", function () {
    copyTextToClipboard(secretCodeCopyTextDashboard);
  });

joiningLinkCopyTextDashboard
  .querySelector("button")
  .addEventListener("click", function () {
    copyTextToClipboard(joiningLinkCopyTextDashboard);
  });

// on continue button click
continueBtn.addEventListener("click", () => {
  popupWrapper.style.display = "none";
  dashboardWrapper.style.display = "block";
});

// hide dashboard content wrapper
dashboardWrapper.style.display = "none";

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

/* Teacher creates a room with id */
Socket.emit("TeacherCreatesNewRoom", RoomId);

/* Notifying teacher that a user has joined the server */
Socket.on("NotifyStudentNameToTeacher", (data) => {
  totalActiveStudents += 1;
  totalActiveStudentTag.innerHTML = totalActiveStudents;
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

/* Notifying teacher that a student has left the server */

Socket.on("DisconnectedFromServer", (data) => {
  totalActiveStudents -= 1;
  totalActiveStudentTag.innerHTML = totalActiveStudents;
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
