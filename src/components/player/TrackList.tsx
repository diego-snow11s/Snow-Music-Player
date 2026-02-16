import { usePlayer } from '@/contexts/PlayerContext';
import { Track } from '@/types/music';
import { formatTime } from '@/utils/formatTime';
import { Play, Pause, MoreHorizontal } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TrackListProps {
  tracks: Track[];
  showAlbum?: boolean;
  onTrackClick?: (track: Track) => void;
}

export function TrackList({ tracks, showAlbum = true, onTrackClick }: TrackListProps) {
  const { currentTrack, isPlaying, togglePlay, setPlaylist } = usePlayer();
  const isMobile = useIsMobile();

  const handleTrackClick = (track: Track, index: number) => {
    if (onTrackClick) onTrackClick(track);
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      setPlaylist(tracks, index);
    }
  };

  // Mobile: simple list without grid
  if (isMobile) {
    return (
      <div className="space-y-1">
        {tracks.map((track, index) => {
          const isActive = currentTrack?.id === track.id;
          const isCurrentlyPlaying = isActive && isPlaying;
          return (
            <div
              key={track.id}
              onClick={() => handleTrackClick(track, index)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-secondary' : 'hover:bg-muted/50 active:bg-muted'}`}
            >
              <div className="relative w-10 h-10 shrink-0">
                <img src={track.coverUrl} alt={track.album} className="w-10 h-10 rounded object-cover" />
                {isCurrentlyPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((i) => (
                        <span key={i} className="w-0.5 bg-primary rounded-full animate-wave" style={{ height: '10px', animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${isActive ? 'text-primary' : ''}`}>{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{formatTime(track.duration)}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop: grid layout
  return (
    <div className="space-y-1">
      <div className={`grid ${showAlbum ? 'grid-cols-[40px_1fr_1fr_80px]' : 'grid-cols-[40px_1fr_80px]'} gap-4 px-4 py-2 text-xs text-muted-foreground uppercase tracking-wider border-b border-border/50`}>
        <span className="text-center">#</span>
        <span>Título</span>
        {showAlbum && <span>Álbum</span>}
        <span className="text-right">Duração</span>
      </div>

      {tracks.map((track, index) => {
        const isActive = currentTrack?.id === track.id;
        const isCurrentlyPlaying = isActive && isPlaying;
        return (
          <div
            key={track.id}
            onClick={() => handleTrackClick(track, index)}
            className={`track-item group grid ${showAlbum ? 'grid-cols-[40px_1fr_1fr_80px]' : 'grid-cols-[40px_1fr_80px]'} gap-4 items-center ${isActive ? 'track-item-active' : ''}`}
          >
            <div className="flex items-center justify-center">
              {isActive ? (
                <button className="player-control w-8 h-8">
                  {isCurrentlyPlaying ? (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((i) => (
                        <span key={i} className="w-0.5 bg-primary rounded-full animate-wave" style={{ height: '12px', animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  ) : (
                    <Pause size={16} className="text-primary" />
                  )}
                </button>
              ) : (
                <>
                  <span className="text-muted-foreground text-sm group-hover:hidden">{index + 1}</span>
                  <Play size={16} className="hidden group-hover:block text-foreground" fill="currentColor" />
                </>
              )}
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <img src={track.coverUrl} alt={track.album} className="w-10 h-10 rounded object-cover" />
              <div className="min-w-0">
                <p className={`font-medium text-sm truncate ${isActive ? 'text-primary' : ''}`}>{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>
            </div>
            {showAlbum && <span className="text-sm text-muted-foreground truncate">{track.album}</span>}
            <div className="flex items-center justify-end gap-2">
              <button className="player-control w-8 h-8 opacity-0 group-hover:opacity-100"><MoreHorizontal size={16} /></button>
              <span className="text-sm text-muted-foreground">{formatTime(track.duration)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
