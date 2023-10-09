// Require packages
const express = require('express');
const app = express();
const port = 3000;

// Create home route to see is server working or not
app.get('/' , (req ,res) => {
    res.send("it's Working");
});

// Create server in 3000 port
app.listen(port , () => {
    console.log("Listening to port 3000");
});