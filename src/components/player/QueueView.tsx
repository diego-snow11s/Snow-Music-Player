import { usePlayer } from '@/contexts/PlayerContext';
import { X, GripVertical, Play, Trash2 } from 'lucide-react';
import { formatTime } from '@/utils/formatTime';
import { useIsMobile } from '@/hooks/use-mobile';

interface QueueViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QueueView({ isOpen, onClose }: QueueViewProps) {
  const { queue, currentTrack, playTrack, isPlaying } = usePlayer();
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
  const upNext = queue.slice(currentIndex + 1);

  return (
    <div className={`fixed ${isMobile ? 'inset-0' : 'right-0 top-0 bottom-24 w-96'} bg-card/95 backdrop-blur-xl border-l border-border z-40 flex flex-col animate-slide-in-right`}>
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-border/50">
        <h2 className="font-display font-bold text-lg md:text-xl">Fila de Reprodução</h2>
        <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {currentTrack && (
          <div className="p-4 border-b border-border/50">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tocando Agora</h3>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
              <div className="relative">
                <img src={currentTrack.coverUrl} alt={currentTrack.album} className="w-12 h-12 rounded object-cover" />
                {isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((i) => (
                        <span key={i} className="w-0.5 bg-primary rounded-full animate-wave" style={{ height: '12px', animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate text-primary">{currentTrack.title}</p>
                <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
              </div>
              <span className="text-xs text-muted-foreground">{formatTime(currentTrack.duration)}</span>
            </div>
          </div>
        )}

        <div className="p-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">A Seguir</h3>
          {upNext.length > 0 ? (
            <div className="space-y-1">
              {upNext.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 active:bg-muted group cursor-pointer transition-colors"
                  onClick={() => playTrack(track)}
                >
                  <GripVertical size={16} className="text-muted-foreground/50 hidden md:block" />
                  <img src={track.coverUrl} alt={track.album} className="w-10 h-10 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{track.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTime(track.duration)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">A fila está vazia</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
