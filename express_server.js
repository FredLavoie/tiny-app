/************************************************************ NOTES **********************************************************/
/*****************************************************************************************************************************/

// To search for specific endpoints, search for #<KEYWORD>

/************************************************ REQUIRED PACKAGES / PORT ***************************************************/
/*****************************************************************************************************************************/

const express = require("express");
const bodyParser = require("body-parser"); // makes post request readable
const cookieParser = require('cookie-parser');
//const uuidv4 = require('uuid/v4');
const bcrypt = require('bcrypt');
const PORT = 8080; // default port 8080

let app = express(); // app is the server
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

/******************************************************** DATABASES **********************************************************/
/*****************************************************************************************************************************/

const urlDatabase = {
  "9sm5xK": {userId: "ert45b6e", longURL: "http://www.google.com"},
  "b2xVn2": {userId: "asdf4f4h5", longURL: "http://www.lighthouselabs.ca"},
  "ef45g5g": {userId: "asdf4f4h5", longURL: "http://www.google.ca"},
  "hjk88k": {userId: "asdf4f4h5", longURL: "http://www.github.com"},
  "dfgh65674f": {userId: "asdf4f4h5", longURL: "https://github.com/FrancisBourgouin/lhl-w2d4/blob/master/index.js"},
  "wert345er34": {userId: "asdf4f4h5", longURL: "https://getbootstrap.com/docs/4.1/components/buttons/"},
};

const users = {
  asdf4f4h5: {
    id: "asdf4f4h5", 
    email: "joe@gmail.com", 
    password: "f"
  },
  ert45b6e: {
    id: "ert45b6e", 
    email: "bob@gmail.com", 
    password: "d"
  }
};

/***************************************************** SERVER - LISTEN *******************************************************/
/*****************************************************************************************************************************/

app.listen(PORT, () => {
  console.log(`tiny-app listening on port ${PORT}`);
});

/******************************************************* SERVER - GET ********************************************************/
/*****************************************************************************************************************************/

// [#REGISTER] redirect to register page
app.get("/register", (request, response) => {
  let templateVars = {email: ""};
  response.render("urls_registration", templateVars);
});

// redirect to index after login
app.get("/login", (request, response) => {
  let templateVars = {email: ""};
  response.render("urls_login", templateVars);
});

// [#INDEX] index directory of website sends templateVars to urls_template.ejs file  
app.get("/urls", (request, response) => {
  if (request.cookies["user_id"] == '') {
    response.render("urls_login");
  } else {
    let email = request.cookies["user_id"];
    let id = getId(email);
    let shortURLArray = urlsForUser(id);
    let templateVars = { urls: urlDatabase, email: email, array: shortURLArray };    
    response.render("urls_index", templateVars);
  }
});

// [#NEW] directs to new url creator page
app.get("/urls/new", (request, response) => {
  if (request.cookies["user_id"] == '') {
    response.render("urls_login");
  } else {
    let templateVars = { email: request.cookies["user_id"] };
    response.render("urls_new", templateVars);
  }
});

// [#SHARE LINK] redirect traffic of u/:shortURL to longURL
app.get("/u/:shortURL", (request, response) => {
  let long = '';
  for (let key in urlDatabase) {
    if (key === request.params.shortURL) {
      long = urlDatabase[key].longURL;
    }
  }
  response.redirect(long);
});

// [#SHORT URL] adds shorturl and longurl to 'urlDatabase' object on submit
app.get("/urls/:shortURL", (request, response) => {
  console.log(request.cookies["user_id"]);
  
  if(request.cookies["user_id"] == '') { // if not logged in, can't edit urls
    response.render("urls_login");
  } 
  
  let loggedUser = getId(request.cookies["user_id"]);
  let urlUserId = users[request.params.shortURL].id;
  console.log(loggedUser, urlUserId);

  if (loggedUser != urlUserId) { // user prevented from accessing other user urls
    response.status(403).send("<h3>Press back to return to your TinyURLs (error: unauthorized access)</h3>");
  } else {  
    let templateVars = {
      shortURL: request.params.shortURL,
      longURL: urlDatabase[request.params.shortURL].longURL,
      email: request.cookies["user_id"],
    };
    response.render("urls_show", templateVars);
  }
});

