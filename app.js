require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const ejs = require("ejs");
const _ = require("lodash");
const moment = require("moment");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");
const session = require("express-session");
const cors = require("cors");
const axios = require("axios");
const sgMail = require("@sendgrid/mail");
const multer = require("multer");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));
// app.use(express.static(path.join(__dirname + "/public")));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

//MONGOBD CONNECTIONS

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://localhost:27017/leadImpactDB", {
  useUnifiedTopology: true,
});

// mongoose.connect(
//   "mongodb+srv://Admin-Nwalo:nobicious97@theleadimpactinitiative.y4osptq.mongodb.net/?retryWrites=true&w=majority",
//   {
//     useUnifiedTopology: true,
//   }
// );

// SCHEMA DEFINITIONS

const userSchema = new mongoose.Schema({
  username: String,
  fullName: String,
  phone: String,
  nick: String,
});

const volunteerSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
});

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    bannerImage: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    bannerImage: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    bannerImage: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// MONGODB PLUGINS

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// MODEL DEFINITIONS

const User = mongoose.model("User", userSchema);
const Volunteer = mongoose.model("Volunteer", volunteerSchema);
const Blog = mongoose.model("Blog", blogSchema);
const Project = mongoose.model("Project", projectSchema);
const Event = mongoose.model("Event", eventSchema);

passport.use(User.createStrategy());

// GLOBAL SERIALIZATION

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// SENDGRID CONFIGURATION

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

sendMail = (htm, email, subject, res, clientEmail, clientMsg) => {
  const msg = {
    to: email, // Change to your recipient
    from: process.env.SENDER_MAIL, // Change to your verified sender
    subject: subject,
    html: htm,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
      return res.status(200).json({ status: true });
    })
    .catch((error) => {
      console.error(error);
      return res.status(400).json({ status: false });
    });

  if (clientEmail && clientMsg) {
    const msgCli = {
      to: clientEmail, // Change to your recipient
      from: process.env.SENDER_MAIL, // Change to your verified sender
      subject: subject,
      html: clientMsg,
    };

    sgMail
      .send(msgCli)
      .then(() => {
        console.log("Email sent to client");
      })
      .catch((error) => {
        console.error(error);
      });
  }
};

// MULTER CONFIG

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// API ENDPOINTS / ROUTES

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
      errorMsg: "",
    });
  } else {
    res.render("page-404");
  }
});

app.get("/admin", (req, res) => {
  if (req.isAuthenticated()) {
    console.log("yes");
    res.render("admin");
  } else {
    console.log("no");
    res.redirect("/account/login");
  }
});

app.post("/admin", upload.single("file"), (req, res) => {
  let post = {};

  if (req.body.type === "blog") {
    post = new Blog({
      title: _.lowerCase(req.body.title),
      type: _.lowerCase(req.body.type),
      content: req.body.content,
      bannerImage: req.body.banner,
      author: req.body.author,
    });
  }
  if (req.body.type === "event") {
    post = new Event({
      title: _.capitalize(req.body.title),
      type: _.lowerCase(req.body.type),
      content: req.body.content,
      bannerImage: req.body.banner,
      author: req.body.author,
    });
  }
  if (req.body.type === "project") {
    post = new Project({
      title: _.capitalize(req.body.title),
      type: _.lowerCase(req.body.type),
      content: req.body.content,
      bannerImage: req.body.banner,
      author: req.body.author,
    });
  }

  post.save((err) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        data: `Error, unable to create new ${_.capitalize(
          req.body.type
        )} post.`,
        message: err,
        status: false,
      });
    } else {
      res.status(200).json({
        data: `${_.capitalize(req.body.type)} post has been created.`,
        status: true,
      });
    }
  });
});

