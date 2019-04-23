const config = require("config");
const jwt = require("jsonwebtoken");

const User = require("../../../models/user");
const { validateCredentials } = require("../../../models/user");

describe("genreate auth token", () => {
  it("should return a valid authentication token", () => {
    const token = new User().generateAuthToken();
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    expect(decoded.sub).toHaveProperty("_id");
  });
});

describe("validate credentials", () => {
  let payload;
  beforeEach(() => {
    payload = { email: "test.test@test.ch", password: "test" };
  });

  it("should return an error object if the input email was falsy", () => {
    payload.email = "";
    const result = validateCredentials(payload);
    expect(result.error).not.toBeNull();
  });

  it("should return an error object if the input password was falsy", () => {
    payload.password = "";
    const result = validateCredentials(payload);
    expect(result.error).not.toBeNull();
  });

  it("should not return an error object if the input was truly", () => {
    const result = validateCredentials(payload);
    expect(result.error).toBeNull();
  });
});
