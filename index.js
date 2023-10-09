// Require packages
require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const path = require('path');

// Set up mongoDB connection
mongoose.connect(process.env.MONGO_CONNECTION)
    .then(() => {
        console.log('Mongo connection open');
    })
    .catch((e) => {
        console.log(e);
    });

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// public folder for css js font and etc.
app.use(express.static('public'));

// Create home route
app.get('/', (req, res) => {
    res.render('index');
});

// Create authenication route
app.get('/authenication', (req, res) => {
    res.render('authenication');
});

// Create authors route
app.get('/authors', (req, res) => {
    res.render('authors');
});

// Create products route
app.get('/products', (req, res) => {
    res.render('explore');
});

// Create products info route
app.get('/productInfo', (req, res) => {
    res.render('details');
});

// Create cart info route
app.get('/cart', (req, res) => {
    res.render('cart');
});

// Create server in 3000 port
app.listen(port, () => {
    console.log("Listening to port 3000");
});