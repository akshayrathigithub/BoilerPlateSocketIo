const WorkSpace = document.getElementById('WorkSpace')
const Socket = io('http://localhost:4001')
const workspaceinputtag = document.getElementById('INPUT')
const Error = document.getElementById('Error')
workspaceinputtag.value = ''
const Popup = document.getElementById('PopUpWrapper')
let totalwords = 0
let RollNo
let wordsArr = []
let currpara = ''
let prevpara = ''
let ind = 0
let paraLength = 0
let flag = false
let timeflag = true
let initialFlag = true
let Data = {
    status: '',
    Words: 0,
    Characters: 0,
    rollno: 0,
    Wpm: 0
}


const typingStatus = (count) => {
    setTimeout(() => {
        let currwordscount = count
            if (currwordscount !== currpara.length) {
                Data.status = 'Typing...'
                currwordscount = currpara.length
                typingStatus(currwordscount)
            } else if (currwordscount === currpara.length) {
                Data.status = 'Paused...'
                initialFlag = true
            }
            TransferDataToServer(Data)
    }, 700);
}

const TransferDataToServer = (Data) => {
    Socket.emit('ChildToServer', Data)
}
function Main() {
    WorkSpace.style.display = 'none'
    Error.style.display = 'none'

    const RollNoInput = document.getElementById('inputBox')

    RollNoInput.addEventListener('input', () => {
        RollNo = RollNoInput.value
    })
    const Submit = document.getElementById('btnWrapper')
    Submit.addEventListener('click', () => {
        let flag = false
        for (let i = 0; i < RollNo.length; i++) {
            if (RollNo[i].charCodeAt(0) < 58 && RollNo[i].charCodeAt(0) > 47) {
                continue
            } else {
                flag = true
                break
            }
        }
        if (flag) {
            const ErrorWindow = (time = 0) => {
                let Time = time
                setTimeout(() => {
                    if (Time === 20) {
                        Error.style.display = 'none'
                    } else {
                        Error.style.display = 'flex'
                        ErrorWindow(Time + 1)
                    }
                }, 200);
            }
            ErrorWindow()
        } else {
            Popup.style.display = 'none'
            WorkSpace.style.display = 'initial'
            Data.rollno = RollNo
        }
    })

    workspaceinputtag.addEventListener('input', () => {
        if (timeflag) {
            Data.Wpm = (new Date() / 1000).toFixed(0)
            timeflag = false
        }
        currpara = workspaceinputtag.value
        if (currpara.length > prevpara.length) {
            ind = ind + 1
        }
        if(initialFlag){
            typingStatus(currpara.length)
            initialFlag = false
        }
        paraLength = currpara.length
        flag = true
        prevpara = workspaceinputtag.value
        Data.Characters = currpara
        TransferDataToServer(Data)
    })

    workspaceinputtag.addEventListener('keydown', (e) => {
        if (e.keyCode === 32 || e.keyCode === 13) {
            let word = currpara.slice(paraLength - ind, paraLength)
            wordsArr.push(word)
            ind = 0
            flag = false
            Data.Words = wordsArr.length
            TransferDataToServer(Data)
        } else if (e.keyCode === 8) {
            if (flag && ind > 0) {
                ind = ind - 1
            }
        }
    })
}

Main()






