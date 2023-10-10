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
app.use(express.static('public'));

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

// create local variable to access them in all pages 
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
    const { email, username, password, confirmPassword } = req.body;
    const exsistUser = await User.findOne({ username });
    const regex = /^[a-zA-Z0-9]+$/;
    if (!password || !username || !email || confirmPassword) {
        req.session.icon = 'error';
        req.session.text = 'نام کاربری یا رمز عبور یا ایمیل وارد نشده است';
        req.flash('error', req.session.text);
        res.redirect('/authenication');
        return;
    };
    if (username.length < 8) {
        req.session.icon = 'error';
        req.session.text = 'نام کاربری باید بیشتر از 8 کاراکتر باشد';
        req.flash('error', req.session.text);
        res.redirect('/authenication');
        return;
    };
    if (!regex.test(username)) {
        req.session.icon = 'error';
        req.session.text = 'نام کاربری شما باید شامل حروف انگلیسی و اعداد باشد و نباید فاصله بین آن ها باشد';
        req.flash('error', req.session.text);
        res.redirect('/authenication');
        return;
    }
    if (password.length < 8) {
        req.session.icon = 'error';
        req.session.text = 'رمز عبور باید بیشتر از 8 کاراکتر باشد';
        req.flash('error', req.session.text);
        res.redirect('/authenication');
        return;
    };
    if (!regex.test(password)) {
        req.session.icon = 'error';
        req.session.text = 'رمز عبور  شما باید شامل حروف انگلیسی و اعداد باشد و نباید فاصله بین آن ها باشد';
        req.flash('error', req.session.text);
        res.redirect('/authenication');
        return;
    };
    if (password !== confirmPassword) {
        req.session.icon = 'error';
        req.session.text = 'رمز عبور شما با تکرار آن همخوانی ندارد';
        req.flash('error', req.session.text);
        res.redirect('/authenication');
        return;
    };
    if (!emailValidator.validate(email)) {
        req.session.icon = 'error';
        req.session.text = 'ایمیل شما معتبر نیست';
        req.flash('error', req.session.text);
        res.redirect('/authenication');
        return;
    };
    if (exsistUser) {
        req.session.icon = 'error';
        req.session.text = 'نام کاربری شما قبلا در سایت ثبت شده است';
        req.flash('error', req.session.text);
        res.redirect('/authenication');
        return;
    };

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    const user = new User({ username, password: hash, email });
    await user.save();

    req.session.userId = user._id;
    req.session.icon = 'success';
    req.session.text = 'حساب شما با موفقیت ساخته شد';
    req.flash('success', req.session.text);
    res.redirect('/');
});

// Create authenication login api
app.post('/api/authenication/login', (req, res) => {
    res.send('login post route');
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