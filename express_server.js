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

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/");
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
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

  function generateRandomString() {
    return Math.random().toString(36).substr(2, 6);
  }
  const randomString = generateRandomString()

  urlDatabase[randomString] = longURL
  
  res.redirect(`/urls/${randomString}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]

  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
   };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.post("/login", (req, res) => {
  const username = req.body.username
  console.log(username)
  res.cookie('username', username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
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