# TinyApp

TinyApp is a simple and easy to use link(URL) shortener application similar to bitly.com and goo.gl. Creating short links allows you to share them more easily with friends and family. By signing up with TinyApp, you can save the links you create so you always have access to them. The links you create track the number of times your shared links have been clicked on.

TinyApp is a full stack web application built using [Node.js](https://nodejs.org) and [Expressjs](https://expressjs.com/), (a node.js framework) for the back-end server, HTML, [EJS](https://ejs.co/) Embeded javaScript Templates and the [Bootstrap](https://getbootstrap.com/) toolkit for the front-end. The databases are simple [JSON](https://json.org/) files. The server file uses the built-in node package [File System (fs)](https://nodejs.org/api/fs.html) to read and write the user profiles and the URLs databases.

The [bcrypt.js](https://www.npmjs.com/package/bcrypt) node module is used during the user registration process to hash the password. this way, the passwords are never stored in plain text, insuring security for the end user. The server also uses an Expressjs middleware called [cookie-session](https://expressjs.com/en/resources/middleware/cookie-session.html). Cookie-session only stores a session identifier on the client within a cookie.

## Screenshots

### Registration
<img src="./screenshots/register.png" width="800">

### Login
<img src="./screenshots/login.png" width="800">

### User index/home
<img src="./screenshots/index.png" width="800">

### Create a new short URL
<img src="./screenshots/create-new.png" width="800">

### Show a URL
<img src="./screenshots/show-link.png" width="800">


## Getting Started

In order to use TinyApp, you must first clone the project to your local machine.

Once the project is cloned, head over to your bash terminal and install the dependencies (listed below) using the following command:

```
npm install <module name>
```

Once all the dependencies are installed, type the following command to get the server started:

```
node express_server.js
```

You should get a message in terminal saying:
```
tiny-app listening on port 8080
```

Now head over to your web browser of choice <em>cough [FireFox](https://www.mozilla.org/en-US/firefox/new/) cough</em> and navigate to <strong><localhost:8080/register></strong>.

Simply create an account to start shortening URLs and share them with the world!

(Alternatively, you can use ol' Joe's credentials to see what he's got going on with his links: `joe@gmail.com`, 123456)


to share a link, copy the "Shareable link".

enjoy!

## Dependencies

These are the modules needed to run TinyApp:

- [node.js](https://nodejs.org)
- [fs](https://nodejs.org/api/fs.html)
- [express](https://expressjs.com/)
- [body-parser](https://www.npmjs.com/package/body-parser)
- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [cookie-session](https://expressjs.com/en/resources/middleware/cookie-session.html)

