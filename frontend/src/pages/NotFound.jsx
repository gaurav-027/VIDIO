import React from 'react';
import "../App.css"
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const router=useNavigate();
  return (
    <div className='nf'>
        <img src="/404 Error-bro.svg" alt="" />
        <button onClick={()=>router("/")} className='nfbtn'>Go Back</button>
    </div>
  )
}
