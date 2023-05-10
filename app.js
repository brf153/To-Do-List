const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const bcrypt = require("bcrypt")

const app = express();

//Middlewares
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(path.resolve(),"public")))
app.use(express.json())
app.set("viewport","ejs")

//Database setup
mongoose.connect("mongodb://127.0.0.1:27017",
    {dbName:"user_authentication"}
)
.then(()=>console.log("Database connected"))
.catch((e)=>console.log(e))

const Schema = new mongoose.Schema({
    name: String,
    email:String,
    password: String,
})

const User = mongoose.model("User",Schema)

//Database setup 2
mongoose.connect("mongodb://127.0.0.1:27017",
{dbName:"Task"}
)

const taskSchema = new mongoose.Schema({
    task: String,
})

const Task = mongoose.model("task",taskSchema)


//Routes
app.get("/",(req,res)=>{
    res.render("login.ejs")
})

app.post("/login",async (req,res)=>{
    const {email,password} = req.body

    const user = await User.findOne({email})
    if(!user) return res.redirect("/register")

    const match = await bcrypt.compare(password, user.password)
    if(!match){
        return res.render("login.ejs",{email,message:"Incorrect Password"})
    }
    else{
        return res.redirect("/todo")
    }
})

app.get("/login",(req,res)=>{
    res.render("login.ejs")
})

app.get("/todo",async (req,res)=>{
    const tasks = await Task.find({})
    const taskList = await tasks.map((e) => {return e.task})

    // let taskListVertical = ``;
    // for(i=0;i<taskList.length;i++){
    //     taskListVertical += `<li>${taskList[i]}</li>`
    // }

    res.render("todo.ejs",{taskList})
})

app.get("/register",(req,res)=>{
    res.render("register.ejs")
})

app.post("/register",async (req,res)=>{
    const {name,email,password} = req.body

    const hashedPassword = await bcrypt.hash(password,10)

    await User.create({
        name,email,
        password: hashedPassword
    })

    res.redirect("/login")
})

app.post("/todo",async (req,res)=>{
    const {task} = req.body
    Task.create({
        task
    })

    res.redirect("/todo")
})

app.listen(4000,()=>{
    const url = "http://localhost:4000/"
    console.log("Server is working on port 4000")
    console.log(`url: ${url}`)
})