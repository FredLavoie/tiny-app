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

