/**************************************** REQUIRED PACKAGES / PORT **********************************************/
/****************************************************************************************************************/

const fs = require('fs');

/**************************************************** FUNCTIONS *************************************************/
/****************************************************************************************************************/

// generate unique string (used for user IDs and short URLs)
function generateRandomString() {
  return (Math.random() * 6).toString(36).substring(6);
}

// check if email exists in 'users' database
function emailChecker(email) {
  let members = fs.readFileSync('database/_users.json', 'utf-8');
  let _users = JSON.parse(members);

  for (let entry in _users) {
    let existingEmail = _users[entry].email;
    if (email == existingEmail) {
      return true;
    }
  }
  return false;
}

// retreive 'id' from 'users' database using 'email' as input
function getId(email) {
  let members = fs.readFileSync('database/_users.json', 'utf-8');
  let _users = JSON.parse(members);

  for (let key in _users) {
    if (_users[key].email === email) {
      return _users[key].id;
    }
  }
  
}

// create array of all shortURL that belong to specific user using 'id' as input
function urlsForUser(id) {
  let userArray = [];
  let data = fs.readFileSync('database/_urlDatabase.json', 'utf-8');
  let _urlDatabase = JSON.parse(data);
  
  for (let entry in _urlDatabase) {
    if (_urlDatabase[entry].userId === id) {
      userArray.push(entry);
    }
  }
  return userArray;
}

// add to count in shortURL - file I/O
function shortURLcount(url) {
  
  fs.readFile('database/_shortURLcount.json', 'utf-8', function (error, data){
    if (error) {
      console.log(error);
    }
    let array = JSON.parse(data);
    
    for(let entry of array) {
      if (entry.url === url) { 
        entry.count += 1;
        let update = JSON.stringify(array, null, 2);
        fs.writeFileSync('database/_shortURLcount.json', update);
      }
    }
  });  
}

// get count of shortURL - file I/O
function getCount(url) {
  
  let data = fs.readFileSync('database/_shortURLcount.json', 'utf-8');
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
  fs.readFile('./database/_shortURLcount.json', 'utf-8', function(error, data){
    if (error) {
      console.log(error);
    }
    let array = JSON.parse(data);
  
    array.push(newObj);
    let updatedArray = JSON.stringify(array, null, 2);
    fs.writeFileSync('database/_shortURLcount.json', updatedArray);
  });
}

// delete all link to user being deleted - file I/O
function deleteAllURL(del_id){
  fs.readFile('database/_urlDatabase.json', 'utf-8', function(error, data){
    if (error) {
      console.log(error);
    }
    let allURL = JSON.parse(data);

    for(let entry in allURL) {
      if(allURL[entry].userId == del_id){
        delete allURL[entry];
      }
    }
    let updatedURL = JSON.stringify(allURL, null, 2);
    fs.writeFileSync('database/_urlDatabase.json', updatedURL);
  });
}

/**************************************************** EXPORTS ***************************************************/
/****************************************************************************************************************/

exports.generateRandomString = generateRandomString;
exports.emailChecker = emailChecker;
exports.getId = getId;
exports.urlsForUser = urlsForUser;
exports.shortURLcount = shortURLcount;
exports.getCount = getCount;
exports.addURL = addURL;
exports.deleteAllURL = deleteAllURL;
