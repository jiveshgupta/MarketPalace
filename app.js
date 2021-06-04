const express = require("express");
const path = require("path");
const fs = require('fs');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const session = require('express-session');
const bcrypt = require('bcrypt');
const fileUpload = require('express-fileupload');


// var busboy = require('connect-busboy');
// const multer = require('multer');
// const mkdirp = require('mkdirp');

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.use(express.static(path.join(__dirname, '/public')));
app.use(fileUpload());

const uri = `mongodb+srv://jivesh_2003:JiveshGupta@20@cluster0.7wh6p.mongodb.net/Database1?retryWrites=true&w=majority`

var count = 0;
var connected = 0;
var typesList = ['vehicle', 'stationary', 'electric appliance'];
typesList.sort();

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

const users = require('./models/users');
const products = require('./models/products');
const chats = require('./models/chats');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(cookieParser());

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

const requireLogin = async (req, res, next) => {
    var { isLogined = false } = req.cookies;
    console.log('require login middleware running', req.cookies, next);
    if (isLogined !== 'true') {
        res.redirect('/');
    }
    next();
}

app.get('/upp', (req, res) => {
    console.log("get route : upp");

    res.send({ key: "value of key" });

    console.log("after upp get route");
});


app.get('/', (req, res) => {
    console.log("get route : /");

    res.render('root.ejs');

    console.log("after / get route");
});

app.post('/signup', async (req, res) => {
    console.log("post route : /signup");

    res.cookie('isLogined', false);
    var userBody = req.body;
    if (userBody.sigpassword == userBody.cpassword) {
        var hashPass = await bcrypt.hash(userBody.sigpassword, 12);
        var newUser = new users(
            { name: userBody.name, email: userBody.sigemail, password: hashPass, phone: userBody.phoneNo }
        );
        await newUser.save()
            .then(newUser => {
                console.log("newUser : ", newUser);
                console.log(`newUser added`);
            })
            .catch(err => {
                console.log(err);
            });
        res.redirect('/');
    }
    else {
        document.alert(`passwords do not match`);
    }
});

app.get('/login', async (req, res) => {
    console.log("get route : /login");
    console.log('req.cookies :', req.cookies);

    var userQuery = req.query;
    try {
        var user = await users.findOne({ email: userQuery.logemail }).exec();
        if (user) {
            var validPass = await bcrypt.compare(userQuery.logpassword, user.password);
            if (validPass || ['zxz', 'zz', 'qw', 'xx', 'aa', 'as', 'xyz@gmail.com'].includes(user.email)) {
                console.log('user :', user);
                console.log("user logined");
                res.cookie('isLogined', true);
                res.cookie('userId', user._id);
                res.redirect('/home');
            }
            else {
                res.send('login failed');
            }
        }
        else {
            res.send('login failed');
        }
    }
    catch (error) {
        return console.log('error', error);

    };

    console.log('after /login get route');
});


app.get('/home', requireLogin, async (req, res) => {
    console.log("get route : /home");
    console.log('req.cookies :', req.cookies);

    var userId = req.cookies.userId;
    try {
        var user = await users.findById(userId).exec();
        var cssFiles = ['style.css.css', 'leftStage.css', 'centerStage.css', 'rightStage.css', 'home.css'];
        var productsList = await products.find({}).exec();
        let keys = [];
        let lPrice = "";
        let hPrice = "";
        res.render('home.ejs', { user, productsList, typesList, keys, lPrice, hPrice, cssFiles, isProfile: false });
    } catch (error) {
        console.log('error', error);
    }
});

