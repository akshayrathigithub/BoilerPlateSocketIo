const teacher = document.getElementById("teacher-btn");
const student = document.getElementById("student-btn");
const portfolio = document.getElementById("portfolio-link");
const githubLink = document.getElementById("github-link");
const githubUrl = "https://github.com/akshayrathigithub/BoilerPlateSocketIo";
const portfolioLink = "https://akshayrathi.com/";
const BACKEND_API_URL = "https://backend.akshayrathi.com";

const portfolioClicked = () => {
  window.open(portfolioLink, "_blank");
};

const githubClicked = () => {
  window.open(githubUrl, "_blank");
};

const fetchData = async () => {
  const query = "/analytics?moduleName=SOCKET_PROJECT";
  const url = BACKEND_API_URL + query;
  const response = await fetch(url);
  const data = await response.json();
};

portfolio.addEventListener("click", portfolioClicked);
githubLink.addEventListener("click", githubClicked);
// api call
fetchData();
