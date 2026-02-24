import React, { useEffect, useState } from 'react';
import "../styles/Profile.css";
import Navbar from "./Navbar.jsx";
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/Authcontext.jsx';

export default function Profile() {

  const navigate=useNavigate();

  const {profileDisplay} = useContext(AuthContext);
  const [user , setUser]=useState({});
  
  useEffect(()=>{
    const fetchProfile=async ()=>{
      try {
        const profile=await profileDisplay();
          setUser(profile.user);
      } catch (error) {
            console.log(error)
        }
    }
    fetchProfile();
  },[])

  const logOut=()=>{
    localStorage.removeItem("token")
    navigate("/")
  } 

  const history=()=>{
    navigate("/callHistory")
  }

    
  return (
    <>
      <div className="profilePage">
        <Navbar/>
        <div className="profileContainer">
          <div className="leftPart">
            <div className="profileItem">
              <div className="avatarContainer">
                <img src="/undraw_developer-avatar_f6ac.svg" alt="" />
              </div>
              <div className="infoContainer">
                <strong><p style={{fontSize:"2.5rem"}}>{user.name}</p></strong>
                <p style={{fontSize:"1.5rem"}}>@{user.username}</p>
                <br />
                <div className="buttonDiv">
                  <button onClick={history}>History</button> &nbsp;
                  <button onClick={logOut}>LogOut</button>
                </div>
              </div>
            </div>
          </div>
          <div className="rightPart">
            <div className="svgPart">
              <img src="/undraw_resume-folder_hf4p.svg" alt="" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