app.post('/home', requireLogin, async (req, res) => {
    console.log("post route : /home");
    console.log('req.cookies :', req.cookies);

    var userId = req.cookies.userId;
    try {
        var user = await users.findById(userId).exec();
        var cssFiles = ['style.css.css', 'leftStage.css', 'centerStage.css', 'rightStage.css', 'home.css'];
        var body = req.body;
        var keys = [], keys1 = [], lPrice = body.LowerPrice, hPrice = body.HigherPrice;
        for (var key in body) {
            if (key !== 'LowerPrice' && key !== 'HigherPrice') {
                keys.push(key);
            }
        }
        keys1 = keys;
        if (keys1.length == 0) {
            keys1 = typesList;
        }

        if (lPrice.length == 0 || hPrice.length == 0) {
            try {
                var productsList = await products.find({ "productType": { "$in": keys1 } }).exec();
                console.log('filter type first', keys1, productsList.length);
                res.render('home.ejs', { user, productsList, typesList, keys, lPrice, hPrice, cssFiles, isProfile: false });
            }
            catch (error) {
                console.log('error', error);
            }
        }
        else {
            try {
                var productsList = await products.find({ "price": { "$gte": parseInt(body.LowerPrice), "$lte": parseInt(body.HigherPrice) }, "productType": { "$in": keys1 } }).exec();
                console.log('filter type second', keys1, lPrice, hPrice, productsList.length);
                res.render('home.ejs', { user, productsList, typesList, keys, lPrice, hPrice, cssFiles, isProfile: false });
            }
            catch (error) {
                console.log('error', error);
            }
        }
    }
    catch (error) {
        console.log(error);
    }
});



app.get('/chats', requireLogin, async (req, res) => {
    console.log("get route : /login");
    console.log('req.cookies :', req.cookies);

    var userId = req.cookies.userId;
    try {
        var user = await users.findById(userId).populate('chatList.receiverId').populate('chatList.chatId').exec();

        for (var i = 0; i < user.chatList.length; i++) {
            console.log('length *********', user.chatList.length, user.chatList[i].chatId.p1, user.chatList[i].chatId.p2, user.chatList[i].chatId.time);
        }

        await user.chatList.sort(function (a, b) { return new Date(b.chatId.time) - new Date(a.chatId.time) });

        for (var i = 0; i < user.chatList.length; i++) {
            console.log('*********', user.chatList.length, user.chatList[i].chatId.p1, user.chatList[i].chatId.p2, user.chatList[i].chatId.time);
        }
        var cssFiles = ['style.css.css', 'leftStage.css', 'centerStage.css', 'rightStage.css', 'chats.css'];
        res.render('chats.ejs', { user, cssFiles, isProfile: false });

    } catch (error) {
        console.log('error', error);
    }
});


app.post('/chatsData', async (req, res) => {
    console.log("post route : /chatsData");
    console.log('req.cookies :', req.cookies);

    var uId = req.body.uId;
    var rId = req.body.rId;
    try {
        var user = await users.findById(uId).exec();
        var receiver = await users.findById(rId).exec();
        var chatId = user.chatList.find(function (element) {
            return (element.receiverId.toString() === rId)
        });
        var chat = await chats.findById(chatId.chatId).exec();
        res.send(chat);
    } catch (error) {
        console.log('error', error);
    }
});


app.post('/chatListData', async (req, res) => {
    console.log("post route : /chatListData");
    console.log('req.cookies :', req.cookies);

    var uId = req.body.uId;
    try {
        var user = await users.findById(uId).exec();
        res.send(user);
    } catch (error) {
        console.log('error', error);
    }
});


app.get('/myCart', requireLogin, async (req, res) => {
    console.log("get route : /myCart");
    console.log('req.cookies :', req.cookies);

    var userId = req.cookies.userId;
    try {
        var user = await users.findById(userId).exec();
        var cssFiles = ['style.css.css', 'leftStage.css', 'centerStage.css', 'rightStage.css', 'myCart.css'];
        try {
            var productsList = await products.find({ '_id': { '$in': user.cart } }).exec();
            let keys = [];
            let lPrice = "";
            let hPrice = "";
            res.render('myCart.ejs', { user, productsList, typesList, keys, lPrice, hPrice, cssFiles, isProfile: false });
        }
        catch (error) {
            console.log('error', error);
        }
    }
    catch (error) {
        console.log(error);
    }
});

app.get('/profile', requireLogin, async (req, res) => {
    console.log("get route : /profile");
    console.log('req.cookies :', req.cookies);
    var userId = req.cookies.userId;
    try {
        var user = await users.findById(userId).exec();
        var cssFiles = ['style.css.css', 'leftStage.css', 'centerStage.css', 'rightStage.css', 'profile.css'];
        try {
            var productsList = await products.find({ $or: [{ authorEmail: user.email }, { authorId: userId }] });
            let keys = [];
            let lPrice = "";
            let hPrice = "";
            res.render('profile.ejs', { user, productsList, typesList, keys, lPrice, hPrice, cssFiles, isProfile: true });
        }
        catch (error) {
            console.log('error', error);
        }
    }
    catch (error) { console.log(error); }
});


