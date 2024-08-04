import serverless from "serverless-http";
import express from "express";
var ejs = require("ejs");
import mongoose from "mongoose";
require("dotenv").config();
import nodemailer from "nodemailer";

const app = express();

app.set("view engine", "ejs");

const dbURI = process.env.MONGODB_URL;
mongoose.set("strictQuery", false);

// this is the Cyclic way, and works here too. However, we don't make use of the global scope
// mongoose
// .connect(dbURI)
// .then((result) => app.listen(process.env.EXPRESS_PORT))
// .catch((err) => console.log(err));

// According to https://mongoosejs.com/docs/lambda.html has a global state and connection can be cached;
// also here: https://docs.aws.amazon.com/lambda/latest/operatorguide/global-scope.html
let conn = null;
if (conn == null) {
  console.log("Connecting Mongoose...");
  mongoose
    .connect(dbURI!)
    .then((result) => {
      conn = result;
      app.listen(process.env.EXPRESS_PORT);
    })
    .catch((err) => console.log(err));
} else {
  console.log("Use existing Mongoose connection...");
  app.listen(process.env.EXPRESS_PORT);
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
  console.log("env");
  return res.status(200).json({
    message: `Hello ${process.env.NAME} from path env with`,
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

app.get("/mail", (req, res, next) => {
  const mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT!),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    greetingTimeout: 1000 * 10,
    logger:
      !!process.env.SMTP_DEBUG &&
      process.env.SMTP_DEBUG.toLowerCase() == "true",
  });
  mailTransporter.verify(function (error: any, success: any) {
    if (error) {
      console.log(error);
    } else {
      console.log("SMTP server is ready to take our messages");
    }
  });

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: process.env.EMAIL_TEST_RECIPIENT,
    subject: "Test",
    html: "Hello World",
  };

  let mailResult;
  mailTransporter
    .sendMail(mailOptions)
    .then((result: any) => {
      console.log("mail success");
      mailResult = "mail success";
      return res.status(200).json({
        message: `Hello from mail; result is ${mailResult}`,
      });
    })
    .catch((err: any) => {
      console.log(err);
      mailResult = "mail error";
      return res.status(200).json({
        message: `Hello from mail; result is ${mailResult}`,
      });
    });
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

exports.handler = serverless(app);
