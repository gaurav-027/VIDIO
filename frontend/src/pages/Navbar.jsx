import React from 'react'
import {isAuthenticated} from "../utils/withAuth.jsx";
import PersonIcon from '@mui/icons-material/Person';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import "../styles/Navbar.css"



export default function Navbar() {

    const navigate=useNavigate();
  return (
    <nav>
            <div className="navbar">
                <div className='navLogo'>
                <h1>VIDIO</h1>
            </div>
            <div className="navLinks">
                {!isAuthenticated()? <div>
                   <IconButton>
                    <p style={{color:"white",fontSize:"25px"}}>LogIn</p>
                        <LoginIcon sx={{color:"#FF9839",fontSize:30}}/>
                   </IconButton>
                </div> : <div>
                        <IconButton onClick={()=>navigate('/profile')} >
                            <PersonIcon sx={{color:"white",fontSize:30}}/>
                        </IconButton>
                    </div>}
            </div>
            </div>
        </nav>
  )
}
