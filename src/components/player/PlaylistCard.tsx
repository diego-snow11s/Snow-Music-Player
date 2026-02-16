import { Playlist } from '@/types/music';
import { Play } from 'lucide-react';
import { getPlaylistDuration } from '@/utils/formatTime';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: (playlist: Playlist) => void;
}

export function PlaylistCard({ playlist, onClick }: PlaylistCardProps) {
  return (
    <div
      onClick={() => onClick(playlist)}
      className="playlist-card group"
    >
      <div className="relative mb-4">
        <img
          src={playlist.coverUrl}
          alt={playlist.name}
          className="w-full aspect-square rounded-lg object-cover shadow-lg"
        />
        <button
          className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
          onClick={(e) => {
            e.stopPropagation();
            onClick(playlist);
          }}
        >
          <Play size={20} fill="currentColor" className="ml-0.5" />
        </button>
      </div>
      
      <h3 className="font-semibold text-base mb-1 truncate">{playlist.name}</h3>
      <p className="text-sm text-muted-foreground truncate">
        {playlist.tracks.length} músicas • {getPlaylistDuration(playlist.tracks)}
      </p>
    </div>
  );
}
