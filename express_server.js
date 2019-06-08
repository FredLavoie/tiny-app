/************************************************ REQUIRED PACKAGES / PORT ***************************************************/
/*****************************************************************************************************************************/

const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser"); // makes post request readable
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const PORT = 8080; // default port 8080

let app = express(); // app is the server
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['LighthouseLabsTinyAppProject!'] //,'KeyNumberTwoNotSureWhyINeedThis'],
}));

/******************************************************** DATABASES **********************************************************/
/*****************************************************************************************************************************/

const urlDatabase = {
  '9sm5xK': {userId: 'bgxuc7', longURL: 'http://www.google.com'},
  'b2xVn2': {userId: 'bgxuc7', longURL: 'http://www.lighthouselabs.ca'},
  'ef45g5g': {userId: 'iw5ltek', longURL: 'http://www.google.ca'},
  'hjk88k': {userId: 'bgxuc7', longURL: 'http://www.github.com'},
  'dfgh65674f': {userId: 'iw5ltek', longURL: 'https://github.com/FrancisBourgouin/lhl-w2d4/blob/master/index.js'},
  'wert345er34': {userId: 'iw5ltek', longURL: 'https://getbootstrap.com/docs/4.1/components/buttons/'},
};

const users = {
  iw5ltek: {
    id: 'iw5ltek',
    email: 'adam@gmail.com',
    password: '$2b$10$ccMu1QyTwyw1aGQcWxaYNuel9kDOFw3PqwBbunY9o6HHgiTCCO6gW'
  },
  bgxuc7: {
    id: 'bgxuc7',
    email: 'joe@gmail.com',
    password: '$2b$10$55YhPC5nt0aGvq3sxQRBnOsRbrAQU5bR.ZuDNv/9CQCaO4edWG47O'
  },
};

/***************************************************** SERVER - LISTEN *******************************************************/
/*****************************************************************************************************************************/

app.listen(PORT, () => {
  console.log(`tiny-app listening on port ${PORT}`);
});

/********************************************************* FUNCTIONS *********************************************************/
/*****************************************************************************************************************************/

