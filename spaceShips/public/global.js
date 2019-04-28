const url = "http://localhost:5000/";
let localStorage;

if(!localStorage){
    localStorage = window.localStorage;
}

let jwtToken = localStorage.getItem("Authorization");

if (jwtToken || window.location.href === url) {
} else {
  window.location.replace(url);
}
