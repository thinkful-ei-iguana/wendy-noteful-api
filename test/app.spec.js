const app = require("../src/app");

describe("App", () => {
  it("GET / responds with 200 containing Add an endpoint", () => {
    return supertest(app)
      .get("/")
      .expect(200, "Add an endpoint");
  });
});