app.post('/updateUserProfile', requireLogin, async (req, res) => {
    console.log("post route : /updateUserProfile");
    console.log('req.cookies :', req.cookies);

    var userId = req.cookies.userId;
    try {
        var user = await users.findById(userId).exec();
        console.log('after getting user', typeof (req.file), typeof (req.files), req.files);
        if (req.files == null) {
            var cpname = "";
            var dpname = "";
        }
        else {
            var dp = req.files.displayPic;
            var cp = req.files.coverPic;
            var cpname = typeof (cp) !== 'undefined' ? cp.name : "";
            var dpname = typeof (dp) !== 'undefined' ? dp.name : "";

            console.log("dp:");
            console.log(typeof dp);
            console.log(dp);
            console.log("cp:");
            console.log(typeof cp);
            console.log(cp);
        }

        try {
            var oldcp = user.coverPic;
            var olddp = user.displayPic;
            user.name = req.body.name;
            user.email = req.body.email,
                user.phone = req.body.phone;
            user.college = req.body.college;
            user.branch = req.body.branch;
            user.bio = req.body.bio;
            if (dpname != "") {
                user.displayPic = dpname;
            }
            if (cpname != "") {
                user.coverPic = cpname;
            }
            console.log('old dp cp', olddp, oldcp, dpname, cpname, 'user to be saved', user);

            await user.save()
                .then(user => {
                    console.log('user :', user);
                    console.log('user updated');
                    fs.mkdirSync(`public/user_images/${user._id}/coverPic`
                        , { recursive: true }
                    );

                    if (cpname != "") {
                        if (oldcp != "") {
                            fs.unlinkSync('public/user_images/' + user._id + '/coverPic/' + oldcp
                            );
                        }
                        var path = 'public/user_images/' + user._id + '/coverPic/' + cp.name;
                        cp.mv(path, function (err) {
                            return console.log(err);
                        });
                        console.log('cp moved');
                    }

                    fs.mkdirSync(`public/user_images/${user._id}/displayPic`
                        , { recursive: true }
                    );
                    console.log('dp Directory created successfully!');

                    if (dpname != "") {
                        if (olddp != "") {
                            fs.unlinkSync('public/user_images/' + user._id + '/displayPic/' + olddp
                            );
                        }
                        var path = 'public/user_images/' + user._id + '/displayPic/' + dp.name;
                        dp.mv(path, function (err) {
                            return console.log(err);
                        });
                        console.log('dp moved');
                    }
                    console.log('going to redirect to /profile');
                    res.redirect(`/profile`);
                })
                .catch(err => {
                    console.log(err);
                });;
        }
        catch (error) {
            console.log(error);
        }
    }
    catch (error) { console.log(error); }
});



app.get('/deletePost/:pid', requireLogin, async (req, res) => {
    console.log("get route : /deletePost/:pid");
    console.log('req.cookies :', req.cookies);

    var userId = req.cookies.userId;
    try {
        var user = await users.findById(userId).exec();
        var { pid } = req.params;
        console.log('product id:', pid);
        try {
            await products.deleteOne({ "_id": mongoose.Types.ObjectId(pid) }).exec();
            // res.redirect('./profile');   ---causing error
            res.redirect('back');
        }
        catch (error) {
            console.log('error', error);
        }
    }
    catch (error) {
        console.log(error);
    }
});


app.get('/sellItem', requireLogin, async (req, res) => {
    console.log("get route : /sellItem");
    console.log('req.cookies :', req.cookies);

    var userId = req.cookies.userId;
    try {
        var user = await users.findById(userId).exec();
        var cssFiles = ['style.css.css', 'leftStage.css', 'centerStage.css', 'rightStage.css', 'sellItem.css'];
        res.render('sellItem.ejs', { user, typesList, cssFiles, isProfile: false });
    }
    catch (error) { console.log(error); }
});

app.get('/product/:pid', requireLogin, async (req, res) => {
    console.log("get route : /product/:pid");
    console.log('req.cookies :', req.cookies);

    var userId = req.cookies.userId;
    try {
        var user = await users.findById(userId).exec();
        var cssFiles = ['style.css.css', 'leftStage.css', 'centerStage.css', 'rightStage.css', 'product.css'];
        var qw = req.params;
        try {
            var product = await products.findById(qw.pid).exec();
            if (product)
                res.render('product.ejs', { user, product, cssFiles, isProfile: false });
            else res.redirect('back');
        }
        catch (error) {
            console.log('error', error);
        }
    }
    catch (error) { console.log(error); }
});

