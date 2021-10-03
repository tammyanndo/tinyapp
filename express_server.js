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

// const urlDatabase = {
//   b6UTxQ: {
//       longURL: "https://www.tsn.ca",
//       userID: "aJ48lW"
//   },
//   i3BoGr: {
//       longURL: "https://www.google.ca",
//       userID: "aJ48lW"
//   },
//   i3AoGr: {
//     longURL: "https://www.google.ca",
//     userID: "abkdkl"
// }
// };

// const urlsForUser = function(id, urlsDb) {
//   const urls = {};

//   for (let shortURL in urlDatabase) {
//     if (id === urlDatabase[shortURL].userID) {
//       urls[shortURL] = urlDatabase[shortURL]
//     }
//   } 
//   return urls
// }

// const usersdb = {
//   "userRandomID": {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
//   },
//   "user2RandomID": {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: bcrypt.hashSync("dishwasher-funk", 10)
//   }
// }

// function generateRandomString() {
//   return Math.random().toString(36).substr(2, 6);
// }

// const createUser = function (email, password, users) {
//   const userId = generateRandomString();
//   const hashedPassword = bcrypt.hashSync(password, 10)
//       users[userId] = {
//         id: userId,
//         email,
//         password: hashedPassword
//       };
//   return userId;
// };

// const confirmUser = function (email, password, usersdb) {
//   const userFound = findUserByEmail(email, usersdb)
//   if (!userFound) {
//     return false
//   };
//   if (userFound) {
//     const result = bcrypt.compareSync(password, userFound.password)
//       if (!result) {
//         return false;
//       } else {
//         return userFound
//       }
//   }
// };



app.post("/login", (req, res) => {
  console.log('req.body:', req.body)
  const email = req.body.email
  const password = req.body.password

  const user = confirmUser(email, password, usersdb)
  console.log('this is user', user)

  if (user) {
    // res.cookie("user_id", user.id)
    req.session.user_id = user.id
    res.redirect("/urls");
  } else {
    res.status(403).send('Status code 403')
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
    return res.status(400).send('Status error 400: That user already exists. Please use a different email address to register.');
  }
  // if user does not exist, then add user to db
  const userId = createUser(email, password, usersdb);
  
  // res.cookie('user_id', userId);
  req.session.user_id = userId;
  res.redirect('/urls');
})

app.post("/urls/:shortURL", (req, res) => {
  //this is the edit URL (when you submit edit)
  const userId = req.session.user_id
  if (!userId) {
     return res.send('Please login to edit this URL.')
  }
  let shortURL = req.params.shortURL
  if (userId !== urlDatabase[shortURL].userID) {
    return res.send('Permission to edit this URL is denied.')
  }
  longURL = req.body.longURL
  urlDatabase[shortURL].longURL = longURL
  res.redirect("/urls/");
});

app.get("/urls/new", (req, res) => {
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
  const userId = req.session.user_id
  if (!userId) {
     return res.send('Please login to delete URL.')
  }
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
  console.log('urlDatabase:', urlDatabase)
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