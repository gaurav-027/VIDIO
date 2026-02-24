import React, { useContext, useEffect, useState } from 'react';
import "../styles/History.css";
import Navbar from "../pages/Navbar.jsx"
import HistoryIcon from '@mui/icons-material/History';
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';

export default function History() {

    const {getHistoryOfUser}=useContext(AuthContext);
    const [meetings , setMeetings]=useState([]);
    const router = useNavigate(); 

    useEffect(()=>{
        const fetchHistory=async ()=>{
            try {
                const history=await getHistoryOfUser();
                setMeetings(history);
            } catch (error) {
                
            }
        }
        fetchHistory();
    },[])
  return (
    <>
        <div className="historyBack">
            <Navbar/>
            <div className="historyMain">
                <div className="callContainer">
                    <div className="callItem">
                        {
                            meetings.map((e,i)=>(
                                <div className="callHistory" key={i}>
                                    <div className="icon">
                                        <HistoryIcon sx={{color:"whitesmoke", fontSize:35}}/>
                                    </div>
                                    <div className="callInfo">
                                        <p>Meeting Code : {e.meetingCode}</p>
                                        <p>Date : {new Date(e.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        }
                        
                    </div>
                </div>
                <div className="svgContainer">
                    <div className="svgImage">
                        <img src="/undraw_the-search_cjxa.svg" alt="" />
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}
