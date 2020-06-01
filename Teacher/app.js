let StudentsArr = []
let i = 0
let y = 0
let flag = false
const Socket = io('http://localhost:4001')
const JoinPop = document.getElementById('JoinPopUp')
const LeftPopUp = document.getElementById('LeftPopUp')
JoinPop.style.display = 'none'
LeftPopUp.style.display = 'none'
const DomUpdate = () => {
    const list = document.querySelector('.table-content')
    while (list.hasChildNodes()) {
        list.removeChild(list.firstChild);
    }
    // sorting in descending order
    StudentsArr.sort(function (a, b) {
        return b.Wpm - a.Wpm;
    });
    

    StudentsArr.forEach(student => {
        const Div = document.createElement('div')
        Div.className = 'table-row'
        Div.innerHTML = `<div class="table-data">${student.rollno}</div><div class="table-data">${student.Words}</div> <div class="table-data">${student.Characters.length}</div><div class="table-data">${student.Wpm}</div> <div class="table-data">${student.status}</div>`
        document.querySelector('.table-content').appendChild(Div)
    })
}

Socket.on('Userconnected',(data)=>{
    console.log("userconnected")
    const JoinPopUpWindow = (time = 0) => {
        let Time = time
        setTimeout(() => {
            if (Time === 20) {
                JoinPop.style.display = 'none'
            } else {
                JoinPop.style.display = 'flex'
                JoinPopUpWindow(Time + 1)
            }
        }, 200);
    }
    JoinPopUpWindow()
})

Socket.on("ServerToTeacher", Data => {
    if (StudentsArr.length === 0) {
        StudentsArr.push(Data)
    }
    while (i < StudentsArr.length) {
        if (StudentsArr[i].rollno === Data.rollno) {
            StudentsArr[i].status = Data.status
            StudentsArr[i].Words = Data.Words
            StudentsArr[i].Characters = Data.Characters
            StudentsArr[i].rollno = Data.rollno
            StudentsArr[i].Wpm = Data.Wpm
            flag = false
            break
        } else {
            flag = true
        }
        i++
    }
    i = 0
    if (flag) {
        // add to array
        StudentsArr.push(Data)
    }
    DomUpdate()
})

Socket.on('DisconnectedFromServer',(data)=>{
    const LeftPopUpWindow = (time = 0) => {
        let Time = time
        setTimeout(() => {
            if (Time === 20) {
                LeftPopUp.style.display = 'none'
            } else {
                LeftPopUp.style.display = 'flex'
                LeftPopUpWindow(Time + 1)
            }
        }, 200);
    }
    LeftPopUpWindow()
})

