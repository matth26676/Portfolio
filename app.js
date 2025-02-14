const express = require('express');
const app = express(); app.set('view engine', 'ejs');
const port = 3000;
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const server = app.listen(port, () => console.log(`Server started on port ${port}`));
const socketIo = require('socket.io');
const io = socketIo(server);
const sqlite3 = require('sqlite3');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Sets up the session middleware to use SQLite as the session store
const sessionMiddleware = session({
    store: new SQLiteStore,
    secret: 'Updated Boilerplate',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
})

// Sets up the express app to use the session middleware
app.use(sessionMiddleware);

// Sets up the express app to use the JSON and URL encoded parser so we can access the request body
app.use(express.urlencoded({ extended: true }));

// Sets up the express app to use the session middleware for socket.io
io.use((socket, next) => sessionMiddleware(socket.request, {}, next));

// Imports the routes and sockets modules
const routes = require('./modules/routes');
const sockets = require('./modules/socket');
const path = require('path');
// Connects to the SQLite database
const db = new sqlite3.Database('data/Database.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to the data/Database.db!')
    }
});

// Sets up the methods that the server may receive
app.get('/', routes.getindex);

app.get('/login', (req, res) => routes.getlogin(req, res, jwt));

app.post('/login', (req, res) => routes.postlogin(req, res, db, crypto));

app.get('/logout', routes.getlogout);

app.get('/chat', routes.getchat);

io.on('connection', (socket) => sockets.connection(socket, io));

app.use(express.static(path.join(__dirname, 'public')));