const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://anupamkug22:IRu4jq5C8ziv84Ep@cluster0.t03lnup.mongodb.net/')

const userSchema = mongoose.Schema({
    name : String,
    username : String,
    email : String,
    password : String,
    posts : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref:"post"
        }
    ],
    profilepic : {
        type : String,
        default : "user.jpg"
    }
})

module.exports = mongoose.model("user",userSchema)