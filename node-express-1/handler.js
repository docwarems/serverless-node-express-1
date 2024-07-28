const serverless = require("serverless-http");
const express = require("express");
const app = express();
var ejs = require('ejs');

app.set("view engine", "ejs");

app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

app.get("/hello", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from path!",
  });
});

app.get("/hello2", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from path hello2!",
  });
});

app.get("/ejs1", (req, res, next) => {
  res.render("ejs1");
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

exports.handler = serverless(app);
