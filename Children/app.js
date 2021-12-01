const WorkSpace =
  document.getElementById("WorkSpace"); /* getting instance of workspace */
const Socket = io("http://localhost:4001"); /* getting instance of socketIO */
const workspaceinputtag =
  document.getElementById("INPUT"); /* getting instance of input */
const Error = document.getElementById("Error");
workspaceinputtag.value = ""; /* clearing workspace on initial start */
const Popup =
  document.getElementById("PopUpWrapper"); /* getting instance of Popup */
let totalwords = 0;
let RollNo;
let wordsArr = [];
let currpara = "";
let prevpara = "";
let ind = 0;
let paraLength = 0;
let flag = false;
let timeflag = true;
let initialFlag = true;
let Data = {
  status: "",
  Words: 0,
  Characters: 0,
  rollno: 0,
  Wpm: 0,
};

/* logic to display if user is typing or has paused */

const typingStatus = (count) => {
  setTimeout(() => {
    let currwordscount = count;
    if (currwordscount !== currpara.length) {
      Data.status = "Typing...";
      currwordscount = currpara.length;
      typingStatus(currwordscount);
    } else if (currwordscount === currpara.length) {
      Data.status = "Paused...";
      initialFlag = true;
    }
    TransferDataToServer(Data);
  }, 700);
};

/* Transfer data to server using socketIO */

const TransferDataToServer = (Data) => {
  Socket.emit("RecevingDataFromStudentToServer", {
    Data: Data,
    Id: parseInt(RollNo),
  });
};
function Main() {
  WorkSpace.style.display = "none";
  Error.style.display = "none";

  const RollNoInput = document.getElementById("inputBox");

  // receiving input from user as rollno
  RollNoInput.addEventListener("input", () => {
    RollNo = RollNoInput.value;
  });

  const Submit = document.getElementById("btnWrapper");
  Submit.addEventListener("click", () => {
    let flag = false;

    // checking if entered input contains any character
    for (let i = 0; i < RollNo.length; i++) {
      if (RollNo[i].charCodeAt(0) < 58 && RollNo[i].charCodeAt(0) > 47) {
        continue;
      } else {
        flag = true;
        break;
      }
    }

    // throwing a warning if entered input contains a character
    if (flag) {
      const ErrorWindow = (time = 0) => {
        let Time = time;
        setTimeout(() => {
          if (Time === 20) {
            Error.style.display = "none";
          } else {
            Error.style.display = "flex";
            ErrorWindow(Time + 1);
          }
        }, 200);
      };
      ErrorWindow();
    } else {
      Popup.style.display = "none";
      WorkSpace.style.display = "initial";
      Data.rollno = RollNo;

      Socket.emit("StudentJoinsRoom", {
        RoomId: parseInt(RollNo),
        name: "Akshay",
      });

      Socket.on("NotifyStudent", () => {
        console.log("NotifyStudent");
      });
    }
  });
  // listening to character typed in workspace by children
  workspaceinputtag.addEventListener("input", () => {
    // getting the first time when the user starts typing
    if (timeflag) {
      Data.Wpm = (new Date() / 1000).toFixed(0);
      timeflag = false;
    }
    currpara = workspaceinputtag.value;

    // checking if user is deleting character from the word
    if (currpara.length > prevpara.length) {
      ind = ind + 1;
    }

    // initializing the typing function
    if (initialFlag) {
      typingStatus(currpara.length);
      initialFlag = false;
    }
    paraLength = currpara.length;
    flag = true;
    prevpara = workspaceinputtag.value;
    Data.Characters = currpara;

    // sending data to server through socketIO
    TransferDataToServer(Data);
  });

  /* Logic to determine whether the user is deleting a mistake or has completed typing a word */

  workspaceinputtag.addEventListener("keydown", (e) => {
    // keycode = 32 stands for spacebar and keycode = 13 stands for enter key
    if (e.keyCode === 32 || e.keyCode === 13) {
      let word = currpara.slice(paraLength - ind, paraLength);
      wordsArr.push(word);
      ind = 0;
      flag = false;
      Data.Words = wordsArr.length;
      TransferDataToServer(Data);
    }

    // keycode = 8 stands for backspace
    else if (e.keyCode === 8) {
      if (flag && ind > 0) {
        ind = ind - 1;
      }
    }
  });
}

Main();
