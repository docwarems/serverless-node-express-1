const serverless = require("serverless-http");
const express = require("express");
var ejs = require('ejs');
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");

const dbURI = process.env.MONGODB_URL;
mongoose.set("strictQuery", false);

// According to https://mongoosejs.com/docs/lambda.html has a global state and connection can be cached;
let conn = null;
if (conn == null) {
  console.log("Connecting Mongoose...")
  mongoose
  .connect(dbURI)
  .then((result) => conn = result)
  .catch((err) => console.log(err));
}

// here we usually get "2" which means "connecting"
console.log("mongoose.connection.readyState", mongoose.connection.readyState);

// for a test we wait a short while amd log again; now we get "1" which means "connected"
setTimeout(() => {
  console.log("mongoose.connection.readyState", mongoose.connection.readyState);
}, 1000);

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

app.get("/env", (req, res, next) => {
  return res.status(200).json({
    message: `Hello ${process.env.NAME} from path env`,
  });
});

// TODO: hier bisher immer State 2 (connecting)
app.get("/mongoose", (req, res, next) => {
  return res.status(200).json({
    message: `mongoose.connection.readyState ${mongoose.connection.readyState}`,
  });
});

app.get("/ejs1", (req, res, next) => {
  const name = "Michael";
  res.render("ejs1", { name });
});

app.get("/ejs2", (req, res, next) => {
  res.render("ejs2");
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

exports.handler = serverless(app);
