const mongoose = require('mongoose');
const productsSchema = mongoose.Schema({
    authorId:{
        type: String
    }
    ,authorName:{
        type: String
    },
    authorEmail:{
        type: String
    },
    authorPhone:{
        type: String
    },
    productType:{
        type: String
    },
    image:[{
        type: String
    }],
    price:{
        type: Number
    },
    productName:{
        type: String
    },
    productDescription:{
        type: String
    },
    isAvailable:{
        type: Boolean,
        default: true
    }
});

const products= mongoose.model('products', productsSchema);
module.exports = products;