/******************************************************* SERVER - POST *******************************************************/
/*****************************************************************************************************************************/

// [#CREATE] generates a shorturl upon submitting longURL in form
app.post("/urls", (request, response) => {
  let newShortURL = generateRandomString();  
  let id = getId(request.cookies["user_id"]);
  urlDatabase[newShortURL] = { userId: id, longURL: request.body.longURL };
  response.redirect("urls/" + newShortURL);
});

// [#DELETE] delete entry from urlDatabase object
app.post("/urls/:shortURL/delete", (request, response) => {
  if (!(request.cookies["user_id"])) {
    response.render("urls_login");
  } else {
    delete urlDatabase[request.params.shortURL];
    response.redirect("/urls");
  }
});

// [#UPDATE] edit entry from urlDatabase object
app.post("/urls/:shortURL", (request, response) => {
  if (!(request.cookies["user_id"])) {
    response.render("urls_login");
  } else {
    urlDatabase[request.params.shortURL].longURL = request.body.longURL;
    response.redirect("/urls");
  }
});

// [#LOGIN] create cookie for user name entered by user in form
app.post("/login", (request, response) => {
  let userEmail = request.body.email;
  let userId = getId(userEmail);

  if (!request.body.email || !request.body.password) {
    response.status(400).send("<h3>Press back and enter email and password (error: blank input field)</h3>");
  } else if (emailChecker(request.body.email) === false) {
    response.status(403).send("<h3>Press back and enter your email and password (error: user not found)</h3>");
  } else if (bcrypt.compareSync(request.body.password, users[userId].password) || users[userId].email == userEmail) {
    response.cookie("user_id", request.body.email);
    response.redirect("/urls");
  } else {
    response.status(403).send("<h3>Press back and re-enter email and password (error: wrong email and/or password)</h3>");
  }

});

// [#LOGOUT] clear cookie from browser on logout
app.post("/logout", (request, response) => {
  response.clearCookie("user_id");
  response.redirect("/login");
});

// [#REGISTER] create new user entry in 'users' object
app.post("/register", (request, response) => {
    
  if (!request.body.email || !request.body.password) {
    response.status(400).send("<h3>Press back and enter email and password (error: blank input field)</h3>");
  } else if (emailChecker(request.body.email) === true) {
    response.status(400).send("<h3>Press back and enter new email and password (error: user already exists)</h3>");
  } else {

    let newId = generateRandomId();
    let newUser = { id: newId, email: '', password: '' };
    users[newId] = newUser;
    users[newId].email = request.body.email;
    let pw = request.body.password;
    users[newId].password = bcrypt.hashSync(pw, 10);
    
    response.cookie("user_Id", request.body.email);
    response.redirect("/urls");
  }
});

/********************************************************* FUNCTIONS *********************************************************/
/*****************************************************************************************************************************/

// generate unique shortURL
function generateRandomString() {
  return (Math.random() * 6).toString(36).substring(6);
}

// generate unique userId 
function generateRandomId() {
  return (Math.random() * 6).toString(36).substring(6);
}

// check if email exists in 'users' database
function emailChecker(email) {
  for (let entry in users) {
    let existingEmail = users[entry].email;
    if (email === existingEmail) {
      return true;
    }
  }
  return false;
}

// retreive 'id' from 'users' database using 'email' as input
function getId(email) {
  for (let key in users) {
    if (users[key].email === email) {
      return users[key].id;
    }
  }
}

// create array of all shortURL that belong to specific user (specified by id)
function urlsForUser(id) {
  let userArray = [];
  for (let entry in urlDatabase) {
    if (urlDatabase[entry].userId === id) {
      userArray.push(entry);
    }
  }
  return userArray;
}
