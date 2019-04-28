let emailSignUp;
let passwordSignUP;
let emailSignIn;
let passwordSignIn;
let signUpForm;
let signInForm;
let signUpInfo;

(() => {
  emailSignUp = document.getElementById("emailSignUp");
  passwordSignUp = document.getElementById("passwordSignUp");
  emailSignIn = document.getElementById("emailSignIn");
  passwordSignIn = document.getElementById("passwordSignIn");
  signUpForm = document.getElementById("signUpForm");
  signInForm = document.getElementById("signInForm");
  signUpInfo = document.getElementById("signUpInfo");

  if (signInForm.addEventListener) {
    signInForm.addEventListener("submit", signIn, false); //Modern browsers
  } else if (signInForm.attachEvent) {
    signInForm.attachEvent("onsubmit", signIn); //Old IE
  }
  if (signUpForm.addEventListener) {
    signUpForm.addEventListener("submit", signUp, false); //Modern browsers
  } else if (signUpForm.attachEvent) {
    signUpForm.attachEvent("onsubmit", signUp); //Old IE
  }
})();

/** Security  */
function signUp() {
  fetch(url + "api/v1/users/signup", {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
      "X-Frame-Options": "deny",
      "X-XSS-Protection": 1
    },
    body: JSON.stringify({
      email: emailSignUp.value,
      password: passwordSignUp.value
    })
  }).then(data => {
    if (data.status !== 200) {
      data.json().then(body => {
        signUpInfo.innerText = body.message;
      });
    } else {
      data.json().then(body => {
        localStorage.setItem("Authorization", "bearer " + body.token);
        window.location.replace(url + "interface/index.html");
      });
    }
  });
}

function signIn() {
  fetch(url + "api/v1/users/signIn", {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
      "X-Frame-Options": "deny",
      "X-XSS-Protection": 1
    },
    body: JSON.stringify({
      email: emailSignIn.value,
      password: passwordSignIn.value
    })
  }).then(data => {
    if (data.status === 401) {
      signInInfo.innerText = "Email or Password wrong!";
    } else if (data.status !== 200) {
      data.text().then(body => {
        signInInfo.innerText = body.message;
      });
    } else {
      data.json().then(body => {
        localStorage.setItem("Authorization", "bearer " + body.token);
        window.location.replace(url + "interface/index.html");
      });
    }
  });
}
