/************************************* REQUIRED PACKAGES / PORT ****************************************/
/*******************************************************************************************************/

const express = require("express");
const bodyParser = require("body-parser"); // makes post request readable
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080

let app = express(); // app is the server
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

/********************************************* DATABASE ************************************************/
/*******************************************************************************************************/

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

/****************************************** SERVER - LISTEN ********************************************/
/*******************************************************************************************************/

app.listen(PORT, () => {
  console.log(`tiny-app listening on port ${PORT}`);
});

/******************************************** SERVER - GET *********************************************/
/*******************************************************************************************************/

// index directory of website sends templateVars to urls_template.ejs file  
app.get("/urls", (request, response) => {
  let username = request.cookies["username"];
  let templateVars = { urls: urlDatabase, username: username }; 
  console.log(templateVars);
  response.render("urls_index", templateVars);
});

// directs to new url creator page
app.get("/urls/new", (request, response) => {
  let templateVars = { username: request.cookies["username"] };
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
    username: request.cookies["username"],
  };
  
  response.render("urls_show", templateVars);
});

/******************************************** SERVER - POST ********************************************/
/*******************************************************************************************************/

// generates a shorturl upon submitting longURL in form
app.post("/urls", (request, response) => {
  let item = generateRandomString();
  urlDatabase[item] = request.body.longURL;
  response.redirect("urls/" + item);
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
  response.cookie("username", request.body.username);
  response.redirect("/urls");
});

app.post("/logout", (request, response) => {
  response.clearCookie("username", request.body.username);
  response.redirect("/urls");
});

/********************************************** FUNCTIONS **********************************************/
/*******************************************************************************************************/

function generateRandomString() {
  return (Math.random() * 6).toString(36).substring(6);
}

