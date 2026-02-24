import { createContext, useContext, useState } from "react";
import httpStatus from "http-status";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({});

const client=axios.create({
    baseURL : "http://localhost:8080/users"
})

export const AuthProvider=({children})=>{
    const authContext = useContext(AuthContext);
    
    const [userData,setUserData]=useState(authContext);

    const router=useNavigate();

    const handleRegister = async (name,username,password)=>{
        try {
            let request=await client.post("/register",{
                name:name,
                username:username,
                password:password
            })

            if(request.status === httpStatus.CREATED){
                return request.data.message;
            };
        } catch (error) {
            console.log(error)
        }
    }

    const handleLogin =async (username,password)=>{
        try {
            let request=await client.post("/login",{
                username:username,
                password:password
            });

            if(request.status===httpStatus.OK){
                   return localStorage.setItem("token",request.data.token) , request.data.message, router('/');
            }
            } catch (error) {
                console.log(error)
        }
    }
    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/get_all_activity", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data
        } catch
         (err) {
            throw err;
        }
    }

    const addToUserHistory = async (meetingCode) => {
        try {
            let request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
            return request
        } catch (e) {
            throw e;
        }
    }

    const profileDisplay = async () => {
        try {
            let request = await client.get("/getProfile", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data
        } catch
         (err) {
            throw err;
        }
    }

    const data={
        userData,setUserData,handleRegister,handleLogin,getHistoryOfUser,addToUserHistory,profileDisplay
    }

    return(
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}