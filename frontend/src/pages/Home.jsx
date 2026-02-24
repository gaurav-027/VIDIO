import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from './Navbar';
import "../styles/Home.css";

function HomeComponent() {


    let navigate = useNavigate();
    
    const [meetingCode, setMeetingCode] = useState("");

    const {addToUserHistory} = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/meet/${meetingCode}`)
    }

    return (
        <div className='back'>
            <Navbar/>
            <div className="main1">
                <div className="left">
                    <p>Professional meetings made simple, personal connections made real.</p>
                    <input type="text" placeholder='Enter Meeting Code' value={meetingCode} onChange={(e)=>setMeetingCode(e.target.value)}/>
                    <Button onClick={handleJoinVideoCall} variant='contained'>Join</Button>
                </div>
                <div className="right">
                    <img src="/undraw_group-video_k4jx.svg" alt="" />
                </div>
            </div>
            
        </div>
    )
}


export default withAuth(HomeComponent)