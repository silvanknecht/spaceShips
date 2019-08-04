let nickname;
let changeNicknameB;
let joinTeamDeathMatch;
let joinFreeForAll;
let joinGame;
let logout;

(async () => {
  nickname = document.getElementById("nickname");
  changeNicknameB = document.getElementById("changeNicknameB");
  try {
    let data = await getMe();
    if (data.status !== 200) {
      console.log(data.statusText);
      localStorage.removeItem("Authorization");
      window.location.replace(url);
    }
    let jsonData = await data.json();
    nickname.value = jsonData.nickname;
  } catch (error) {
    console.error("Error during user authentication!", error);
  }
  joinTeamDeathMatch = document.getElementById("joinTeamDeathMatch");
  joinFreeForAll = document.getElementById("joinFreeForAll");

  logout = document.getElementById("logout");

  getShips();
  joinTeamDeathMatch.addEventListener("click", () => {
    window.location.href = url + "game/teamdeathmatch";
  });
  joinFreeForAll.addEventListener("click", () => {
    window.location.href = url + "game/freeforall";
  });
  logout.addEventListener("click", () => {
    localStorage.removeItem("Authorization");
    window.location.href = url;
  });

  changeNicknameB.addEventListener("click", async () => {
    try {
      await fetch(url + "api/v1/users/nickname", {
        method: "PUT",
        body: JSON.stringify({ nickname: nickname.value }),
        headers: {
          "Content-Type": "application/json",
          Authorization: jwtToken,
          "X-Frame-Options": "deny",
          "X-XSS-Protection": 1
        }
      });
    } catch (error) {
      console.trace(error);
    }
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
