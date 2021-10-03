const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
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
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";

    console.log('user:', user)
    console.log('expectedOutpu:', expectedOutput)
    console.log('testUsers[expectedOutput].email', testUsers[expectedOutput].email)

    assert(testUsers[expectedOutput].id === expectedOutput, 'this users are the same')

    // Write your assert statement here
  });
  it('should return false', function() {
    const user = findUserByEmail("randomUser@example.com", testUsers)

    assert(user === false, 'this should return undefined')

  })
});