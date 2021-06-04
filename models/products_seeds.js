const mongoose = require('mongoose');
// const { getMaxListeners } = require('node:process');
const uri = `mongodb+srv://jivesh_2003:JiveshGupta@20@cluster0.7wh6p.mongodb.net/Database1?retryWrites=true&w=majority`

var count = 0;
var connected = 0;
mongoose
    .connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    }, { autoReconnect: true })
    .then(() => { console.log('Connected With Database'); connected = 1; })
    .catch((err) => {
        console.log('Not Connected With Database');
        count++;
        console.log('trying to connect' + count + 'times');

        console.log(err);
    });


const products = require('./products');

const product0 = new products({
    authorName: 'xyz',
    authorEmail: 'xyz',
    authorPhone: '123',
    productType: 'vehicle',
    image: '',
    price: 123,
    productName: 'cycle',
    productDescription: 'product description',
    isAvailable: true
});
product0.save()
    .then(product0 => {
        console.log(product0);
    })
    .catch(err => {
        console.log(err);
    });
console.log('qwerty1');