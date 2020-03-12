function makeFoldersArray() {
  return [
    { id: 1, name: "test folder 1" },
    { id: 2, name: "test folder 2" },
    { id: 3, name: "test folder 3" }
  ];
}

function makeNotesArray() {
  return [
    {
      id: 1,
      name: "test note 1",
      modified: new Date().toLocaleString("en", { timeZone: "UTC" }),
      folderid: 1,
      content: "test note content 1"
    },
    {
      id: 2,
      name: "test note 2",
      modified: new Date().toLocaleString("en", { timeZone: "UTC" }),
      folderid: 2,
      content: "test note content 2"
    },
    {
      id: 3,
      name: "test note 3",
      modified: new Date().toLocaleString("en", { timeZone: "UTC" }),
      folderid: 3,
      content: "test note content 3"
    }
  ];
}

function makeMaliciousFolder() {
  const maliciousFolder = {
    id: 911,
    name: "bad <script>alert('xss');</script>"
  };
  const expectedFolder = {
    ...maliciousFolder,
    name: "bad &lt;script&gt;alert('xss');&lt;/script&gt;"
  };
  return {
    maliciousFolder,
    expectedFolder
  };
}

function makeMaliciousNote() {
  const maliciousNote = {
    id: 911,
    name: "bad <script>alert('xss');</script>",
    folderid: 1,
    content: "bad <script>alert('xss');</script>"
  };
  const expectedNote = {
    ...maliciousNote,
    name: "bad &lt;script&gt;alert('xss');&lt;/script&gt;",
    folderid: 1,
    content: "bad &lt;script&gt;alert('xss');&lt;/script&gt;"
  };
  return {
    maliciousNote,
    expectedNote
  };
}
module.exports = {
  makeFoldersArray,
  makeNotesArray,
  makeMaliciousFolder,
  makeMaliciousNote
};