app.get("/blog", async (req, res) => {
  try {
    let blogs = (await Blog.find({})).reverse();
    let date = moment(blogs.createdAt).format("DD MMMM, YYYY");
    res.render("blog", { blogs, date });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

app.get("/blog/:id", async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);
    let blogs = await Blog.find({});
    let newBlog = blogs.map((i) => {
      i.title = i.title.slice(0, 20);
      i.type = moment(i.createdAt).format("DD MMMM, YYYY");
      return i;
    });

    let date = moment(blog.createdAt).format("DD MMMM, YYYY");
    res.render("blog-details", { blog, blogs: newBlog.slice(0, 3), date });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

app.get("/coming-soon", (req, res) => {
  res.render("coming-soon");
});

app.get("/contacts", (req, res) => {
  res.render("contacts");
});

app.post("/contacts", (req, res) => {
  const { fullName, email, phone, message, subject } = req.body;

  let msg = `<h3>New Contact / Enquiry</h3>
  <p>${fullName}, has just contacted you from the website.</p>
  <p>You can follow up with the following details:</p>
  <ul> <li>Full Name: ${fullName} </li> <li>Email: ${email} </li> <li>Phone Number: ${phone} </li> <li>Subject: ${subject} </li> <li>Message: ${message} </li> </ul>
  <small style='text-align: right; margin-top: 10px'> <img src='/images/tlii_logo.png' alt='logo' />  The Lead Impact Initiative ${new Date().getFullYear()}</small>`;

  sendMail(msg, process.env.CLIENT_MAIL, "New Contact/Enquiry", res);
});

app.get("/donation", (req, res) => {
  // res.render("donation");
  res.redirect("/coming-soon");
});

app.get("/events", (req, res) => {
  // res.render("events");
  res.redirect("/coming-soon");
});

app.get("/events/:id", (req, res) => {
  res.render("event-details");
});

app.post("/join", (req, res) => {
  const { email, fullName, phone } = req.body;

  const volunteer = new Volunteer({
    email,
    fullName,
    phone,
  });

  let msg = `<h3>New Volunteer</h3>
  <p>${fullName}, has just volunteered  to contribute to global efforts on climate and environmental sustainability.</p>
  <p>You can follow up with the following details:</p>
  <ul> <li>Full Name: ${fullName} </li> <li>Email: ${email} </li> <li>Phone: ${phone} </li> </ul>
  <small style='text-align: right; margin-top: 10px'> The Lead Impact Initiative ${new Date().getFullYear()}</small>`;

  let welcomeMsg = `<h3>New Volunteer</h3>
  <p>Hi ${fullName}, </p>
  <p>Thank you for volunteering to contribute to global efforts on climate and environmental sustainability. Please stay tuned, you will get a follow up email from us.</p>
  
  <small style='text-align: right; margin-top: 10px'> The Lead Impact Initiative ${new Date().getFullYear()}</small>`;
  Volunteer.findOne({ email: req.body.email }, (err, found) => {
    if (err) {
      return console.log(err);
    } else {
      if (!found) {
        volunteer.save((err) => {
          if (!err) {
            sendMail(
              msg,
              process.env.CLIENT_MAIL,
              "New Volunteer",
              res,
              email,
              welcomeMsg
            );

            // return res.json({ status: true });
          } else {
            console.log("errr");
          }
        });
      }

      if (found) {
        return res.json({ status: false });
      }
    }
  });
});

app.get("/projects", async (req, res) => {
  try {
    let projects = await Project.find({});

    res.render("projects", { projects });
  } catch (error) {
    res.redirect("/");
  }
});

app.get("/projects/:id", async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    let date = moment(project.createdAt).format("DD MMMM, YYYY");

    res.render("projects-details", { project, date });
  } catch (error) {
    res.redirect("/");
  }
});

app.get("/projects/pro/clean_up_exercise_at_the_ui", (req, res) => {
  res.render("projects-details-1");
});

app.get("/projects/pro/climate_change_is_real", (req, res) => {
  res.render("projects-details-2");
});

app.get("/projects/pro/climate_change_is_real_2", (req, res) => {
  res.render("projects-details-3");
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  passport.authenticate("local", function (err, user, info) {
    if (err) {
      console.log(err);
    }
    if (!user) {
      return res.render("my-account", {
        errorMsg: "Invalid email address or password !",
        page: "login",
      });
    }

    req.logIn(user, function (err) {
      //This creates a log in session
      if (err) {
        res.render("my-account", {
          errorMsg: "Connection errror, unable to process request.",
          page: "login",
        });
      } else {
        console.log("logged in");
        res.redirect("/admin");
      }
    });
  })(req, res);
});

app.get("/logout", function (req, res) {
  req.logout((err) => {
    err && console.log(err);
  });
  res.redirect("/account/login");
});

app.post("/register", function (req, res) {
  // return console.log(req.isAuthenticated(), req);
  if (
    req.isAuthenticated() &&
    (req.user.username === "Millerstephen314@gmail.com" ||
      req.user.username === "lawrenceakpoterai@gmail.com")
  ) {
    User.register(
      {
        username: req.body.username,
      },
      req.body.password,
      function (err) {
        if (err) {
          res.render("my-account", {
            errorMsg:
              "Error! User registration failed - Email address already exist.",
            page: "register",
          });
        } else {
          passport.authenticate("local")(req, res, function () {
            User.updateOne(
              {
                _id: req.user.id,
              },
              {
                fullName: _.capitalize(req.body.fullName),
                nick: _.capitalize(req.body.nick),
                phone: req.body.phone,
              },
              function (err) {
                if (!err) {
                  res.render("admin");
                } else {
                  res.render("my-account", {
                    errorMsg: "Error ! User registration failed.",
                    page: "register",
                  });
                }
              }
            );
          });
        }
      }
    );
  } else {
    res.render("my-account", {
      errorMsg: "Authorization failed... Contact the admin.",
      page: "register",
    });
  }
});

app.get("*", (req, res) => {
  // res.send("Error... page does not exist");
  res.render("page-404");
});

let port = process.env.PORT || 2000;

app.listen(port, () => {
  console.log("Server is running at port " + port);
});
