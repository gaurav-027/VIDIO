import bcrypt,{hash} from "bcrypt";
import mongoose from "mongoose";
import httpStatus from "http-status";
import { User } from "../models/userModel.js";
import { Meeting } from "../models/meetingModel.js";
import crypto from "crypto";
import { json } from "stream/consumers";

const register = async (req,res)=>{
    let {name,username,password}=req.body;

    try{
        const existingUser=await User.findOne({username});
        if(existingUser){
            return res.status(httpStatus.FOUND).json({message:"User already exists"});
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const newUser=new User({
            name:name,
            username:username,
            password:hashedPassword
        });
        await newUser.save();
        res.status(httpStatus.CREATED).json({message:"User Created"});
    }catch(e){
        return res.status(500).json({message:`something went wrong ${e}`});
    }
}

const login=async(req,res)=>{
    const {username,password}=req.body;
    if(!username || !password){
        return res.status(400).json({message:"Please Provide Details"});
    }
    try {
        const user= await User.findOne({username});
        if(!user){
            return res.status(httpStatus.NOT_FOUND).json({message:"User not found"});
        }
        if(await bcrypt.compare(password,user.password)){
            let token=crypto.randomBytes(20).toString("hex");
            user.token=token;
            await user.save();
            return res.status(httpStatus.OK).json({token:token,message:"Logged In Successfully"});
        }
        else{
            return res.status(httpStatus.UNAUTHORIZED).json({message:"Invalid User"})
        }
    } catch (e) {
        return res.status(500),json({message:`Something went wrong ${e}`});
    }
}

const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });
        const meetings = await Meeting.find({ user_id: user.username })
        res.json(meetings)
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token: token });

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        })

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" })
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}

const getProfile = async (req,res) => {
    const {token} = req.query;

    try {
        const user = await User.findOne({ token : token });

        if(!user){
            return res.status(httpStatus.UNAUTHORIZED).json({message:"Invalid token"});
        }

        return res.status(httpStatus.OK).json({
            user:{
                name:user.name,
                username:user.username
            }
        });
    } catch (error) {
        return res.status(500).json({message:`Something went wrong ${error}`});
    }
}


export {login,register,getUserHistory,addToHistory,getProfile};