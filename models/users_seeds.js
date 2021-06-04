const mongoose = require('mongoose');
// const { getMaxListeners } = require('node:process');
const uri = `mongodb+srv://jivesh_2003:JiveshGupta@20@cluster0.7wh6p.mongodb.net/Database1?retryWrites=true&w=majority`

var count=0;
var connected=0;
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


const users= require('./users');

const user0= new users({
    name: 'xyz1',
    uname: 'xxyyzz',
    email: 'xyz@gmail.com',
    password: 'xxyyzz',
    phone: '1234567890'
});
user0.save()
    .then(user0 =>{
        console.log(user0);
    })
    .catch(err=> {
        console.log(err);
    });
    console.log('qwerty');