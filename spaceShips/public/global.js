const url = window.location.origin + "/";

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
