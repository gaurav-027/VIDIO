import React from 'react';
import LightRays from './LightRays';

export default function Demo() {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' , backgroundColor:"#060010"}}>
  <LightRays
    raysOrigin="top-center"
    raysColor="#ffffff"
    raysSpeed={1}
    lightSpread={1}
    rayLength={3}
    followMouse={true}
    mouseInfluence={0.1}
    noiseAmount={0}
    distortion={0}
    className="custom-rays"
    pulsating={false}
    fadeDistance={1}
    saturation={1}
/>
</div>
  )
}
