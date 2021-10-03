const bcrypt = require('bcryptjs');


const findUserByEmail = function (email, users) {
  for (let userId in users) {
    const user = users[userId];
    if (email === user.email) {
      return user;
    }
  }
  return false;
};

const urlsForUser = function(id, urlsDb) {
  const urls = {};

  for (let shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      urls[shortURL] = urlDatabase[shortURL]
    }
  } 
  return urls
}

const usersdb = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

const createUser = function (email, password, users) {
  const userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10)
      users[userId] = {
        id: userId,
        email,
        password: hashedPassword
      };
  return userId;
};

const confirmUser = function (email, password, usersdb) {
  const userFound = findUserByEmail(email, usersdb)
  if (!userFound) {
    return false
  };
  if (userFound) {
    const result = bcrypt.compareSync(password, userFound.password)
      if (!result) {
        return false;
      } else {
        return userFound
      }
  }
};

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  },
  i3AoGr: {
    longURL: "https://www.google.ca",
    userID: "abkdkl"
}
};

module.exports = { findUserByEmail, urlsForUser, usersdb, generateRandomString, createUser, confirmUser, urlDatabase };
