const express = require("express");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const port = 3000;

const App = express();

mongoose.connect("mongodb://localhost:27017/expresshomework", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

App.set("view engine", "ejs");

App.use(express.static(__dirname + "/public"));
App.use(express.json());
App.use(express.urlencoded({ extended: false }));

App.use(
  session({
    secret: "thisisagreatsecret",
    resave: false,
    saveUninitialized: true,
  })
);

App.use(passport.initialize());
App.use(passport.session());

passport.serializeUser((user, callback) => {
  callback(null, user.id);
});

passport.deserializeUser((id, callback) => {
  User.findById(id, (err, user) => {
    callback(err, user);
  });
});

passport.use(
  "local-login",
  new localStrategy({ usernameField: "email" }, (email, password, callback) => {
    User.findOne({ email: email }, (err, user) => {
      if (err) return callback(err);
      if (!user)
        return callback(null, false, { message: "Incorrect Username" });
      if (user.password === password) {
        return callback(null, user);
      } else {
        return callback(null, false, { message: "Incorrect Password" });
      }
    });
  })
);

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
};

const isLoggedOut = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
};

App.get("/", isLoggedIn, (req, res) => {
  if (!req.session.viewcount) {
    req.session.viewcount = 1;
    res.render("index", {
      title: "Home",
      countLine: "Welcome to this page for the first time!",
    });
  } else {
    req.session.viewcount += 1;
    res.render("index", {
      title: "Home",
      countLine: `You visited this page ${req.session.viewcount} times.`,
    });
  }
});

App.get("/login", isLoggedOut, (req, res) => {
  res.render("login", {
    title: "Login",
    error: req.query.error,
  });
});

App.post(
  "/login",
  passport.authenticate("local-login", {
    successRedirect: "/",
    failureRedirect: "/login?error=true",
  })
);

App.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

App.get("/register", isLoggedOut, (req, res) => {
  res.render("register", {
    title: "Register",
    error: req.query.error,
  });
});

App.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) throw err;
    if (!user) {
      const newUser = new User({
        email: req.body.email,
        password: req.body.password,
      });
      newUser.save();
      res.redirect("/login");
    } else {
      res.redirect("/register?error=true");
    }
  });
});
App.listen(port, () => {
  console.log(
    `Server Listening on port ${port}\nGo to : http://localhost:${port}/`
  );
});
