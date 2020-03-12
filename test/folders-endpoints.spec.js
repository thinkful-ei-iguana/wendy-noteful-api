/* eslint-disable quotes */
const { expect } = require("chai");
const knex = require("knex");

const app = require("../src/app");
const { makeFoldersArray, makeMaliciousFolder } = require("./noteful.fixtures");
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
    context("Given an XSS attack folder", () => {
      const testFolders = makeFoldersArray();
      const { maliciousFolder, expectedFolder } = makeMaliciousFolder();

      beforeEach("insert malicious folder", () => {
        return db.into("folders").insert([maliciousFolder]);
      });
      it("removes XSS attack content", () => {
        return supertest(app)
          .get("/api/folders")
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql(expectedFolder.name);
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
        return db.into("folders").insert(testFolders);
      });

      it("responds with 200 and the specified folder", () => {
        const folderId = 2;
        const expectedFolder = testFolders[folderId - 1];
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(200, expectedFolder);
      });
      context(`Given an XSS attack folder`, () => {
        const testFolders = makeFoldersArray();
        const { maliciousFolder, expectedFolder } = makeMaliciousFolder();

        beforeEach("insert malicious folder", () => {
          return db.into("folders").insert([maliciousFolder]);
        });

        it("removes XSS attack content", () => {
          return supertest(app)
            .get(`/api/folders/${maliciousFolder.id}`)
            .expect(200)
            .expect(res => {
              expect(res.body.title).to.eql(expectedFolder.title);
              expect(res.body.content).to.eql(expectedFolder.content);
            });
        });
      });
    });
  });
  describe("POST /api/folders", () => {
    it("creates a folder, responding with 201 and the new folder", () => {
      const newFolder = {
        name: "Test new folder"
      };
      return supertest(app)
        .post("/api/folders")
        .send(newFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newFolder.name);
          expect(res.body).to.have.property("id");
          expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`);
        })
        .then(res =>
          supertest(app)
            .get(`/api/folders/${res.body.id}`)
            .expect(res.body)
        );
    });

    const requiredFields = ["name"];

    requiredFields.forEach(field => {
      const newFolder = {
        name: "test new folder"
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newFolder[field];

        return supertest(app)
          .post("/api/folders")
          .send(newFolder)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          });
      });
    });
    it("removes XSS attack content from response", () => {
      const { maliciousFolder, expectedFolder } = makeMaliciousFolder();
      return supertest(app)
        .post(`/api/folders`)
        .send(maliciousFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(expectedFolder.name);
        });
    });
  });

  describe(`DELETE /api/folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderId = 123456;
        return supertest(app)
          .delete(`/api/folders/${folderId}`)
          .expect(404, { error: { message: `Folder doesn't exist` } });
      });
    });

    context("Given there are folders in the database", () => {
      const testFolders = makeFoldersArray();

      beforeEach("insert folders", () => {
        return db.into("folders").insert(testFolders);
      });

      it("responds with 204 and removes the article", () => {
        const idToRemove = 2;
        const expectedFolders = testFolders.filter(
          folder => folder.id !== idToRemove
        );
        return supertest(app)
          .delete(`/api/folders/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/folders`)
              .expect(expectedFolders)
          );
      });
    });
  });

  describe(`PATCH /api/folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderId = 123456;
        return supertest(app)
          .delete(`/api/folders/${folderId}`)
          .expect(404, { error: { message: `Folder doesn't exist` } });
      });
    });

    context("Given there are folders in the database", () => {
      const testFolders = makeFoldersArray();

      beforeEach("insert folders", () => {
        return db.into("folders").insert(testFolders);
      });

      it("responds with 201 and updates the folder", () => {
        const idToUpdate = 2;
        const updateFolder = {
          name: "updated folder name"
        };
        const expectedFolder = {
          ...testFolders[idToUpdate - 1],
          ...updateFolder
        };
        return supertest(app)
          .patch(`/api/folders/${idToUpdate}`)
          .send(updateFolder)
          .expect(201)
          .then(res =>
            supertest(app)
              .get(`/api/folders/${idToUpdate}`)
              .expect(expectedFolder)
          );
      });
    });
  });
});
