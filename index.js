// Require packages
const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
require('dotenv').config();

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

// Create home route to see is server working or not
app.get('/' , (req ,res) => {
    res.send("it's Working");
});

// Create server in 3000 port
app.listen(port , () => {
    console.log("Listening to port 3000");
});