const express = require("express");
let app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.listen(PORT, () => {
  console.log(`tiny-app listening on port ${PORT}`);
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/", (request, response) => {
  let templateVars = { urls: urlDatabase };  
  response.render("urls_index", templateVars);
});

app.get("/urls/new", (request, response) => {
  response.render("urls_new");
});

app.get("/urls/:shortURL", (request, response) => {
  let templateVars = { shortURL: request.params.shortURL, longURL: urlDatabase[request.params.shortURL] };
  response.render("urls_show", templateVars);
});

app.post("/urls", (request, response) => {
  let item = generateRandomString();
  urlDatabase[item] = request.body.longURL;
  response.send(urlDatabase);
});

app.get("/u/:shortURL", (request, response) => {
  const longURL = request.params.shortURL;
  response.redirect("urls_index");
  // response.redirect(urlDatabase[longURL]);
});

function generateRandomString() {
  return (Math.random() * 6).toString(36).substring(6);
}