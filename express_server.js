/********************************************* REQUIRED PACKAGES / PORT ***************************************************/
/**************************************************************************************************************************/

const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser"); // makes post request readable
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const PORT = 8080; // default port 8080
const mod = require("./functions.js");

let app = express(); // app is the server
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['LighthouseLabsTinyAppProject!'] //,'KeyNumberTwoNotSureWhyINeedThis'],
}));

/************************************************** SERVER - LISTEN *******************************************************/
/**************************************************************************************************************************/

app.listen(PORT, () => {
  console.log(`tiny-app listening on port ${PORT}`);
});

/**************************************************** SERVER - GET ********************************************************/
/**************************************************************************************************************************/

// [#ROOT] redirect to /login or /urls
app.get("/", (request, response) => {
  if (request.session.user_id == null) {
    response.render("urls_login");
  } else {
    fs.readFile('_users.json', 'utf-8', function(error, members){
      if (error) {
        console.log(error);
      }
      let _users = JSON.parse(members);
      let id = request.session.user_id;
      let email = _users[id].email;
      let shortURLArray = mod.urlsForUser(id);
      
      fs.readFile('_urlDatabase.json', 'utf-8', function(error, data){
        if (error) {
          console.log(error);
        }
        let _urlDatabase = JSON.parse(data);
        let templateVars = { urls: _urlDatabase, email: email, array: shortURLArray };    
        response.render("urls_index", templateVars);
      });
    });
  }
});

// [#REGISTER] redirect to register page
app.get("/register", (request, response) => {
  let templateVars = {email: ""};
  response.render("urls_registration", templateVars);
});

// [#AFTER-LOGIN] redirect to index after login
app.get("/login", (request, response) => {
  let templateVars = {email: ""};
  response.render("urls_login", templateVars);
});

// [#INDEX] index directory of website sends templateVars to urls_template.ejs file
app.get("/urls", (request, response) => {
  if (request.session.user_id == null) {
    response.render("urls_login");
  } else {
    fs.readFile('_users.json', 'utf-8', function(error, members){
      if (error) {
        console.log(error);
      }
      let _users = JSON.parse(members);
      let id = request.session.user_id;
      let email = _users[id].email;
      let shortURLArray = mod.urlsForUser(id);
  
      fs.readFile('_urlDatabase.json', 'utf-8', function(error, data){
        if (error) {
          console.log(error);
        }
        let _urlDatabase = JSON.parse(data);
    
        let templateVars = { urls: _urlDatabase, email: email, array: shortURLArray };    
        response.render("urls_index", templateVars);
      });
    });
  }
});

// [#NEW] directs to new url creator page
app.get("/urls/new", (request, response) => {
  if (request.session.user_id == null) {
    response.render("urls_login");
  } else {
    fs.readFile('_users.json', 'utf-8', function(error, members){
      if (error) {
        console.log(error);
      }
      let _users = JSON.parse(members);
      let id = request.session.user_id;
      let email = _users[id].email;
      let templateVars = { email: email };
      response.render("urls_new", templateVars);
    });
  }
});

// [#SHARE-LINK] redirect traffic of u/:shortURL to longURL
app.get("/u/:shortURL", (request, response) => {
  let shortURL = request.params.shortURL;
  mod.shortURLcount(shortURL);
  let long = '';

  let data = fs.readFileSync('_urlDatabase.json', 'utf-8');
   
  let _urlDatabase = JSON.parse(data);

  for (let key in _urlDatabase) {
    if (key === shortURL) {
      long = _urlDatabase[key].longURL;
    }
  }
  response.redirect(long);
  
});

// [#SHORT-URL] adds shorturl and longurl to 'urlDatabase' object on submit
app.get("/urls/:shortURL", (request, response) => {
  
  if (request.session.user_id == null) { // if not logged in, can't edit urls
    response.render("urls_login");
  }
  fs.readFile('_urlDatabase.json', 'utf-8', function(error, data){
    if (error) {
      console.log(error);
    }
    let _urlDatabase = JSON.parse(data);
  
    let loggedUser = request.session.user_id;
    let urlUserId = _urlDatabase[request.params.shortURL].userId;
  
    if (loggedUser !== urlUserId) { // user prevented from accessing other user urls
      response.status(403).send("<h3>Press back to return to your TinyURLs (error: unauthorized access)</h3>");
    } else {
      let num = mod.getCount(request.params.shortURL);
      fs.readFile('_users.json', 'utf-8', function(error, members){
        if (error) {
          console.log(error);
        }
        let _users = JSON.parse(members);
    
        let templateVars = {
          shortURL: request.params.shortURL,
          longURL: _urlDatabase[request.params.shortURL].longURL,
          email: _users[request.session.user_id].email,
          count: num,
        };
        
        response.render("urls_show", templateVars);
      });
    }
  });

});

