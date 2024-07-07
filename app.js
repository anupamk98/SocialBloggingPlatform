const express= require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const userModel = require('./models/user')
const postModel = require('./models/post')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const upload = require('./configs/multerconfig')
const app = express()

app.set("view engine","ejs")
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"public")))
app.use(cookieParser())

app.get("/signup",(req,res)=>{
    res.render("index")
})

app.get("/login",(req,res)=>{
    res.render("login")
})

app.post("/register",async (req,res)=>{
const {name, username, email, password} = req.body
const user= await userModel.findOne({email})
if(user) res.redirect("/")
else {
bcrypt.genSalt(10,(err,salt)=>{
    bcrypt.hash(password,salt,async (err,hash)=>{
       const newuser = await userModel.create({
            name,email,username,password:hash
        })
        let token =jwt.sign({email,userid:newuser._id},"shhhhh")
        res.cookie("token",token)
        res.redirect("/logfeed")
    })
})
}
})

app.post("/login",async (req,res)=>{
    const {email,password} = req.body
    const user= await userModel.findOne({email})
    if(user === null) res.redirect("/login")
    else {
    bcrypt.compare(password,user.password,(err,result)=>{
    if(result){
        let token =jwt.sign({email,userid:user._id},"shhhhh")
        res.cookie("token",token)
        res.redirect("/logfeed")
    }
    else res.redirect("/login")
    })
}
    })

app.get("/logout",(req,res)=>{
    res.cookie("token","")
    res.redirect("/")
})

app.get('/profile',isLoggedIn,async (req,res)=>{
const user = await userModel.findOne({email:req.user.email})
await user.populate("posts")
res.render("profile",{user})
})

app.post('/post',isLoggedIn,async (req,res)=>{
    const user = await userModel.findOne({email:req.user.email})
    const post = await postModel.create({
        username:user._id,
        name : user.name,
        content:req.body.content
    })
    user.posts.push(post._id)
    await user.save()
    res.redirect('/profile')
    })

app.get("/changeprofile",(req,res)=>{
    res.render("change")
})

app.post("/upload",isLoggedIn,upload.single('image'),async (req,res)=>{
let user = await userModel.findOne({email:req.user.email})
let s=req.file.filename 
user.profilepic = s
await user.save()
res.redirect("/profile")
})

app.post("/upload/:id",isLoggedIn,upload.single('image'),async (req,res)=>{
    let post = await postModel.findOne({_id:req.params.id})
    let s=req.file.filename
    post.postpic = s
    await post.save()
    res.redirect("/profile")
    })

app.get("/",async(req,res)=>{
    const posts = await postModel.find({})
    res.render("feed",{posts})
})

app.get("/logfeed", isLoggedIn, async(req,res)=>{
    const posts = await postModel.find({})
    res.render("logfeed",{posts})
})

app.get("/like/:id",isLoggedIn,async(req,res)=>{
let post = await postModel.findOne({_id:req.params.id})
await post.populate("username")
if(post.likes.indexOf(req.user.userid)===-1) {
post.likes.push(req.user.userid)
}
else { 
    post.likes.splice(post.likes.indexOf(req.user.userid),1)
}
await post.save()
res.redirect("/logfeed")
})

app.get("/dislike/:id",isLoggedIn,async(req,res)=>{
    const post = await postModel.findOne({_id:req.params.id})
    await post.populate("username")
    if(post.dislikes.indexOf(req.user.userid)===-1) {
    post.dislikes.push(req.user.userid)
    }
    else {
        post.dislikes.splice(post.dislikes.indexOf(req.user.userid),1)
    }
    await post.save()
    res.redirect("/logfeed")
    })


app.get("/delete/:id",isLoggedIn,async(req,res)=>{
await postModel.findOneAndDelete({_id:req.params.id});
res.redirect("/profile")
})

app.get("/edit/:id",isLoggedIn,async(req,res)=>{
    const post = await postModel.findOne({_id:req.params.id})
    res.render("feededit",{post})
    })

app.post("/edit/:id",isLoggedIn, async(req,res)=>{
await postModel.findOneAndUpdate({_id:req.params.id},{content:req.body.content})
res.redirect("/profile")
})

app.get("/view/:id",isLoggedIn,async(req,res)=>{
    const post= await postModel.findOne({_id:req.params.id})
    await post.populate("username")
    const user = await userModel.findOne({_id:post.username})
    await user.populate("posts")
    res.render("userprofile",{user})
})

function isLoggedIn(req,res,next) {
    if((req.cookies.hasOwnProperty('token') && req.cookies.token === "") || 
    !req.cookies.hasOwnProperty('token')) res.redirect("/login")
    else {
let data = jwt.verify(req.cookies.token,"shhhhh")
req.user = data
next()
}
}

app.listen(3000)