/* getting instance of workspace */
const WorkSpace = document.getElementById("WorkSpace");
/* getting instance of socketIO */
const Socket = io("http://localhost:4001");
/* getting instance of input */
const workspaceinputtag = document.getElementById("INPUT");
// gettng ref for name input and secret code input
const nameInput = document.getElementById("name-input");
const secretCodeInput = document.getElementById("secret-code-input");
// ref for error span
const nameInputError = document.getElementById("name-input-error");
const secretCodeInputError = document.getElementById("secret-input-error");
/* clearing workspace on initial start */
workspaceinputtag.value = "";
/* getting instance of Popup */
const Popup = document.getElementById("PopUpWrapper");
let totalwords = 0;
let secretCode = "";

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
    Id: secretCode,
  });
};
function Main() {
  WorkSpace.style.display = "none";
  nameInputError.style.display = "none";
  secretCodeInputError.style.display = "none";
  // set initial value as null in inputs
  nameInput.value = "";
  secretCodeInput.value = "";

  let studentName;
  // receiving name of studen
  nameInput.addEventListener("input", () => {
    studentName = nameInput.value;
  });

  // receiving secret code of student
  secretCodeInput.addEventListener("input", () => {
    secretCode = secretCodeInput.value;
  });

  const submitBtn = document.querySelector(".submit-btn");
  submitBtn.addEventListener("click", () => {
    nameInputError.style.display = "none";
    secretCodeInputError.style.display = "none";
    // checking if name is empty
    if (studentName === "") {
      nameInputError.style.display = "block";
      return;
    }
    // checking if secret code is empty
    if (secretCode === "") {
      secretCodeInputError.style.display = "block";
      return;
    }

    Socket.emit("StudentJoinsRoom", {
      RoomId: parseInt(secretCode),
      name: studentName,
    });

    Socket.on("NotifyStudentOnSuccessfulJoin", () => {
      Popup.style.display = "none";
      WorkSpace.style.display = "initial";
      Data.rollno = studentName;
    });

    Socket.on("RoomDoesNotExist", () => {
      secretCodeInputError.style.display = "block";
    });
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
