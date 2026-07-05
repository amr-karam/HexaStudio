'use client';

import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { ProjectHotspot } from '@hexastudio/types';
import { useCameraStore } from '@/features/scene/store/camera-store';
import { motion } from 'framer-motion';

interface HotspotProps {
  hotspot: ProjectHotspot;
}

/**
 * Hotspot is an interactive 3D marker that triggers camera transitions
 * and displays architectural details with a premium, minimal UI.
 */
export const Hotspot = ({ hotspot }: HotspotProps) => {
  const { setTarget } = useCameraStore();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <group position={hotspot.position}>
       {/* Outer Pulsing Ring */}
       <mesh 
         onClick={() => setTarget(hotspot.id)}
         onPointerOver={() => setIsHovered(true)}
         onPointerOut={() => setIsHovered(false)}
       >
         <ringGeometry args={[0.12, 0.15, 32]} />
         <meshBasicMaterial 
           color="#c9a96e" 
           transparent 
           opacity={isHovered ? 1 : 0.4}
         />
       </mesh>

       {/* Core Marker */}
       <mesh 
         onClick={() => setTarget(hotspot.id)}
         onPointerOver={() => setIsHovered(true)}
         onPointerOut={() => setIsHovered(false)}
       >
         <sphereGeometry args={[0.06, 16, 16]} />
         <meshStandardMaterial 
           color={isHovered ? '#c9a96e' : '#ffffff'} 
           emissive={isHovered ? '#c9a96e' : '#ffffff'}
            emissiveIntensity={2}
         />
       </mesh>

       {/* Cinematic Label Overlay */}
       {isHovered && (
         <Html distanceFactor={15} position={[0, 0.4, 0]} center>
           <motion.div 
             initial={{ opacity: 0, scale: 0.9, y: 10 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             className="bg-background/90 backdrop-blur-xl border border-border p-4 pointer-events-none min-w-[180px] max-w-[240px]"
           >
             <div className="flex flex-col gap-1">
               <span className="text-[8px] uppercase tracking-[0.3em] text-accent font-medium mb-1">
                 Detail
               </span>
               <h4 className="text-foreground text-[11px] uppercase tracking-widest font-medium">
                 {hotspot.title}
               </h4>
               <p className="text-neutral-500 text-[10px] leading-relaxed mt-2 font-light">
                 {hotspot.description}
               </p>
             </div>
           </motion.div>
         </Html>
       )}
    </group>
  );
};

