
import express from "express";
import cors from "cors"
import mongoose from "mongoose";
import multer from "multer"
import path from 'path'
import { fileURLToPath } from 'url';
import 'dotenv/config'


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express()
const port = 4000;

const username = process.env.MONGO_USERNAME
const password = process.env.MONGO_PASSWORD

app.use(cors({
    origin: '*'
}))

mongoose.connect("mongodb+srv://"+username+":"+password+"@cluster0.tc8vtil.mongodb.net/blogs?retryWrites=true&w=majority&appName=Cluster0").then(() => app.listen(port, () => console.log("server started at port " + port)))

//SCHEMA

const infoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
})

const infoModel = mongoose.model("information", infoSchema, "info");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/getdata", async (req, res) => {
    const dataToSave = new infoModel(req.body);
    await dataToSave.save()
    res.json("Data Submitted")
});

app.get("/show",async (req,res) =>{
        const show = await infoModel.find()
        res.json(show)
})

app.delete("/deleteData", async (req, res) => {
    const deletedData = await infoModel.findByIdAndDelete(req.body.idToDelete);
    if (deletedData._id) res.json("Data Deleted");
  });

app.put("/editData", async (req , res)=>{
    const {id , name , email , message} = req.body;
    const editedData = await infoModel.findByIdAndUpdate(id,{
        name,email,message
    });
    if(editedData._id) res.json("Data Updated")
})

const blogSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    blog: {
        type: String,
        required: true,
    },
    file: {
        type: String,
        required: true
    },
})

const blogModel = mongoose.model("blog", blogSchema, "blogs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post("/getBlog" , upload.single('file') , (req , res)=>{
    // const blogToSave = blogModel(req.body);
    const {author , title , blog} = req.body
    const file = req.file.path;
    const dataToSave = new blogModel({author , title , blog ,file})
    dataToSave.save().then(() => res.json('Blog Added'))
})

app.get("/showBlogs",async (req,res) =>{
    const show = await blogModel.find()
    res.json(show)
})

app.get("/searchBlog", async(req , res)=>{
    const search = req.query.q
    // console.log(req.query.q)
    const searchTerm = await blogModel.find({$or:[{author : search},{title : search}]})
    res.json(searchTerm)
})