/**************************************************** SERVER - POST *******************************************************/
/**************************************************************************************************************************/

// [#CREATE] generates a shortURL upon submitting longURL in form
app.post("/urls", (request, response) => {
  let newShortURL = mod.generateRandomString();
  let id = request.session.user_id;

  fs.readFile('_urlDatabase.json', 'utf-8', function(error, data){
    if (error) {
      console.log(error);
    }

    let _urlDatabase = JSON.parse(data);
  
    _urlDatabase[newShortURL] = { userId: id, longURL: request.body.longURL };
    mod.addURL(newShortURL);
    
    let updatedDatabase = JSON.stringify(_urlDatabase);

    fs.writeFile('_urlDatabase.json', updatedDatabase, function(error){
      if (error) {
        console.log(error);
      }
      response.redirect("urls/" + newShortURL);
    });

  });

});

// [#DELETE] delete entry from 'urlDatabase' object
app.post("/urls/:shortURL/delete", (request, response) => {
  if (request.session.user_id == null) {
    response.render("urls_login");
  } else {
    fs.readFile('_urlDatabase.json', 'utf-8', function(error, data){
      if (error) {
        console.log(error);
      }
      let _urlDatabase = JSON.parse(data);
  
      delete _urlDatabase[request.params.shortURL];
      let updatedDatabase = JSON.stringify(_urlDatabase);
      fs.writeFile('_urlDatabase.json', updatedDatabase, function(error){
        if (error) {
          console.log(error);
        }
        response.redirect("/urls");
      }); 
    });
  }
});

// [#DELETE-ACCOUNT] delete entry from 'users' object
app.post("/delete", (request, response) => {
  fs.readFile('_users.json', 'utf-8', function(error, members){
    if (error) {
      console.log(error);
    }     
    let _users = JSON.parse(members);
    let id = request.session.user_id;

    mod.deleteAllURL(id);
     
    delete _users[id];
    
    let updatedUsers = JSON.stringify(_users);
    fs.writeFile('_users.json', updatedUsers, function(error){
      if (error) {
        console.log(error);
      }
      request.session = null;
      response.redirect("/register");
    });
    
  });
});

// [#UPDATE] edit entry from urlDatabase object
app.post("/urls/:shortURL", (request, response) => {
  if (request.session.user_id == null) {
    response.render("urls_login");
  } else {
    fs.readFile('_urlDatabase.json', 'utf-8', function(error, data){
      if (error) {
        console.log(error);
      }
      let _urlDatabase = JSON.parse(data);
      _urlDatabase[request.params.shortURL].longURL = request.body.longURL;
      let updatedDatabase = JSON.stringify(_urlDatabase);
      fs.writeFile('_urlDatabase.json', updatedDatabase, function(error){
        if (error) {
          console.log(error);
        }
        response.redirect("/urls");
      });
    });
    
  }
});

// [#LOGIN] create cookie for user name entered by user in form
app.post("/login", (request, response) => {
  let userEmail = request.body.email;
  let userPassword = request.body.password;
  let userId = mod.getId(userEmail);
  let checkedEmail = mod.emailChecker(userEmail);
  
  let members = fs.readFileSync('_users.json', 'utf-8');
  let _users = JSON.parse(members);

  if (!userEmail || !userPassword) {
    response.status(400).send("<h3>Press back and enter email and password (error: blank input field)</h3>");
  } else if (checkedEmail === false) {
    response.status(403).send("<h3>Press back and enter your email and password (error: user not found)</h3>");
  } else if (bcrypt.compareSync(userPassword, _users[userId].password) === true && _users[userId].email == userEmail) {
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
  let checkedEmail = mod.emailChecker(userEmail);

  if (!userEmail || !userPassword) {
    response.status(400).send("<h3>Press back and enter email and password (error: blank input field)</h3>");
  } else if (checkedEmail === true) {
    response.status(400).send("<h3>Press back and enter new email and password (error: user already exists)</h3>");
  } else {
    fs.readFile('_users.json', 'utf-8', function(error, members){
      if (error) {
        console.log(error);
      }      
      
      let _users = JSON.parse(members);
  
      let newId = mod.generateRandomString();
      let newUser = { id: newId, email: '', password: '' };
      _users[newId] = newUser;
      _users[newId].email = userEmail;
      let pw = userPassword;
      _users[newId].password = bcrypt.hashSync(pw, 10);
  
      let updatedUsers = JSON.stringify(_users);
      fs.writeFile('_users.json', updatedUsers, function(error){
        if (error) {
          console.log(error);
        }
        request.session.user_id = newId;
        response.redirect("/urls");
      });
    });
   
  }
});

