const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    username : {
        type : mongoose.Schema.Types.ObjectId,ref:"user"
    },
    name : String,
    date : {
        type: Date,
        default : Date.now
    },
    content : String,
    likes : [{
        type : mongoose.Schema.Types.ObjectId,ref:"user"
    }
    ],
    dislikes : [{
        type : mongoose.Schema.Types.ObjectId,ref:"user"
    }
    ],
    postpic : {
        type : String,
        default : "default(1).gif"
    }
})

module.exports = mongoose.model("post",postSchema)