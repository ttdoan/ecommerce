import express from "express";

// Middleware
import cookieParser from "cookie-parser";
import cors from "cors";
// Routes
import accountRouter from "./routes/account";
import indexRouter from "./routes/index";

var createError = require("http-errors");
var path = require("path");
var logger = require("morgan");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static("public"));
// Disables serving index.html because HTML is generated
// using pug.
app.use(express.static("dist/client", { index: false }));

// Routes
app.use("/", indexRouter);
app.use("/account", accountRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// module.exports = app;
export default app;
