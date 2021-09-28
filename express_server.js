const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");


function generateRandomString() {
    return Math.random().toString(36).substr(2, 6);
}

const randomString = generateRandomString()

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls/new", (req, res) => {
  


  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body); 
  const longURL = req.body.longURL

  function generateRandomString() {
    return Math.random().toString(36).substr(2, 6);
  }
  const randomString = generateRandomString()

  urlDatabase[randomString] = longURL
  
  console.log(urlDatabase);
  
  res.redirect(`/urls/${randomString}`);
});

app.get("/u/:shortURL", (req, res) => {
  
  const longURL = urlDatabase[req.params.shortURL]

  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  console.log(shortURL)
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
});


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