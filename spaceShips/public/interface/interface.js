let joinGame;
let logout;

(() => {
  joinGame = document.getElementById("joinGame");
  logout = document.getElementById("logout");

  getShips();
  joinGame.addEventListener("click", () => {
    window.location.href = url + "game";
  });
  logout.addEventListener("click", () => {
    localStorage.removeItem("Authorization");
    window.location.href = url;
  });
})();

function getShips() {
  fetch(url + "api/v1/ships/", {
    method: "GET",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwtToken,
      "X-Frame-Options": "deny",
      "X-XSS-Protection": 1
    }
  }).then(data => {
    data.json().then(body => {
      console.log(body);
    });
  });
}
