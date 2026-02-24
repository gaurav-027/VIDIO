import React, { useRef } from 'react';
import "../styles/Landing.css"
import {useNavigate} from 'react-router-dom'
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Navbar from './Navbar';
import {isAuthenticated} from "../utils/withAuth.jsx"
import Demo from './Back.jsx'


export default function LandingPage(){
    // useGSAP(()=>{
    //     gsap.from('.content',{
    //         y:100,
    //         duration:1,
    //         opacity:0.5,
    //         stagger:0.1
    //     }),
    //     gsap.from('.image',{
    //         x:200,
    //         duration:1,
    //         opacity:0.5
    //     })
    // })

    const goto = isAuthenticated() ? "home" : "auth";
    const router=useNavigate();
    const handleStart = () => router(`/${goto}`);

    return(
       <>
       <div className="landing">
        <div className="back">
            <Demo/>
        </div>
        <div className="main">
            <Navbar/>
            <div className="hero">
                <div className="txt">
                    <h1><span style={{ color: "#FF9839" }}>Connect</span> with your loved Ones</h1>
                    <p>Cover a distance by VIDIO Call</p>
                    <div onClick={handleStart} className='btn'><p>Get Started</p></div>
                </div>
                <div className="svg">
                    <img src="/undraw_calling_ieh0.svg" alt="" />
                </div>
            </div>
        </div>
       </div>
       </>
    )
}