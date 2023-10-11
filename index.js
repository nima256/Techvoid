// Require packages 
require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const path = require('path');

// Reqruie packages
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('connect-flash');
const emailValidator = require('email-validator');

// Requrie models
const User = require('./models/user');

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

// Public folder for css js font and etc.
app.use(express.static('public/'));

// For access to req.body
app.use(express.urlencoded({ extended: true }));

// Set session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Use flash alert
app.use(flash());

// Create local variable for alert in pages
var icon;
var title;
var text;

// Create local variable to access them in all pages 
app.use(async (req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.ICON = req.session.icon;
    res.locals.TEXT = req.session.text;
    next();
});

// Create home route
app.get('/', (req, res) => {
    res.render('index');
});

// Create authenication route
app.get('/authenication', (req, res) => {
    res.render('authenication');
});

// Create authenication register api
app.post('/api/authenication/register', async (req, res) => {
    try {
        // Give inputes from body and save it to variable
        const { email, username, password, confirmPassword } = req.body;

        // To see if there is a user or not
        const exsistUser = await User.findOne({ username });

        /* A variable that it says that character most be A-Z or a-z and numbers and it must not have space
        "^" This character represent start of the string 
        "$" This character represent end of the string
        "+" This character represent that there must be at least one character matching the pattern
        The "a-z" and "A-Z" characters represent all lowercase and uppercase letters
        "0-9" represents all digits
        */
        const regex = /^[a-zA-Z0-9]+$/;

        /* I write "exsistUser" var above and it search for the user with his/her username 
        if it exsist the user info will be saved in that var and in this condition i write
        if exsist user has sth in it it means user had registered before and the user must login
        insted of registering
        */
        if (exsistUser) {
            req.session.icon = 'error';
            req.session.text = 'نام کاربری شما قبلا در سایت ثبت شده است';
            req.flash('error', req.session.text);
            res.redirect('/authenication');
            return;
        };
        /* In this condition if user didn't enter password or username or etc it says error and says
        you must fill them */
        if (!password || !username || !email || !confirmPassword) {
            req.session.icon = 'error';
            req.session.text = 'نام کاربری یا رمز عبور یا تکرار رمز عبور یا ایمیل وارد نشده است';
            req.flash('error', req.session.text);
            res.redirect('/authenication');
            return;
        };
        /* Here if the username is lower than 8 character it says error that you have to type username
        that has 8 character */
        if (username.length < 8) {
            req.session.icon = 'error';
            req.session.text = 'نام کاربری باید بیشتر از 8 کاراکتر باشد';
            req.flash('error', req.session.text);
            res.redirect('/authenication');
            return;
        };
        // This condition check if the username variable matches the regular expression specified in the regex
        if (!regex.test(username)) {
            req.session.icon = 'error';
            req.session.text = 'نام کاربری شما باید شامل حروف انگلیسی و اعداد باشد و نباید فاصله بین آن ها باشد';
            req.flash('error', req.session.text);
            res.redirect('/authenication');
            return;
        }
        /* Here if the password is lower than 8 character it says error that you have to type password
        that has 8 character */
        if (password.length < 8) {
            req.session.icon = 'error';
            req.session.text = 'رمز عبور باید بیشتر از 8 کاراکتر باشد';
            req.flash('error', req.session.text);
            res.redirect('/authenication');
            return;
        };
        // This condition check if the password variable matches the regular expression specified in the regex
        if (!regex.test(password)) {
            req.session.icon = 'error';
            req.session.text = 'رمز عبور  شما باید شامل حروف انگلیسی و اعداد باشد و نباید فاصله بین آن ها باشد';
            req.flash('error', req.session.text);
            res.redirect('/authenication');
            return;
        };
        /* In this condition if the password doesn't match with the confirmPassword it flash error
        that says your password must match with the first password that you entered */
        if (password !== confirmPassword) {
            req.session.icon = 'error';
            req.session.text = 'رمز عبور شما با تکرار آن همخوانی ندارد';
            req.flash('error', req.session.text);
            res.redirect('/authenication');
            return;
        };
        // The emailValidator is a package that help you that check the email that a email is correct or not
        if (!emailValidator.validate(email)) {
            req.session.icon = 'error';
            req.session.text = 'ایمیل شما معتبر نیست';
            req.flash('error', req.session.text);
            res.redirect('/authenication');
            return;
        };


        /* Here we use the bcrypt package to generate a hashed password for user security 
        The "genSalt" method generates a random salt value that will be used in the password hashing process
        The hash method is the last step of create a hashed password for user
        The "hash" method takes two arguments: the password to be hashed and the salt value generated earlier.
        */
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(password, salt);

        /* The user info will be save in the database here 
        The username will equal to username that we specify it above the code
        The password will be equal the hashed password that we created it earlier
        The email will be equal to email that we specify it above the code
        */
        const user = new User({ username, password: hash, email });
        await user.save();

        req.session.userId = user._id;
        req.session.icon = 'success';
        req.session.text = 'حساب شما با موفقیت ساخته شد';
        req.flash('success', req.session.text);
        res.redirect('/');

    } catch (e) {
        req.session.icon = 'error';
        req.session.text = e.message;
        req.flash('error', req.session.text);
        res.redirect('/authentication');
    };
});

// Create authenication login api
app.post('/api/authenication/login', async (req, res) => {
    try {
        // Give username and password from body
        const { username, password } = req.body;

        // If user didn't enter username or password in inputes it gives him/her error
        if (!username || !password) {
            req.session.icon = 'error';
            req.session.text = 'نام کاربری یا رمز عبور وارد نشده است';
            req.flash('error', req.session.icon);
            res.redirect('/authentication');
            return;
        };

        // Find user with the username that he/she entered in input
        const user = await User.findOne({ username });

        // If there wasn't any user with that username it gives error to user
        if (!user) {
            req.session.icon = 'error';
            req.session.text = 'نام کاربری یا رمز عبور شما اشتباه است';
            req.flash('error', req.session.icon);
            res.redirect('/authentication');
            return;
        };

        /* If there was a username then it goes to password with bcrypt package we compare the 
        password that user entered in input and the real password that user had entered earlier */
        const validPassword = await bcrypt.compare(password, user.password);

        // If it wasn't correct it flash error
        if (!validPassword) {
            req.session.icon = 'error';
            req.session.text = 'نام کاربری یا رمز عبور شما اشتباه است';
            req.flash('error', req.session.icon);
            res.redirect('/authentication');
            return;
        };

        // If all things goes well it flash success alert to user
        req.session.userId = user._id;
        req.session.icon = 'success';
        req.session.text = 'شما با موفقیت وارد حساب خود شدید';
        req.flash('success', req.session.icon);
        res.redirect('/');
    } catch (e) {
        req.session.icon = 'error';
        req.session.text = 'خطایی رخ داده است';
        req.flash('error', req.session.text);
        res.redirect('/authentication');
    };
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