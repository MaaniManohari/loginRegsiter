import express from "express";
import dotenv from "dotenv";
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
const app=express();
app.use(bodyParser.json());
app.use(cors());
dotenv.config();
//require('dotenv').config();
const PORT=process.env.PORT || 8080;
const URI =process.env.MONGODB_URI;
try{
    mongoose.connect(URI);
    console.log("Connected to MongoDB");
    
}catch(error){
    console.log(error);
}

const userSchema = new mongoose.Schema({
    name: String,
    birthday: Date,
    email: String,
    password: String
});
const User = mongoose.model('User', userSchema);


app.get("/",(req,res)=>{
    res.send("Hello");
});

app.post('/register', async (req, res) => {
    const { name, birthday, email, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt); 

       
        const newUser = new User({
            name,
            birthday,
            email,
            password: hashedPassword 
        });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});



app.post('/login', async (req, res) => { 
    const { email, password } = req.body;

    User.findOne({ email: email })
        .then(user => {
            if (user) {
                // Compare the hashed password with the provided password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        return res.status(500).json("An error occurred");
                    }
                    if (isMatch) {
                        res.json("Success");
                    } else {
                        res.json("Password is incorrect");
                    }
                });
            } else {
                res.status(404).json("User not found");
            }
        })
        .catch(err => {
            res.status(500).json("An error occurred");
        });
});


app.listen(PORT,()=>{
    console.log('server is running');
});