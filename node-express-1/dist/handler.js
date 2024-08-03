"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverless_http_1 = __importDefault(require("serverless-http"));
const express_1 = __importDefault(require("express"));
var ejs = require("ejs");
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv").config();
const app = (0, express_1.default)();
app.set("view engine", "ejs");
const dbURI = process.env.MONGODB_URL;
mongoose_1.default.set("strictQuery", false);
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
    mongoose_1.default
        .connect(dbURI)
        .then((result) => {
        conn = result;
        app.listen(process.env.EXPRESS_PORT);
    })
        .catch((err) => console.log(err));
}
else {
    console.log("Use existing Mongoose connection...");
    app.listen(process.env.EXPRESS_PORT);
}
// here we usually get "2" which means "connecting"
console.log("mongoose.connection.readyState", mongoose_1.default.connection.readyState);
// for a test we wait a short while amd log again; now we get "1" which means "connected"
setTimeout(() => {
    console.log("mongoose.connection.readyState", mongoose_1.default.connection.readyState);
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
        message: `Hello ${process.env.NAME} from path env with`,
    });
});
// TODO: hier bisher immer State 2 (connecting)
app.get("/mongoose", (req, res, next) => {
    return res.status(200).json({
        message: `mongoose.connection.readyState ${mongoose_1.default.connection.readyState}`,
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
exports.handler = (0, serverless_http_1.default)(app);