// generate unique string (used for user IDs and short URLs)
function generateRandomString() {
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

// create array of all shortURL that belong to specific user using 'id' as input
function urlsForUser(id) {
  let userArray = [];
  for (let entry in urlDatabase) {
    if (urlDatabase[entry].userId === id) {
      userArray.push(entry);
    }
  }
  return userArray;
}

// add to count in shortURL - file I/O
function shortURLcount(url) {
  
  fs.readFile('shortURLcount.json', 'utf-8', function (error, data){
    if (error) {
      console.log(error);
    }
    let array = JSON.parse(data);
    
    for(let entry of array) {
      if (entry.url === url) { 
        entry.count += 1;
        let update = JSON.stringify(array);
        fs.writeFileSync('shortURLcount.json', update);
      }
    }
  });  
}

// get count of shortURL - file I/O
function getCount(url) {
  
  let data = fs.readFileSync('shortURLcount.json', 'utf-8');
  let array = JSON.parse(data);
  
  for(let entry of array) {
    if (entry.url == url) {       
      return entry.count;
    }
  }
}

// add link to shortURL - file I/O
function addURL(url) {
  
  let newObj = { url: url, count: 0 };
  let data = fs.readFileSync('shortURLcount.json', 'utf-8');
  let array = JSON.parse(data);

  array.push(newObj);
  let updatedArray = JSON.stringify(array);
  fs.writeFileSync('shortURLcount.json', updatedArray);
}



/******************************************************* SERVER - GET ********************************************************/
/*****************************************************************************************************************************/

// [#REGISTER] redirect to register page
app.get("/register", (request, response) => {
  let templateVars = {email: ""};
  response.render("urls_registration", templateVars);
});

// [#POST-LOGIN] redirect to index after login
app.get("/login", (request, response) => {
  let templateVars = {email: ""};
  response.render("urls_login", templateVars);
});

// [#INDEX] index directory of website sends templateVars to urls_template.ejs file
app.get("/urls", (request, response) => {
  if (request.session.user_id == null) {
    response.render("urls_login");
  } else {
    let id = request.session.user_id;
    let email = users[id].email;
    let shortURLArray = urlsForUser(id);
    let templateVars = { urls: urlDatabase, email: email, array: shortURLArray };    
    response.render("urls_index", templateVars);
  }
});

// [#NEW] directs to new url creator page
app.get("/urls/new", (request, response) => {
  if (request.session.user_id == null) {
    response.render("urls_login");
  } else {
    let templateVars = { email: request.session.user_id };
    response.render("urls_new", templateVars);
  }
});

// [#SHARE-LINK] redirect traffic of u/:shortURL to longURL
app.get("/u/:shortURL", (request, response) => {
  let shortURL = request.params.shortURL;
  shortURLcount(shortURL);
  let long = '';
  for (let key in urlDatabase) {
    if (key === shortURL) {
      long = urlDatabase[key].longURL;
    }
  }
  response.redirect(long);
});

// [#SHORT-URL] adds shorturl and longurl to 'urlDatabase' object on submit
app.get("/urls/:shortURL", (request, response) => {
  
  if (request.session.user_id == null) { // if not logged in, can't edit urls
    response.render("urls_login");
  }  
  let loggedUser = request.session.user_id;
  let urlUserId = urlDatabase[request.params.shortURL].userId;

  if (loggedUser !== urlUserId) { // user prevented from accessing other user urls
    response.status(403).send("<h3>Press back to return to your TinyURLs (error: unauthorized access)</h3>");
  } else {
    let num = getCount(request.params.shortURL);
        
    let templateVars = {
      shortURL: request.params.shortURL,
      longURL: urlDatabase[request.params.shortURL].longURL,
      email: users[request.session.user_id].email,
      count: num,
    };
    
    response.render("urls_show", templateVars);
  }
});

/******************************************************* SERVER - POST *******************************************************/
/*****************************************************************************************************************************/

// [#CREATE] generates a shortURL upon submitting longURL in form
app.post("/urls", (request, response) => {
  let newShortURL = generateRandomString();  
  let id = request.session.user_id;
  urlDatabase[newShortURL] = { userId: id, longURL: request.body.longURL };
  addURL(newShortURL);
  response.redirect("urls/" + newShortURL);
});

// [#DELETE] delete entry from urlDatabase object
app.post("/urls/:shortURL/delete", (request, response) => {
  if (request.session.user_id == null) {
    response.render("urls_login");
  } else {
    delete urlDatabase[request.params.shortURL];
    response.redirect("/urls");
  }
});

// [#UPDATE] edit entry from urlDatabase object
app.post("/urls/:shortURL", (request, response) => {
  if (request.session.user_id == null) {
    response.render("urls_login");
  } else {
    urlDatabase[request.params.shortURL].longURL = request.body.longURL;
    response.redirect("/urls");
  }
});

// [#LOGIN] create cookie for user name entered by user in form
app.post("/login", (request, response) => {
  let userEmail = request.body.email;
  let userPassword = request.body.password;
  let userId = getId(userEmail);

  if (!userEmail || !userPassword) {
    response.status(400).send("<h3>Press back and enter email and password (error: blank input field)</h3>");
  } else if (emailChecker(userEmail) === false) {
    response.status(403).send("<h3>Press back and enter your email and password (error: user not found)</h3>");
  } else if (bcrypt.compareSync(userPassword, users[userId].password) === true && users[userId].email == userEmail) {
    request.session.user_id = userId;
    response.redirect("/urls");
  } else {
    response.status(403).send("<h3>Press back and re-enter email and password (error: wrong email and/or password)</h3>");
  }

});

// [#LOGOUT] clear cookie from browser on logout
app.post("/logout", (request, response) => {
  request.session = null;
  response.redirect("/login");
});

// [#REGISTER] create new user entry in 'users' object
app.post("/register", (request, response) => {
  let userEmail = request.body.email;
  let userPassword = request.body.password;

  if (!userEmail || !userPassword) {
    response.status(400).send("<h3>Press back and enter email and password (error: blank input field)</h3>");
  } else if (emailChecker(userEmail) === true) {
    response.status(400).send("<h3>Press back and enter new email and password (error: user already exists)</h3>");
  } else {

    let newId = generateRandomString();
    let newUser = { id: newId, email: '', password: '' };
    users[newId] = newUser;
    users[newId].email = userEmail;
    let pw = userPassword;
    users[newId].password = bcrypt.hashSync(pw, 10);


    request.session.user_id = newId;
    response.redirect("/urls");
  }
});

