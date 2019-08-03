(async () => {
  try {
    let data = await getMe();
    if (data.status !== 200) {
      console.log(data.statusText);
      localStorage.removeItem("Authorization");
      window.location.replace(url);
    }
  } catch (error) {
    console.log(error);
  }
})();

function getMe() {
  return fetch(url + "api/v1/users/me", {
    method: "GET",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwtToken,
      "X-Frame-Options": "deny",
      "X-XSS-Protection": 1
    }
  });
}
