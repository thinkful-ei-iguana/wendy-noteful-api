require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

const { NODE_ENV } = require("./config");
const foldersRouter = require("./folders/folders-router");
const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use("/folders", foldersRouter);
app.use("/:folder_id", foldersRouter);
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

module.exports = app;
