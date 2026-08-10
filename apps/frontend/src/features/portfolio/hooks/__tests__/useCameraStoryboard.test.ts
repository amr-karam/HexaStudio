import * as THREE from 'three';
import { interpolateCameraStoryboard } from '../useCameraStoryboard';
import { CameraStoryboard } from '@hexastudio/types';

describe('interpolateCameraStoryboard', () => {
  const mockStoryboard: CameraStoryboard = [
    {
      progress: 0,
      position: [0, 5, 10],
      target: [0, 0, 0],
      fov: 45,
    },
    {
      progress: 0.5,
      position: [5, 5, 5],
      target: [0, 1, 0],
      fov: 60,
    },
    {
      progress: 1,
      position: [10, 5, 0],
      target: [0, 2, 0],
      fov: 30,
    },
  ];

  it('should return first keyframe when progress is 0', () => {
    const result = interpolateCameraStoryboard(0, mockStoryboard);
    expect(result.position).toEqual(new THREE.Vector3(0, 5, 10));
    expect(result.fov).toBe(45);
  });

  it('should return last keyframe when progress is 1', () => {
    const result = interpolateCameraStoryboard(1, mockStoryboard);
    expect(result.position).toEqual(new THREE.Vector3(10, 5, 0));
    expect(result.fov).toBe(30);
  });

  it('should interpolate linearly between keyframes', () => {
    // Progress 0.25 is halfway between 0 and 0.5
    const result = interpolateCameraStoryboard(0.25, mockStoryboard);
    
    // Position: lerp([0,5,10], [5,5,5], 0.5) = [2.5, 5, 7.5]
    expect(result.position.x).toBeCloseTo(2.5);
    expect(result.position.y).toBeCloseTo(5);
    expect(result.position.z).toBeCloseTo(7.5);
    
    // FOV: lerp(45, 60, 0.5) = 52.5
    expect(result.fov).toBeCloseTo(52.5);
  });

  it('should handle empty storyboard gracefully', () => {
    const result = interpolateCameraStoryboard(0.5, []);
    expect(result.position).toEqual(new THREE.Vector3(0, 5, 10));
  });

  it('should handle boundary values outside 0-1', () => {
    const under = interpolateCameraStoryboard(-1, mockStoryboard);
    expect(under.position).toEqual(new THREE.Vector3(0, 5, 10));

    const over = interpolateCameraStoryboard(2, mockStoryboard);
    expect(over.position).toEqual(new THREE.Vector3(10, 5, 0));
  });
});
