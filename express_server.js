const express = require("express");
let app = express(); // app is the server
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser"); // makes post request readable

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// database of URL that the user has as short URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// when server is initialisted, it listens for requests
app.listen(PORT, () => {
  console.log(`tiny-app listening on port ${PORT}`);
});

// get requests for urls.json will provide the urlDatabase as a JSON file
app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

// index directory of website sends templateVars to urls_template.ejs file  
app.get("/urls", (request, response) => {
  let templateVars = { urls: urlDatabase };  
  response.render("urls_index", templateVars);
});

// directs to new url creator page
app.get("/urls/new", (request, response) => {
  response.render("urls_new");
});

// adds shorturl and longurl to 'urlDatabase' object on submit
app.get("/urls/:shortURL", (request, response) => {
  let templateVars = { shortURL: request.params.shortURL, longURL: urlDatabase[request.params.shortURL] };
  response.render("urls_show", templateVars);
});

// generates a shorturl upon submitting longurl in form
app.post("/urls", (request, response) => {
  let item = generateRandomString();
  urlDatabase[item] = request.body.longURL;
  response.send(urlDatabase); 
});

app.get("/u/:shortURL", (request, response) => {
  const longURL = request.params.shortURL;
  response.redirect(urlDatabase[longURL]);
});

app.post("/urls/:shortURL/delete", (request, response) => {
  delete urlDatabase[request.params.shortURL];
  response.redirect("/urls");
});

function generateRandomString() {
  return (Math.random() * 6).toString(36).substring(6);
}

