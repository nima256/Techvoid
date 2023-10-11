const mongoose = require('mongoose');
const Product = require('./models/product');
require('dotenv').config();

mongoose.connect(process.env.MONGO_CONNECTION)
    .then(() => {
        console.log('Mongo connection open');
    })
    .catch((e) => {
        console.log(e);
    });

const productSeeds = [
    {
        name: 'مبل هفت رنگ',
        price: 200,
        category: 'sofa',
        img: 'assets/images/market-01.jpg'
    },
    {
        name: 'میز هفت رنگ',
        price: 300,
        category: 'desk',
        img: 'assets/images/market-01.jpg'
    },
    {
        name: 'چراغ',
        price: 400,
        category: 'lamp',
        img: 'assets/images/market-01.jpg'
    },
    {
        name: 'مبل شیش رنگ',
        price: 4000,
        category: 'sofa',
        img: 'assets/images/market-01.jpg'
    },
    {
        name: 'میز شیش رنگ',
        price: 6000,
        category: 'desk',
        img: 'assets/images/market-01.jpg'
    },
    {
        name: 'چراغ شب خواب',
        price: 8000,
        category: 'lamp',
        img: 'assets/images/market-01.jpg'
    }
];

Product.insertMany(productSeeds)
    .then(p => {
        console.log(p);
    })
    .catch(e => {
        console.log(e);
    });