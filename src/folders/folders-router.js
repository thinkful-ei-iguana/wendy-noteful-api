const path = require("path");
const express = require("express");
const xss = require("xss");
const FoldersService = require("./folders-service");

const foldersRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = folder => ({
  id: folder.id,
  folder_name: xss(folder.folder_name)
});

foldersRouter.route("/folders").get((req, res, next) => {
  const knexInstance = req.app.get("db");
  FoldersService.getAllFolders(knexInstance)
    .then(folders => {
      res.json(folders.map(serializeFolder));
    })
    .catch(next);
});
