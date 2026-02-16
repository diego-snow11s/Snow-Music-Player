import { usePlayer } from '@/contexts/PlayerContext';
import { formatTime } from '@/utils/formatTime';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, 
  Volume2, VolumeX, Mic2, ListMusic, SlidersHorizontal
} from 'lucide-react';
import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { useIsMobile } from '@/hooks/use-mobile';

interface PlayerBarProps {
  onOpenLyrics: () => void;
  onOpenQueue: () => void;
  onOpenEqualizer: () => void;
}

export function PlayerBar({ onOpenLyrics, onOpenQueue, onOpenEqualizer }: PlayerBarProps) {
  const {
    currentTrack, isPlaying, currentTime, duration, volume, isMuted,
    isShuffled, repeatMode, togglePlay, seek, setVolume, toggleMute,
    toggleShuffle, cycleRepeatMode, playNext, playPrevious,
  } = usePlayer();

  const isMobile = useIsMobile();
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressChange = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    seek(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const getRepeatIcon = () => {
    return repeatMode === 'one' ? <Repeat1 size={isMobile ? 16 : 18} /> : <Repeat size={isMobile ? 16 : 18} />;
  };

  if (!currentTrack) {
    return (
      <div className={`fixed left-0 right-0 ${isMobile ? 'bottom-16' : 'bottom-0'} h-16 bg-card/95 backdrop-blur-xl border-t border-border flex items-center justify-center z-40`}>
        <p className="text-muted-foreground text-sm">Selecione uma música para reproduzir</p>
      </div>
    );
  }

  // Mobile Player Bar - compact
  if (isMobile) {
    return (
      <div className="fixed left-0 right-0 bottom-16 z-40">
        {/* Progress bar on top */}
        <div className="w-full h-1 bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="h-16 bg-card/95 backdrop-blur-xl border-t border-border px-3 flex items-center gap-3">
          <img src={currentTrack.coverUrl} alt={currentTrack.album} className="w-10 h-10 rounded-lg object-cover" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-xs truncate">{currentTrack.title}</p>
            <p className="text-[10px] text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={playPrevious} className="player-control w-8 h-8">
              <SkipBack size={16} fill="currentColor" />
            </button>
            <button onClick={togglePlay} className="player-control-primary w-9 h-9">
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
            </button>
            <button onClick={playNext} className="player-control w-8 h-8">
              <SkipForward size={16} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Player Bar
  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-card/95 backdrop-blur-xl border-t border-border z-50">
      <div className="h-full px-4 flex items-center gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 w-[240px] min-w-[180px]">
          <img src={currentTrack.coverUrl} alt={currentTrack.album} className="w-14 h-14 rounded-lg object-cover shadow-lg" />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{currentTrack.title}</h4>
            <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex-1 flex flex-col items-center gap-1 max-w-[600px]">
          <div className="flex items-center gap-4">
            <button onClick={toggleShuffle} className={`player-control w-8 h-8 ${isShuffled ? 'player-control-active' : ''}`}>
              <Shuffle size={18} />
            </button>
            <button onClick={playPrevious} className="player-control w-8 h-8">
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button onClick={togglePlay} className="player-control-primary w-10 h-10">
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
            </button>
            <button onClick={playNext} className="player-control w-8 h-8">
              <SkipForward size={20} fill="currentColor" />
            </button>
            <button onClick={cycleRepeatMode} className={`player-control w-8 h-8 ${repeatMode !== 'off' ? 'player-control-active' : ''}`}>
              {getRepeatIcon()}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full flex items-center gap-2" onMouseEnter={() => setIsHoveringProgress(true)} onMouseLeave={() => setIsHoveringProgress(false)}>
            <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
            <Slider value={[progress]} max={100} step={0.1} onValueChange={handleProgressChange} className={`flex-1 cursor-pointer transition-all ${isHoveringProgress ? 'scale-y-150' : ''}`} />
            <span className="text-xs text-muted-foreground w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 w-[240px] min-w-[180px] justify-end">
          <button onClick={onOpenLyrics} className="player-control w-8 h-8"><Mic2 size={18} /></button>
          <button onClick={onOpenQueue} className="player-control w-8 h-8"><ListMusic size={18} /></button>
          <button onClick={onOpenEqualizer} className="player-control w-8 h-8"><SlidersHorizontal size={18} /></button>
          <div className="flex items-center gap-2 ml-2">
            <button onClick={toggleMute} className="player-control w-8 h-8">
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <Slider value={[isMuted ? 0 : volume * 100]} max={100} step={1} onValueChange={handleVolumeChange} className="w-24 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
}
