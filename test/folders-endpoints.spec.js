const { expect } = require("chai");
const knex = require("knex");

const app = require("../src/app");
const { makeFoldersArray, makeMaliciousFolder } = require("./folders.fixtures");
const { TEST_DB_URL } = require("../src/config");

describe("Folders Endpoints", function() {
  let db;
  this.timeout(5000);
  const cleanup = () =>
    db.raw("TRUNCATE notes, folders RESTART IDENTITY CASCADE");

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: TEST_DB_URL
    });
    app.set("db", db);
  });
  after("disconnect from db", () => db.destroy());

  before("clean the table", cleanup);

  afterEach("clean the table", cleanup);

  describe("GET /api/folders", () => {
    context("Given no folders in database", () => {
      it("responds with 200 and empty list", () => {
        return supertest(app)
          .get("/api/folders")
          .expect(200, []);
      });
    });
    context("Given there are folders in the database", () => {
      const testFolders = makeFoldersArray();
      beforeEach("insert folders", () => {
        return db.into("folders").insert(testFolders);
      });
      it("responds with 200 and all of the folders", () => {
        return supertest(app)
          .get("/api/folders")
          .expect(200, testFolders);
      });
    });
    context("Given an XSS attack article", () => {
      const testFolders = makeFoldersArray();
      const { maliciousFolder, expectedFolder } = makeMaliciousFolder();

      beforeEach("insert malicious bookmark", () => {
        return db.into("folders").insert([maliciousFolder]);
      });
      it("removes XSS attack content", () => {
        return supertest(app)
          .get("/api/folders")
          .expect(200)
          .expect(res => {
            expect(res.body[0].folder_name).to.eql(expectedFolder.folder_name);
          });
      });
    });
  });
  describe("GET /api/folders/:folder_id", () => {
    context("Given no folders", () => {
      it("responds with 404", () => {
        const folderId = 99999;
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(404, { error: { message: "Folder doesn't exist" } });
      });
    });
    context("Given there are folders in the database", () => {
      const testFolders = makeFoldersArray();
      beforeEach("insert folders", () => {
        return db.into;
      });
    });
  });
});
