import React, { useRef, useEffect } from "react";
import { PositionalAudio } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { AudioLoader, PositionalAudio as PositionalAudioImpl } from "three";

export function SpatialAudio({ url, position }: { url: string; position: [number, number, number] }) {
  const sound = useRef<PositionalAudioImpl | null>(null);
  const buffer = useLoader(AudioLoader, url);

  useEffect(() => {
    if (sound.current) {
      sound.current.setBuffer(buffer);
      sound.current.setRefDistance(1);
      sound.current.setLoop(true);
      sound.current.play();
    }
  }, [buffer]);

  return <PositionalAudio ref={sound} url={url} position={position} />;
}
