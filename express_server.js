const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')

app.use(cookieParser())
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const usersdb = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

const createUser = function (email, password, users) {
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email,
    password,
  };
  return userId;
};

const findUserByEmail = function (email, users) {
  for (let userId in users) {
    const user = users[userId];
    if (email === user.email) {
      return user;
    }
  }
  return false;
};

const confirmUser = function (email, password, usersdb) {
  const userFound = findUserByEmail(email, usersdb)
  console.log('userfound:', userFound)
  if (userFound && userFound.password === password) { //is there a ways to separate this? so that an error message will display for either error
    return userFound;
  }
  return false
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));


app.post("/login", (req, res) => {
  console.log('req.body:', req.body)
  const email = req.body.email
  const password = req.body.password

  const user = confirmUser(email, password, usersdb)
  console.log('this is user', user)

  if (user) {
    res.cookie("user_id", user.id)
    res.redirect("/urls");
  } else {
    res.status(403).send('Status code 403: This user and password do not match. Please try again')
  }
});


app.get('/login', (req, res) => {
  const templateVars = { user: null };
  res.render('urls_login', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = { user: null };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // if the email or password is empty, return 400 status code
  if (!email) {
    res.status(400).send('Status code 400: Please enter your email address.');
    return;
  }
  if (!password) {
    res.status(400).send('Status code 400: Please enter your password.')
  }

  // check to see if user exists
  const userFound = findUserByEmail(email, usersdb);
  // if user exists, then return 400 code status
  if (userFound) {
    res.status(400).send('Status error 400: That user already exists. Please use a different email address to register.');
    return;
  }
  // if user does not exist, then add user to db
  const userId = createUser(email, password, usersdb);
  res.cookie('user_id', userId);
  res.redirect('/urls');
})

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/");
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.cookies['user_id'] ? usersdb[req.cookies["user_id"]] : undefined
  };
  res.render("urls_new", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL
  const randomString = generateRandomString()
  urlDatabase[randomString] = longURL
  res.redirect(`/urls/${randomString}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id']
  if (userId) {
    const templateVars = {
      urls: urlDatabase,
      user: usersdb[req.cookies["user_id"]]
    };
    res.render("urls_index", templateVars)
  } else {
    res.redirect('/login')
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    user: usersdb[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});


app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
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