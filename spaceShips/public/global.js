const url = "http://localhost:5000/";
//const url = "https://mighty-eyrie-58006.herokuapp.com/"

let localStorage;
let me;

if (!localStorage) {
  localStorage = window.localStorage;
}

let jwtToken = localStorage.getItem("Authorization");

if (jwtToken || window.location.href === url) {
} else {
  window.location.replace(url);
}

