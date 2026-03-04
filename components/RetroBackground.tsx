"use client";

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function WarpTunnel() {
  const ref = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const particleCount = 2000;
  const tunnelRadius = 5;
  const tunnelLength = 80;

  // Generate initial particles along a cylinder (tunnel)
  const [particles, particleColors] = useMemo(() => {
    const points = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const colorObj = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2; // angle around the tunnel
      const r = tunnelRadius + (Math.random() - 0.5) * 2; // vary the radius slightly for depth
      const z = (Math.random() - 0.5) * tunnelLength; // spread along the Z axis

      points[i * 3] = r * Math.cos(theta);
      points[i * 3 + 1] = r * Math.sin(theta);
      points[i * 3 + 2] = z;

      // Assign a random rainbow color
      colorObj.setHSL(Math.random(), 1.0, 0.6); // Random hue, full sat, bright
      colors[i * 3] = colorObj.r;
      colors[i * 3 + 1] = colorObj.g;
      colors[i * 3 + 2] = colorObj.b;
    }
    return [points, colors];
  }, []);

  useFrame((state, delta) => {
    if (ref.current && materialRef.current) {
      const time = state.clock.elapsedTime;
      const cycleTime = 10; // 10 seconds per galaxy (8s cruise + 2s jump)
      const timeInCycle = time % cycleTime;

      let currentSpeed = 3; // Cruising speed

      // The hyperspace jump happens during the last 2 seconds of the cycle (from 8s to 10s)
      if (timeInCycle > 8) {
        // Map the 2-second window to 0.0 -> 1.0
        const jumpProgress = (timeInCycle - 8) / 2;

        // Math.sin creates a smooth curve that goes 0 -> 1 -> 0 perfectly across the 2 seconds
        const jumpWave = Math.sin(jumpProgress * Math.PI);

        // Squaring the wave makes the ramp up slightly softer but the peak high
        currentSpeed = 3 + (Math.pow(jumpWave, 2) * 120);
      }

      // Rotate the entire tunnel slowly based on current speed
      ref.current.rotation.z -= delta * (currentSpeed * 0.005);

      // Animate particles rushing towards the camera (Z-axis translation)
      const positions = ref.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        // Move particle forward (towards positive Z, past the camera) 
        positions[i * 3 + 2] += delta * currentSpeed;

        // If particle passes the camera, reset it far back in the tunnel
        // At high speeds, resetting them further back helps maintain the tunnel density
        if (positions[i * 3 + 2] > 10) {
          const spread = currentSpeed > 10 ? Math.random() * 40 : 0;
          positions[i * 3 + 2] = -tunnelLength / 2 - spread;
        }
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      <points ref={ref} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particles}
            itemSize={3}
            args={[particles, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleCount}
            array={particleColors}
            itemSize={3}
            args={[particleColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={materialRef}
          size={0.08}
          transparent
          vertexColors={true}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function RetroBackground() {
  return (
    <div className="absolute inset-0 z-0 bg-black">
      {/* We place the camera looking down the Z axis (at z=0) */}
      <Canvas camera={{ position: [0, 0, 0], fov: 90 }}>
        {/* Subtle fog helps particles fade into the distance */}
        <fog attach="fog" args={['#000000', 10, 40]} />
        <WarpTunnel />
      </Canvas>
      <div className="absolute inset-0 z-0 crt pointer-events-none"></div>
      <div className="absolute inset-0 z-0 scanline pointer-events-none"></div>
    </div>
  );
}
