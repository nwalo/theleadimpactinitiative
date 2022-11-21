require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const ejs = require("ejs");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + "/public")));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/account/:page", (req, res) => {
  if (
    _.lowerCase(req.params.page) === "login" ||
    _.lowerCase(req.params.page) === "register"
  ) {
    res.render("my-account", {
      page: _.lowerCase(req.params.page) === "login" ? "login" : "register",
    });
  } else {
    console.log("err");
    res.render("page-404");
  }
});

app.get("/blog", (req, res) => {
  res.render("blog");
});

app.get("/blog/:id", (req, res) => {
  res.render("blog-details");
});

app.get("/contacts", (req, res) => {
  res.render("contacts");
});

app.get("/donation", (req, res) => {
  res.render("donation");
});

app.get("/projects", (req, res) => {
  res.render("projects");
});

app.get("/events", (req, res) => {
  res.render("events");
});

app.get("/events/:id", (req, res) => {
  res.render("event-details");
});

app.get("*", (req, res) => {
  // res.send("Error... page does not exist");
  res.render("page-404");
});

let port = process.env.PORT || 2000;

app.listen(port, () => {
  console.log("Server is running at port " + port);
});
