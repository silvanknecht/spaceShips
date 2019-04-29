(() => {
  getMe();
})();

function getMe() {
  fetch(url + "api/v1/users/me", {
    method: "GET",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwtToken,
      "X-Frame-Options": "deny",
      "X-XSS-Protection": 1
    }
  })
    .then(data => {
      if (data.status !== 200) {
        console.log(data.statusText);
        localStorage.removeItem("Authorization");
        window.location.replace(url);
      } else {
        data.json().then(body => {
          me = body;
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
}
