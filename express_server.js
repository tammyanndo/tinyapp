const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session')
const { findUserByEmail } = require("./helpers");
const { urlsForUser } = require("./helpers");
const { usersdb } = require("./helpers");
const { generateRandomString } = require("./helpers");
const { createUser } = require("./helpers");
const { confirmUser } = require("./helpers");
const { urlDatabase } = require("./helpers");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['something', 'key2', 'something else']
}));

app.get('/login', (req, res) => {
  const templateVars = { user: null };
  res.render('urls_login', templateVars);
});

app.post("/login", (req, res) => {

  const email = req.body.email
  const password = req.body.password
  // use helper function to confirm that email is found in db, and if so, the password matches
  const user = confirmUser(email, password, usersdb)

  // if there is a user (true), then create a cookie, otherwise return error message
  if (user) {
    req.session.user_id = user.id
    res.redirect("/urls");
  } else {
    res.status(403).send('Status code 403: Login error. Please try again. ')
  }
});

app.get('/register', (req, res) => {
  const templateVars = { user: null };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // if email or password field is left blank, send appropriate status code

  if (!email) {
    res.status(400).send('Status code 400: Please enter your email address.');
    return;
  }
  if (!password) {
    res.status(400).send('Status code 400: Please enter your password.')
  }

  const userFound = findUserByEmail(email, usersdb);

  // if the email already exists in db, send error message
  if (userFound) {
    return res.status(400).send('Status error 400: That user already exists. Please use a different email address to register.');
  }

  // if email does not exist in db, create user and add to db
  const userId = createUser(email, password, usersdb);

  req.session.user_id = userId;
  res.redirect('/urls');
})

app.post("/urls/:shortURL", (req, res) => {
  // all users can view any url, but users can only edit and delete their own
  const userId = req.session.user_id

  // if no user is found, then send message to login to edit
  if (!userId) {
    return res.send('Please login to edit this URL.')
  }
  let shortURL = req.params.shortURL
  // if logged in user id does not match id of url, then send error message
  if (userId !== urlDatabase[shortURL].userID) {
    return res.send('Permission to edit this URL is denied.')
  }
  longURL = req.body.longURL
  urlDatabase[shortURL].longURL = longURL
  res.redirect("/urls/");
});

app.get("/urls/new", (req, res) => {
  // only registered and logged in users can create new urls
  // check if user is logged in 
  if (req.session.user_id) {
    const templateVars = {
      user: req.session.user_id ? usersdb[req.session.user_id] : undefined
    };
    res.render("urls_new", templateVars);
  } else {
    const templateVars = { user: null }
    res.send('Please login to create a new short URL.')
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // users can only delete their own urls
  const userId = req.session.user_id
  // check to see if there is a user logged in; if not, send error message
  if (!userId) {
    return res.send('Please login to delete URL.')
  }
  // if user is logged in, but different from user that created the url, send error message
  let shortURL = req.params.shortURL
  if (userId !== urlDatabase[shortURL].userID) {
    return res.send('Permission to delete denied.')
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL
  const randomString = generateRandomString()
  urlDatabase[randomString] = {}
  urlDatabase[randomString].longURL = longURL
  urlDatabase[randomString].userID = req.session.user_id
  res.redirect(`/urls/${randomString}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id
  if (!userId) {
    return res.redirect('/login')
  }
  const templateVars = {
    urls: urlsForUser(userId, urlDatabase),
    user: usersdb[req.session.user_id]
  };
  res.render("urls_index", templateVars)
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const userId = req.session.user_id
  if (!userId) {
    return res.send('Please login to see your URLs.')
  }
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: usersdb[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/logout", (req, res) => {
  req.session = null;

  res.redirect("/urls");
})

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});