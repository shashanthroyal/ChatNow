import express from 'express';
import User from '../models/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = express.Router();

router.post("/register",async(req , res) =>{
    try{
        const { username , email , password} = req.body;
        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = new User({username , email , password: hashedPassword})
        await newUser.save();

        res.status(201).json({message: "User registered successfully"});
    }catch (err){
        res.status(409).json({message: "User Already Existed"}); 
    }
})

router.post("/login", async(req,res) =>{
    try {
        const { email , password} = req.body;

        const user = await User.findOne({email});
        if (!user)return res.status(404).json({error: "User not found"})

        const isMatch = await bcrypt.compare(password , user.password);
        if (!isMatch)return res.status(400).json({error: "Invalid Credentials"});

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        const token = jwt.sign({id: user._id} , process.env.JWT_SECRET , {
            expiresIn: "1d",
        })

        res.json({token, user: {id: user._id, username: user.username , email: user.email }})
        
    } catch (error) {
        res.status(500).json({error: error.message})
        
    }
})




router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
