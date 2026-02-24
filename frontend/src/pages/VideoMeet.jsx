import React, { useEffect, useRef, useState } from 'react'
import "../styles/VideoMeet.css";
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import Button from '@mui/material/Button';
import { io } from 'socket.io-client';
import Navbar from './Navbar';
import { useParams } from "react-router-dom";
import withAuth from '../utils/withAuth'

const server_url="http://localhost:8080";

const connections = {};

const peerConfigConnections = {
    "iceServers": [
        {"urls": "stun:stun.l.google.com:19302"}
    ]
}
 function VideoMeet() {
    const { roomId } = useParams();

    var socketRef=useRef();

    let socketIdRef=useRef();

    let localVideoRef=useRef();

    let [videoAvailable,setVideoAvailable]=useState(true);

    let [audioAvailable,setAudioAvailable]=useState(true);

    let [video,setVideo]=useState();

    let [audio,setAudio]=useState();

    let [screen,setScreen]=useState();

    let [showModel,setShowModel]=useState(false);

    let [screenAvailable,setScreenAvailable]=useState();

    let [messages,setMessages]=useState([]);

    let [message,setMessage]=useState("");

    let [newMessages,setNewMessages]=useState(0);

    let [askForUsername,setAskForUsername]=useState(true);

    let [username,setUsername]=useState("Anonymous");

    const videoRef = useRef([]);

    let [videos, setVideos] = useState([]);

    const getPermission=async()=>{
        try {
            const videoPermission=await navigator.mediaDevices.getUserMedia({video:true});

            if(videoPermission){
                setVideoAvailable(true);
            }else{
                setVideoAvailable(false);
            }

            const audioPermission=await navigator.mediaDevices.getUserMedia({audio:true});

            if(audioPermission){
                setAudioAvailable(true);
            }else{
                setAudioAvailable(false);
            }

            if(navigator.mediaDevices.getDisplayMedia){
                setScreenAvailable(true);
            }else{
                setScreenAvailable(false);
            }

            let userMediaStream;
            if(videoAvailable || audioAvailable){
                userMediaStream = await navigator.mediaDevices.getUserMedia({video:videoAvailable,audio:audioAvailable});
            }
            
            if(userMediaStream){
                window.localStream=userMediaStream;
                if(localVideoRef.current){
                    localVideoRef.current.srcObject=userMediaStream;
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        getPermission();
    },[])

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoRef.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }



    let getUserMedia=()=>{
        if((video && videoAvailable) || (audio && audioAvailable)){
            navigator.mediaDevices.getUserMedia({video:video, audio:audio})
            .then(getUserMediaSuccess) 
            .then((stream)=>{})
            .catch((e)=>console.log(e))
        }else{
            try {
                let tracks=localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track=>track.stop())
            } catch (error) {
                
            }
        }
    }

    useEffect(()=>{
        if(video!= undefined && audio != undefined){
            getUserMedia();
        }
    },[audio,video])

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };

    let connectToSocketServer=()=>{
        socketRef.current = io(server_url, { transports: ["websocket"] });
        socketRef.current.on("invalid-room", ()=>{
            alert("Meeting does not exist");
            window.location.href="/home";
        });
        socketRef.current.on('signal', gotMessageFromServer);
        socketRef.current.on('connect',()=>{
            socketRef.current.emit("join-call",roomId)
            socketIdRef.current=socketRef.current.id
            socketRef.current.on('chat-message',addMessage)
            socketRef.current.on('user-left',(id)=>{
                setVideos((videos)=>videos.filter((video)=>video.socketId !== id))
            })
            socketRef.current.on("user-joined",(id,clients)=>{

                clients.forEach((socketListId)=>{
                    connections[socketListId]=new RTCPeerConnection(peerConfigConnections)
                    connections[socketListId].onicecandidate=(event)=>{
                        if(event.candidate!=null){
                            socketRef.current.emit('signal',socketListId,JSON.stringify({'ice':event.candidate}))
                        }
                    }

                    connections[socketListId].onaddstream = (event) => {
                        setVideos(prev => {
                            const exists = prev.find(v => v.socketId === socketListId);
                            if (exists) {
                                return prev.map(v => v.socketId === socketListId ? { ...v, stream: event.stream } : v);
                            }
                            return [...prev, { socketId: socketListId, stream: event.stream, autoPlay: true, playsinline: true }];
                        });
                    };

                    if(window.localStream != undefined && window.localStream != null){
                        connections[socketListId].addStream(window.localStream);
                    }else{
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if(id===socketIdRef.current){
                    for(let id2 in connections){
                        if(id2===socketIdRef.current)continue
                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (error) {}
                        connections[id2].createOffer().then((description)=>{
                            connections[id2].setLocalDescription(description)
                            .then(()=>{
                                socketRef.current.emit("signal",id2,JSON.stringify({"sdp":connections[id2].localDescription}))
                            })
                            .catch(e=>console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let getMedia=()=>{
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let connect = () => {
    setAskForUsername(false);
    getMedia();
    }

    let handleVideo = () => {
        setVideo(!video);
    }
    let handleAudio = () => {
        setAudio(!audio)
    }

let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoRef.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoRef.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])

    let handleScreen = () => {
        setScreen(!screen);
    }

    let sendMessage = () => {
        socketRef.current.emit('chat-message', message, username)
        setMessage("");
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop());
            setMessage([])
        } catch (e) { }
        window.location.href = "/home"
    }

  return (
    <div className='back'>
        {askForUsername==true?
            <div>
                <Navbar/>
                <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:"6rem",marginTop:"5rem"}}>
                <div style={{fontSize:"2rem",color:"#fff",display:"flex",flexDirection:"column",justifyContent:"center",gap:"1.2rem",width:"30%"}}><p>Enter Username and Connect in a Lobby.</p>
                    <input type="text" placeholder='Enter Username' value={username} onChange={(e)=>setUsername(e.target.value)} />                
                    <Button variant='contained' onClick={connect}>connect</Button>
                </div>
                <div className='local'><video ref={localVideoRef} autoPlay muted></video></div>
            </div>
            </div>
            :<div className="meetVideoContainer">

                {showModel ? <div className='chat'>
                    <div className="chatContainer">
                        <h1>Chat</h1>

                        <div className="chattingDisplay">

                            {messages.map((item,index)=>{
                                return(
                                    <div key={index} style={{marginBottom:"15px"}}>
                                        <p style={{fontWeight:"bold"}}>{item.sender}</p>
                                        <p>{item.data}</p>
                                    </div>
                                )
                            })}

                        </div>

                        <div className="chattingArea">
                            <TextField value={message} onChange={(e)=> setMessage(e.target.value)} id="outlined-basic" label="Enter Chat" variant="outlined" />
                            <Button onClick={sendMessage} variant='contained'>Send</Button>
                        </div>
                    </div>
                </div> : <div></div>}

                <div className='buttonContainer'>
                    <IconButton onClick={handleVideo} style={{ color: "whitesmoke" }}>
                        {(video==true) ? <VideocamIcon/> : <VideocamOffIcon/>}
                    </IconButton>
                    <IconButton onClick={handleEndCall} sx={{color:"crimson"}}>
                        <CallEndIcon/>
                    </IconButton>
                    <IconButton onClick={handleAudio} style={{ color: "whitesmoke" }}>
                        {audio==true ? <MicIcon/> : <MicOffIcon/>}
                    </IconButton>
                     {screenAvailable === true ?
                        <IconButton onClick={handleScreen} style={{ color: "whitesmoke" }}>
                            {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                        </IconButton> : <></>
                    }
                    
                     <Badge badgeContent={newMessages} max={999} color='secondary'>
                        <IconButton onClick={()=>setShowModel(!showModel)} style={{ color: "white" }}>
                            <ChatIcon />                       
                        </IconButton>
                    </Badge>
                </div>

                
                {(() => {
                  const count = videos.length + 1;
                  return (
                    <div className={`conferenceView layout-${Math.min(count, 4)}`}>
                      <div className="meetUserVideo"><video ref={localVideoRef} autoPlay muted></video></div>
                      {videos.map((video) => (
                        <div key={video.socketId}>
                          <video
                            data-socket={video.socketId}
                            ref={ref => {
                              if (ref && video.stream) {
                                ref.srcObject = video.stream;
                              }
                            }}
                            autoPlay
                          >
                          </video>
                        </div>
                      ))}
                    </div>
                  );
                })()}
            </div>
        }
    </div>
  )
}
export default withAuth(VideoMeet)