const knex = require("knex");
const app = require("../src/app");
const { makeFoldersArray } = require("./folders.fixtures");
const { TEST_DB_URL } = require("../src/config");

describe("Folders Endpoints", function() {
  let db;
  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: TEST_DB_URL
    });
  });
});
