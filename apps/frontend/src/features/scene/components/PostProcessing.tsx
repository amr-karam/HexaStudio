'use client';

import React from 'react';
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { QualityLevel } from '@/hooks/useAdaptiveQuality';

interface PostProcessingProps {
  quality: QualityLevel;
}

/**
 * PostProcessing manages the cinematic visual stack.
 * It implements a high-end architectural render style: 
 * sharp focus, subtle bloom, and organic film grain.
 */
export const PostProcessing = ({ quality }: PostProcessingProps) => {
  if (quality === 'low') return null;

  return (
    <EffectComposer disableNormalPass>
      <>
        {/* Bloom: Mimics light bleeding from architectural highlights */}
        <Bloom 
          intensity={quality === 'high' ? 0.6 : 0.4} 
          luminanceThreshold={0.9} 
          luminanceSmoothing={0.1} 
          radius={0.3} 
        />
        
        {/* DOF: Cinematic depth of field for high-end feel */}
        {quality === 'high' && (
          <DepthOfField 
            focusDistance={0.025} 
            focalLength={0.05} 
            bokehScale={2} 
          />
        )}
        
        {/* Chromatic Aberration: Subtle lens imperfection for organic look */}
        {quality === 'high' && (
          <ChromaticAberration offset={[0.0005, 0.0005]} />
        )}
        
        {/* Noise: Removes digital banding and adds film-like texture */}
        <Noise opacity={quality === 'high' ? 0.03 : 0.02} />
        
        {/* Vignette: Draws eye toward the center architectural focus */}
        <Vignette offset={0.2} darkness={1.2} />
      </>
    </EffectComposer>
  );
};

