const mongoose = require('mongoose');
const users = require('./users');
const chatsSchema = mongoose.Schema({
    p1:{
        type: String
        // type: mongoose.Schema.Types.ObjectId, ref: 'users'
    },
    p2:{
        type: String
        // type: mongoose.Schema.Types.ObjectId, ref: 'users'
    },
    chat:[{
        sender: {
            type: String
        },
        msg:{
            type: String
        },
        time: {
            type: Date
        }
    }],
        time: {
            type: Date
        }
});

const chats= mongoose.model('chats', chatsSchema);
module.exports = chats;