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
const Product = require('./models/product');

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
    res.locals.user = await User.findById(req.session.userId);
    res.locals.carts = req.session.carts;
    next();
});

// For redirect user that are not logged in
const isLoggedIn = (req, res, next) => {
    /* When a user register or login to website we add a userId to session if it doesn't exsist
    it means that user is not logged in so we redirect it to /authentication route */
    if (!req.session.userId) {
        req.session.icon = 'error';
        req.session.text = 'ابتدا در سایت ما عضو شوید';
        req.flash('error', req.session.text);
        return res.redirect('/authentication');
    };
    next();
}

// Create home route
app.get('/', async (req, res) => {
    const products = await Product.find({}).limit(4);
    res.render('index', { products });
});

// Create authentication route
app.get('/authentication', (req, res) => {
    res.render('authentication');
});

/* Create some common route that are for registering and log in user and when user type them
in url they will redirect the route that is in our website */
app.get('/register', (req, res) => {
    res.redirect('/authentication');
});
app.get('/login', (req, res) => {
    res.redirect('/authentication');
});
app.get('/signin', (req, res) => {
    res.redirect('/authentication');
});
app.get('/signup', (req, res) => {
    res.redirect('/authentication');
});

// Create authentication register api
app.post('/api/authentication/register', async (req, res) => {
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
            res.redirect('/authentication');
            return;
        };
        /* In this condition if user didn't enter password or username or etc it says error and says
        you must fill them */
        if (!password || !username || !email || !confirmPassword) {
            req.session.icon = 'error';
            req.session.text = 'نام کاربری یا رمز عبور یا تکرار رمز عبور یا ایمیل وارد نشده است';
            req.flash('error', req.session.text);
            res.redirect('/authentication');
            return;
        };
        /* Here if the username is lower than 8 character it says error that you have to type username
        that has 8 character */
        if (username.length < 8) {
            req.session.icon = 'error';
            req.session.text = 'نام کاربری باید بیشتر از 8 کاراکتر باشد';
            req.flash('error', req.session.text);
            res.redirect('/authentication');
            return;
        };
        // This condition check if the username variable matches the regular expression specified in the regex
        if (!regex.test(username)) {
            req.session.icon = 'error';
            req.session.text = 'نام کاربری شما باید شامل حروف انگلیسی و اعداد باشد و نباید فاصله بین آن ها باشد';
            req.flash('error', req.session.text);
            res.redirect('/authentication');
            return;
        }
        /* Here if the password is lower than 8 character it says error that you have to type password
        that has 8 character */
        if (password.length < 8) {
            req.session.icon = 'error';
            req.session.text = 'رمز عبور باید بیشتر از 8 کاراکتر باشد';
            req.flash('error', req.session.text);
            res.redirect('/authentication');
            return;
        };
        // This condition check if the password variable matches the regular expression specified in the regex
        if (!regex.test(password)) {
            req.session.icon = 'error';
            req.session.text = 'رمز عبور  شما باید شامل حروف انگلیسی و اعداد باشد و نباید فاصله بین آن ها باشد';
            req.flash('error', req.session.text);
            res.redirect('/authentication');
            return;
        };
        /* In this condition if the password doesn't match with the confirmPassword it flash error
        that says your password must match with the first password that you entered */
        if (password !== confirmPassword) {
            req.session.icon = 'error';
            req.session.text = 'رمز عبور شما با تکرار آن همخوانی ندارد';
            req.flash('error', req.session.text);
            res.redirect('/authentication');
            return;
        };
        // The emailValidator is a package that help you that check the email that a email is correct or not
        if (!emailValidator.validate(email)) {
            req.session.icon = 'error';
            req.session.text = 'ایمیل شما معتبر نیست';
            req.flash('error', req.session.text);
            res.redirect('/authentication');
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

// Create authentication login api
app.post('/api/authentication/login', async (req, res) => {
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

// Logout route
app.post('/api/logout', isLoggedIn, (req, res) => {
    /* We set userId to null that when user logged out she/he can't access the pages that you have to
    be logged in */
    req.session.userId = null;
    req.session.carts = null;
    req.session.icon = 'success';
    req.session.text = 'شما با موفقیت از حساب خود خارج شدید';
    req.flash('success', req.session.text);
    res.redirect('/');
});

// Create products route
app.get('/products', async (req, res) => {
    const products = await Product.find({});
    res.render('explore', { products });
});

// Create products info route
app.get('/productInfo/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // find product from that id
        const product = await Product.findById(id);
        console.log(product);
        res.render('details', { product });
    } catch (e) {
        if (e.message.includes("Cast to ObjectId failed")) {
            req.session.icon = 'error';
            req.session.text = 'محصول یافت نشد';
            req.flash('error', req.session.text);
            res.redirect('/');
            return;
        };
        req.session.icon = 'error';
        req.session.text = 'خطایی رخ داده است';
        req.flash('error', req.session.text);
        res.redirect('/');
    };
});

// Create cart info route
app.get('/cart', isLoggedIn, (req, res) => {
    res.render('cart', { carts: req.session.carts });
});

app.get('/cart/add/:id', isLoggedIn, async (req, res) => {
    try {
        // Give product id to add it in cart:
        const { id } = req.params;
        // Find that product:
        const product = await Product.findById(id);
        // If it doesn't exsist:
        if (!product) {
            req.session.icon = 'error';
            req.session.text = 'محصول درخواستی شما یافت نشد';
            req.flash('error', req.session.text);
            res.redirect('back');
            return;
        };
        /*  For adding a product to cart we need a session because we have to use it in ejs for rendering it we need to create a variable 
            and we set the value of it req.session.carts
         */
        if (!req.session.carts) {
            // So now if it doesn't exsist we create a array of it
            req.session.carts = [];
            /*  Now when we found that product that user click on add to product now we have it's id name and etc 
                we set id name and etc and set it exactly as same as the product information and we push it inside the req.session.carts array
            */
            req.session.carts.push({
                id: product._id,
                name: product.name,
                price: product.price,
                category: product.category,
                img: product.img,
                qty: 1,
            });

            // Now if the req.session.carts exsist it means that user has a product in his cart and wants to add another product 
        } else {

            // Now there is another condition that if the product that the user is adding is the same product or not

            // We save req.session.carts in a variable to we will make our code shorter
            let cart = req.session.carts;
            // And then we create a bool to see if there is a repeatedly product or not
            let newItem = true;

            // We create a loop by the cart.length
            for (let i = 0; i < cart.length; i++) {
                /* Maybe it would be hard to undrestand we are checking all the products id that are added to the cart if they are 
                   the same as the earlier one insted of adding another one we add one to their qty and the qty in cart would be 2 or 
                   as many as user click on add to cart button */

                if (cart[i].id == id) {
                    cart[i].qty++;
                    // After that we will set newItem to false
                    newItem = false;
                    break;
                };
            };

            // Now if it wasn't false it means that user doesn't clicks on a repeatedly product so we push another product in the cart array
            if (newItem) {
                cart.push({
                    id: product._id,
                    name: product.name,
                    price: product.price,
                    category: product.category,
                    img: product.img,
                    qty: 1,
                });
            };
        };

        req.session.icon = 'success';
        req.session.text = 'محصول به سبد خرید اضافه شد';
        req.flash('error', req.session.text);
        res.redirect('back');
    } catch (e) {
        req.session.icon = 'error';
        req.session.text = 'خطایی رخ داده است';
        req.flash('error', req.session.text);
        res.redirect('back');
    };
});

app.get('/cart/update/:id', isLoggedIn, async (req, res) => {
    try {
        // Get the id of the product that the user wants to update
        const { id } = req.params;
        // Get the action from the query, which must be "add", "remove", or "clear"
        const { action } = req.query;
        // Get the cart from the session
        const cart = req.session.carts;

        // Loop through the cart to find the specific product
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].id == id) {
                // Handle the action based on "add", "remove", or "clear"
                switch (action) {
                    case "add":
                        cart[i].qty++;
                        break;
                    case "remove":
                        cart[i].qty--;
                        break;
                    case "clear":
                        cart.splice(i, 1);
                        if (cart.length === 0) {
                            delete req.session.carts;
                        }
                        break;
                    default:
                        req.session.icon = 'error';
                        req.session.text = 'خطار در آپدیت سبد خرید شما';
                        req.flash('error', req.session.text);
                        break;
                }
            }
            if (cart[i].qty <= 0) {
                cart.splice(i, 1);
            }
        }
        req.session.icon = 'success';
        req.session.text = 'سبد خرید شما آپدیت شد';
        req.flash('success', req.session.text);
        res.redirect('/cart');
    } catch (e) {
        if (e.message.includes("Cannot read properties of undefined (reading 'qty')")) {
            req.session.icon = 'success';
            req.session.text = 'سبد خرید شما آپدت شد';
            req.flash('success', req.session.text);
            res.redirect('/cart');
            return;
        }
        req.session.icon = 'error';
        req.session.text = e;
        req.flash('error', req.session.text);
        res.redirect('back');
    }
});

// Create authors route
app.get('/authors', (req, res) => {
    res.render('authors');
});

// Create server in 3000 port
app.listen(port, () => {
    console.log("Listening to port 3000");
});