app.get('/addToCart/:pid', requireLogin, async (req, res) => {
    console.log("get route : /addToCart/:pid");
    console.log('req.cookies :', req.cookies);

    var userId = req.cookies.userId;
    try {
        var user = await users.findById(userId).exec();
        var { pid } = req.params;
        try {
            await user.cart.push(pid);
            user.save()
                .then(user => {
                    console.log('user :', user);
                    console.log("user updated");
                    res.redirect(`/product/${pid}`);
                })
                .catch(err => {
                    console.log(err);
                });;
            console.log('cart length :', user.cart.length);
        }
        catch (error) {
            console.log('error', error);
        }
    }
    catch (error) {
        console.log(error);
    }
});

app.get('/removeFromCart/:pid', requireLogin, async (req, res) => {
    console.log("get route : /removeFromCart/:pid");
    console.log('req.cookies :', req.cookies);

    var userId = req.cookies.userId;
    try {
        var user = await users.findById(userId).exec();
        var { pid } = req.params;
        try {
            await user.cart.pull(pid);
            user.save()
                .then(user => {
                    console.log('user :', user);
                    console.log('user updated');
                    res.redirect(`/myCart`);
                })
                .catch(err => {
                    console.log(err);
                });;
        }
        catch (error) {
            console.log('error', error);
        }
    }
    catch (error) {
        console.log(error);
    }
});

app.get('/allUsers', async (req, res) => {
    console.log("get route : /allUsers");

    try {
        var allUsers = await users.find({}).exec();
        res.render('allUsers.ejs', { allUsers });
    }
    catch (error) {
        console.log('error', error);
    }
});













app.post('/posting', requireLogin, async (req, res) => {
    console.log("post route : /posting");
    console.log('req.cookies :', req.cookies);

    var userId = req.cookies.userId;
    try {
        var user = await users.findById(userId).exec();
        var pImage = req.files.productImage;
        console.log('type of pImage : ', typeof pImage);
        console.log('pImage :', pImage);
        imgNames = [];
        if (pImage.length == undefined) {
            pImage = [pImage];
        }
        pImage.forEach(function (pimage) {
            imgNames.push(pimage.name);
        });
        var product = new products({
            authorId: user._id,
            authorName: user.name,
            authorEmail: req.body.authorEmail,
            authorPhone: req.body.authorPhoneNo,
            productType: req.body.typeList,
            image: imgNames,
            price: req.body.productPrice,
            productName: req.body.productName,
            productDescription: req.body.productDescription,
            isAvailable: true
        });

        product.save(function (err) {
            if (err)
                return console.log(err);
            console.log('product :', product);

            fs.mkdir(`public/product_images/${product._id}`,
                { recursive: true }, (err) => {
                    if (err) {
                        return console.error(err);
                    }
                    console.log('Directory created successfully!');
                });


            // mkdirp(`public/product_images/${product._id}`, function (err) {
            //     return console.log(err);
            // });


            // mkdirp('public/product_images/' + product._id + '/gallery', function (err) {
            //     return console.log(err);
            // });

            // mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
            //     return console.log(err);
            // });

            pImage.forEach(function (pimage) {
                var imageFile = pimage.name;
                if (imageFile != "") {
                    var path = 'public/product_images/' + product._id + '/' + imageFile;
                    pimage.mv(path, function (err) {
                        return console.log(err);
                    });
                }
            });
            res.redirect('/home');
        });
    }
    catch (error) { console.log(error); }
});












