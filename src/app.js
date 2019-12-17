require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

const { NODE_ENV } = require("./config");
const foldersRouter = require("./folders/folders-router");
const notesRouter = require("./notes/notes-router");
const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use("/api/folders", foldersRouter);
app.use("/api/notes", notesRouter);

app.get("/", (req, res) => {
  res.send("Add an endpoint");
});

module.exports = app;
