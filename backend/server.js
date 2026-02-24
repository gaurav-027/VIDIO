import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/userRoutes.js";

const db_url="mongodb+srv://krgauravbca7_db_user:JnZuL2uDzMmeeS27@cluster0.sxuiyny.mongodb.net/?appName=Cluster0"

const app=express();
const server=createServer(app);
const io=connectToSocket(server);

app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}));


async function main(){
    await mongoose.connect(db_url);
}

main().then(()=>{
    console.log("Database bhi mil gya");
}).catch((err)=>{
    console.log("Ruk kuchh dikkkat hai",err);   
});

app.use("/users",userRoutes);

app.get("/",(req,res)=>{
    res.send("Hello Buddy");
})

server.listen(8080,()=>{
    console.log("Chalu hai server,Sab badhiya 👍🏻");
})