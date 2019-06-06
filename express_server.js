/************************************* REQUIRED PACKAGES / PORT ****************************************/
/*******************************************************************************************************/

const express = require("express");
const bodyParser = require("body-parser"); // makes post request readable
const cookieParser = require('cookie-parser');
//const uuidv4 = require('uuid/v4');
const PORT = 8080; // default port 8080

let app = express(); // app is the server
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

/********************************************* DATABASEs************************************************/
/*******************************************************************************************************/

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  asdf4f4h5: {
    id: "asdf4f4h5", 
    email: "joe@gmail.com", 
    password: "purple-monkey-dinosaur"
  },
  ert45b6e: {
    id: "ert45b6e", 
    email: "bob@gmail.com", 
    password: "dishwasher-funk"
  }
};

/****************************************** SERVER - LISTEN ********************************************/
/*******************************************************************************************************/

app.listen(PORT, () => {
  console.log(`tiny-app listening on port ${PORT}`);
});

/******************************************** SERVER - GET *********************************************/
/*******************************************************************************************************/

// redirect to register page
app.get("/register", (request, response) => {
  let templateVars = {email: ""};
  response.render("urls_registration", templateVars);
});

// index directory of website sends templateVars to urls_template.ejs file  
app.get("/urls", (request, response) => {
  let email = request.cookies["user_id"];
  let templateVars = { urls: urlDatabase, email: email };
  response.render("urls_index", templateVars);
});

// directs to new url creator page
app.get("/urls/new", (request, response) => {
  let templateVars = { email: request.cookies["user_id"] };
  response.render("urls_new", templateVars);
});

// redirect traffic of u/:shortURL to longURL
app.get("/u/:shortURL", (request, response) => {
  const longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});

// adds shorturl and longurl to 'urlDatabase' object on submit
app.get("/urls/:shortURL", (request, response) => {
  
  let templateVars = {
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL],
    email: request.cookies["user_id"],
  };
  
  response.render("urls_show", templateVars);
});

/******************************************** SERVER - POST ********************************************/
/*******************************************************************************************************/

// generates a shorturl upon submitting longURL in form
app.post("/urls", (request, response) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = request.body.longURL;
  response.redirect("urls/" + newShortURL);
});

// delete entry from urlDatabase object
app.post("/urls/:shortURL/delete", (request, response) => {
  delete urlDatabase[request.params.shortURL];
  response.redirect("/urls");
});

// edit entry from urlDatabase object
app.post("/urls/:shortURL", (request, response) => {
  urlDatabase[request.params.shortURL] = request.body.longURL;
  response.redirect("/urls");
});

// create cookie for user name entered by user in form
app.post("/login", (request, response) => {
  response.cookie("user_id", request.body.email);
  response.redirect("/urls");
});

// clear cookie from browser on logout
app.post("/logout", (request, response) => {
  response.clearCookie("user_id");
  response.redirect("/urls");
});

// create new user entry in 'users' object
app.post("/register", (request, response) => {

  if (!request.body.email || !request.body.password) {
    response.status(400).send("<h3>Press back and enter username and password (error: blank input field)</h3>");
  } else if (emailChecker(request.body.email)) {
    response.status(400).send("<h3>Press back and enter new username and password (error: user already exists)</h3>");
  } else {

    let newId = generateRandomId();
    let newUser = { id: newId, email: '', password: '' };
    users[newId] = newUser;
    users[newId].email = request.body.email;
    users[newId].password = request.body.password;
    
    response.cookie("userId", request.body.email);
    response.cookie("password", request.body.password);
    response.redirect("/urls");
  }
});

/********************************************** FUNCTIONS **********************************************/
/*******************************************************************************************************/

// generates unique shortURL
function generateRandomString() {
  return (Math.random() * 6).toString(36).substring(6);
}

// generates unique userId 
function generateRandomId() {
  return (Math.random() * 6).toString(36).substring(6);
}

// email verifies that entry does not exist in 'users' database
function emailChecker(email) {
  for (let entry in users) {
    let existingEmail = users[entry].email;
    if (email === existingEmail) {
      return true;
    } else {
      return false;
    }
  }
}
