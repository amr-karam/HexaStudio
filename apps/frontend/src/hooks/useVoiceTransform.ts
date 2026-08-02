import { toast } from 'sonner';
import { Transform3D } from '@hexastudio/types';
import { useRealtime } from '../features/realtime/useRealtime';

export function useVoiceTransform(projectId: string | null, onTransform: (transform: Transform3D) => void) {
  const { socket } = useRealtime(projectId, {
    onConnected: () => {
      socket?.on('3D_TRANSFORM_UPDATE', (data: Transform3D) => {
        onTransform(data);
        toast.success('Transform applied');
      });
      socket?.on('error', (data: { message: string }) => {
        toast.error(`Error: ${data.message}`);
      });
    },
    onDisconnected: () => {
      socket?.off('3D_TRANSFORM_UPDATE');
      socket?.off('error');
    }
  });

  const triggerTransform = (audioData: string, mimeType: string) => {
    if (!socket || !socket.connected) {
      toast.error('Socket not connected');
      return;
    }
    socket.emit('voice-transform', { projectId, audioData, mimeType });
  };

  return { triggerTransform };
}
