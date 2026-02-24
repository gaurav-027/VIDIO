import * as React from 'react'
import '../App.css';
import ReplyAllRoundedIcon from '@mui/icons-material/ReplyAllRounded';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { AuthContext } from '../contexts/Authcontext.jsx';
import { ToastContainer, toast } from 'react-toastify';
import FuzzyText from '../components/FuzzyText.jsx';

export default function Authentication() {

    useGSAP(()=>{
        gsap.from('.imageContainer',{
            x:-50,
            duration:1,
            opacity:0.5,
        })
        gsap.from('.formContainer',{
            x:50,
            duration:1,
            opacity:0.5,
        })
        gsap.from('.form',{
            duration:1,
            opacity:0.5,
            scale:0.9
        })
        gsap.from('.head',{
            x:100,
            duration:1,
            opacity:0.5,
        })
    })

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [formState,setFormState]=React.useState("login");
    const [message,setMessage]=React.useState("");
    const [error, setError] = React.useState();

   const flip=()=>{
        setFormState(formState=="login" ? "register" : "login");
   }

   const {handleRegister,handleLogin}=React.useContext(AuthContext);

   const handleAuth=async()=>{
        try {
            if(formState==="login"){
                let result=await handleLogin(username,password);
                console.log(result);
                setMessage(result);
                toast.success(message);
            }
            if(formState==="register"){
                let result=await handleRegister(name,username,password);
                console.log(result);
                setMessage(result);
                setFormState("login");
                setPassword("");
                toast.success("Sign in");
            }
        } catch (error) {
            console.log(err);
            let message = (err.response.data.message);
            setError(message);
            toast.error("Something Went Wrong..!!");
        }
   }


  return (
    <div className="authContainer">
        <div className="imageContainer">
            <FuzzyText 
  baseIntensity={0.2}
  hoverIntensity={0.5}
  enableHover
>
  VIDIO
</FuzzyText>
        </div>
        <div className="formContainer section">
           <div className="head">
            {formState=="login" ? <p>LogIn</p> : <p>SignUp</p>}
           </div>
                <div className="form">
                    <p style={{fontSize:"2rem"}}>{formState=="login" ?  "Welcome Back..!" : "Welcome to Vidio..!"}</p>
                    {formState=="register" ? <input 
                        type="text" 
                        placeholder="Enter Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    /> : ""}
                    <input 
                        type="text" 
                        placeholder="Enter Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button onClick={handleAuth}>{formState=="login" ? "LogIn" : "SignUp"}</button>
                    <div className="loginFooter">
                        {formState=="login" ? <p>Don't have an Account?</p> :<div onClick={flip} className="signupFooter">
                            <ReplyAllRoundedIcon fontSize='large' />
                        </div> }
                        {formState=="login" ? <p> <span id='span' onClick={flip}>Register</span>  Here</p> : ""}
                    </div>
                </div>
            </div>
            <ToastContainer/>
        </div>
    )
}