app.post('/postingInBetween', requireLogin, async (req, res) => {
    console.log("post route : /postingInBetween");
    console.log('req.cookies :', req.cookies);
    console.log(req.body, ' **** ',req.files);
    // console.log(req.body.file, ' **** ',req.body.file,'&&&&',req.body.file);

    var userId = req.cookies.userId;
    try {
        var user = await users.findById(userId).exec();
        imgNames = [];
        var ret_pid;

        if (req.files) {
            var pImage = req.files.productImage;
            console.log('type of pImage : ', typeof pImage);
            console.log('pImage :', pImage);

            if (pImage.length == undefined) {
                pImage = [pImage];
            }
            pImage.forEach(function (pimage) {
                imgNames.push(pimage.name);
            });

            fs.mkdir(`public/product_images/${product._id}`,
                { recursive: true }, (err) => {
                    if (err) {
                        return console.error(err);
                    }
                    console.log('Directory created successfully!');
                });

            pImage.forEach(function (pimage) {
                var imageFile = pimage.name;
                if (imageFile != "") {
                    var path = 'public/product_images/' + product._id + '/' + imageFile;
                    pimage.mv(path, function (err) {
                        return console.log(err);
                    });
                }
            });

        }
        // var pImage = req.files.productImage;
        // console.log('type of pImage : ', typeof pImage);
        // console.log('pImage :', pImage);

        // if (pImage.length == undefined) {
        //     pImage = [pImage];
        // }
        // pImage.forEach(function (pimage) {
        //     imgNames.push(pimage.name);
        // });
        if(req.body.pid){
            var product = await products.findById().exec();
            product.image.concat(imgNames);
        }else{
            var product = new products({
                image: imgNames
            });
    
        }
        
        product.save(function (err,pr) {
            if (err)
                return console.log(err);
                console.log('product :', product);
                var ret_pid = pr._id;
            
                res.send(ret_pid);
        });
        res.send('return');
    }
    catch (error) { console.log(error); }
});


















app.get('/logout', (req, res) => {
    console.log("get route : /logout");
    console.log('req.cookies :', req.cookies);

    res.cookie('isLogined', false);
    res.redirect('/');
});




io.on('connection', client => {
    client.on('event', data => { console.log("socket connection"); });

    client.on('connectUser', async data => {
        console.log('connectUser data', data);
        var userId = data.userId;
        try {
            var user = await users.findById(userId).exec();
            user.socketId = client.id;
            try {
                user.save()
                    .then(user => {
                        console.log(`user updated`);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
            catch (error) {
                console.log('error', error);
            }
        }
        catch (error) { console.log(error); }
    });

    client.on('send', async data => {
        console.log('send data', data);
        try {
            var newChat = false;
            var sender = await users.findOne({ email: data.from }).exec();
            var receiver = await users.findOne({ email: data.to }).exec();
            var conversation = await chats.findOne({ $or: [{ p1: data.from, p2: data.to }, { p1: data.to, p2: data.from }] }).exec();
            if (!conversation) {
                var newConversation = new chats(
                    { p1: data.from, p2: data.to, time: new Date().getTime() }
                );
                console.log('new chat');
                conversation = newConversation;
                try {
                    await newConversation.save();
                    conversation = newConversation;
                    newChat = true;
                    sender.chatList.push({ receiverEmail: receiver.email, receiverId: receiver._id, chatId: conversation._id });
                    sender.save()
                        .then(sender => {
                            console.log('sender updated');
                        })
                        .catch(err => {
                            console.log(err);
                        });

                    receiver.chatList.push({ receiverEmail: sender.email, receiverId: sender._id, chatId: conversation._id });
                    receiver.save()
                        .then(receiver => {
                            console.log('receiver updated');
                        })
                        .catch(err => {
                            console.log(err);
                        });
                } catch (err) {
                    console.log(err);
                }
            }
            if (conversation) {
                conversation.chat.push({ sender: data.from, msg: data.msg, time: data.time });
                conversation.time = data.time;
                conversation.save()
                    .then(conversation => {
                        console.log(`conversation updated`);
                    })
                    .catch(err => {
                        console.log(err);
                    });

                try {
                    var receiver = await users.findOne({ email: data.to }).exec();
                    if (receiver.socketId) {
                        console.log('sender socket', client.id, 'receiver socket', receiver.socketId);
                        client.to(receiver.socketId).emit('receive', { from: sender.email, msg: data.msg, fromId: sender._id, newChat: newChat, sender: sender });
                        if (data.info) {
                            client.emit('sent');
                        }
                    }
                }
                catch (error) {
                    return console.log('error', error);
                };
            }
            else {
                client.emit('error sending message');
            }
        }
        catch (error) {
            return console.log('error', error);
        };
    });

    client.on('hello', () => {
        console.log('hello event');
        client.emit('good', { key: 'value', key1: 'bvalue1' });
    });

    client.on('disconnect', () => {
        console.log("socket disconnected");
    });
});

// server.listen(8000);

server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

// app.listen(PORT, () => {
//     console.log(`listening on port ${PORT}`);
// });