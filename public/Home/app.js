const teacher = document.getElementById("teacher-btn");
const student = document.getElementById("student-btn");
const portfolio = document.getElementById("portfolio-link");
const githubLink = document.getElementById("github-link");
const githubUrl = "https://github.com/akshayrathigithub/BoilerPlateSocketIo";
const portfolioLink = "https://akshayrathi.com/";
const studentUrl = "http://localhost:4001/student";
const teacherUrl = "http://localhost:4001/teacher";

const teacherBtnClicked = () => {
  // window.open(teacherUrl, "_self");
  window.open(teacherUrl, "_blank");
};

const studentBtnClicked = () => {
  window.open(studentUrl, "_blank");
};

const portfolioClicked = () => {
  window.open(portfolioLink, "_blank");
};

const githubClicked = () => {
  window.open(githubUrl, "_blank");
};

teacher.addEventListener("click", teacherBtnClicked);
student.addEventListener("click", studentBtnClicked);
portfolio.addEventListener("click", portfolioClicked);
githubLink.addEventListener("click", githubClicked);
