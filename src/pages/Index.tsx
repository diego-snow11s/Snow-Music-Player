import { useState } from 'react';
import { Track, Playlist } from '@/types/music';
import { sampleTracks, samplePlaylists } from '@/data/sampleTracks';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { PlayerBar } from '@/components/player/PlayerBar';
import { TrackList } from '@/components/player/TrackList';
import { PlaylistCard } from '@/components/player/PlaylistCard';
import { LyricsView } from '@/components/player/LyricsView';
import { EqualizerView } from '@/components/player/EqualizerView';
import { QueueView } from '@/components/player/QueueView';
import { FileImporter } from '@/components/player/FileImporter';
import { Play, Clock, Heart } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { getPlaylistDuration } from '@/utils/formatTime';
import { useIsMobile } from '@/hooks/use-mobile';
import heroBg from '@/assets/hero-bg.jpg';

function MainContent() {
  const [activeSection, setActiveSection] = useState('home');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [localTracks, setLocalTracks] = useState<Track[]>([]);
  const [playlists] = useState<Playlist[]>(samplePlaylists);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const isMobile = useIsMobile();

  const { setPlaylist, currentTrack } = usePlayer();
  const allTracks = [...sampleTracks, ...localTracks];

  const handlePlaylistClick = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setActiveSection('playlist');
  };

  const handlePlayAll = () => {
    if (selectedPlaylist) setPlaylist(selectedPlaylist.tracks, 0);
  };

  const handleTracksImported = (newTracks: Track[]) => {
    setLocalTracks(prev => [...prev, ...newTracks]);
  };

  // Bottom padding for player bar + mobile nav
  const bottomPadding = isMobile ? 'pb-40' : 'pb-32';

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div className={`p-4 md:p-8 ${bottomPadding} animate-fade-in`}>
            {/* Hero */}
            <div
              className="relative rounded-2xl overflow-hidden mb-6 md:mb-8 h-40 md:h-64"
              style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
              <div className="relative h-full flex flex-col justify-center p-4 md:p-8">
                <h1 className="font-display font-bold text-2xl md:text-4xl mb-1 md:mb-2">
                  Bem-vindo ao <span className="text-gradient">Snow Player</span>
                </h1>
                <p className="text-muted-foreground text-sm md:text-lg mb-3 md:mb-4">
                  Sua música, seu jeito.
                </p>
                <button
                  onClick={() => setPlaylist(allTracks, 0)}
                  className="player-control-primary w-fit px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold flex items-center gap-2 text-sm md:text-base"
                >
                  <Play size={18} fill="currentColor" />
                  Reproduzir Tudo
                </button>
              </div>
            </div>

            <div className="mb-8 md:mb-12">
              <FileImporter onTracksImported={handleTracksImported} />
            </div>

            <section className="mb-8 md:mb-12">
              <h2 className="font-display font-bold text-xl md:text-2xl mb-4 md:mb-6">Suas Playlists</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                {playlists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} onClick={handlePlaylistClick} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl md:text-2xl mb-4 md:mb-6">Todas as Músicas</h2>
              <TrackList tracks={allTracks} showAlbum={!isMobile} />
            </section>
          </div>
        );

      case 'library':
        return (
          <div className={`p-4 md:p-8 ${bottomPadding} animate-fade-in`}>
            <h1 className="font-display font-bold text-2xl md:text-3xl mb-6 md:mb-8">Sua Biblioteca</h1>
            <FileImporter onTracksImported={handleTracksImported} />
            {localTracks.length > 0 && (
              <section className="mt-6 md:mt-8">
                <h2 className="font-display font-bold text-lg md:text-xl mb-4">Músicas Importadas</h2>
                <TrackList tracks={localTracks} showAlbum={!isMobile} />
              </section>
            )}
            <section className="mt-6 md:mt-8">
              <h2 className="font-display font-bold text-lg md:text-xl mb-4">Músicas de Exemplo</h2>
              <TrackList tracks={sampleTracks} showAlbum={!isMobile} />
            </section>
          </div>
        );

      case 'search':
        return (
          <div className={`p-4 md:p-8 ${bottomPadding} animate-fade-in`}>
            <h1 className="font-display font-bold text-2xl md:text-3xl mb-6 md:mb-8">Buscar</h1>
            <div className="max-w-xl">
              <input
                type="text"
                placeholder="O que você quer ouvir?"
                className="w-full px-4 md:px-6 py-3 md:py-4 rounded-full bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
              />
            </div>
            <section className="mt-8 md:mt-12">
              <h2 className="font-display font-bold text-lg md:text-xl mb-4 md:mb-6">Navegue por gêneros</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {['Pop', 'Rock', 'Eletrônica', 'Jazz', 'Clássica', 'Hip Hop', 'R&B', 'Indie'].map((genre) => (
                  <div
                    key={genre}
                    className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                  >
                    <span className="font-display font-bold text-base md:text-xl">{genre}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );

      case 'liked':
        return (
          <div className={`p-4 md:p-8 ${bottomPadding} animate-fade-in`}>
            <div className={`flex ${isMobile ? 'flex-col items-center text-center' : 'items-end'} gap-4 md:gap-6 mb-6 md:mb-8`}>
              <div className={`${isMobile ? 'w-32 h-32' : 'w-48 h-48'} rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shrink-0`}>
                <Heart size={isMobile ? 48 : 80} className="text-primary-foreground" fill="currentColor" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-muted-foreground">Playlist</p>
                <h1 className={`font-display font-bold ${isMobile ? 'text-3xl' : 'text-5xl'} mb-2 md:mb-4`}>Músicas Curtidas</h1>
                <p className="text-muted-foreground text-sm">
                  {allTracks.length} músicas • {getPlaylistDuration(allTracks)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setPlaylist(allTracks, 0)}
              className="player-control-primary px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold flex items-center gap-2 mb-6 md:mb-8 mx-auto md:mx-0"
            >
              <Play size={18} fill="currentColor" />
              Reproduzir
            </button>
            <TrackList tracks={allTracks} showAlbum={!isMobile} />
          </div>
        );

      case 'playlist':
        if (!selectedPlaylist) return null;
        return (
          <div className={`p-4 md:p-8 ${bottomPadding} animate-fade-in`}>
            <div className={`flex ${isMobile ? 'flex-col items-center text-center' : 'items-end'} gap-4 md:gap-6 mb-6 md:mb-8`}>
              <img
                src={selectedPlaylist.coverUrl}
                alt={selectedPlaylist.name}
                className={`${isMobile ? 'w-40 h-40' : 'w-48 h-48'} rounded-xl object-cover shadow-lg`}
              />
              <div>
                <p className="text-sm uppercase tracking-wider text-muted-foreground">Playlist</p>
                <h1 className={`font-display font-bold ${isMobile ? 'text-2xl' : 'text-5xl'} mb-1 md:mb-2`}>{selectedPlaylist.name}</h1>
                {selectedPlaylist.description && (
                  <p className="text-muted-foreground mb-2 md:mb-4 text-sm">{selectedPlaylist.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground justify-center md:justify-start">
                  <span>{selectedPlaylist.tracks.length} músicas</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {getPlaylistDuration(selectedPlaylist.tracks)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handlePlayAll}
              className="player-control-primary px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold flex items-center gap-2 mb-6 md:mb-8 mx-auto md:mx-0"
            >
              <Play size={18} fill="currentColor" />
              Reproduzir
            </button>
            <TrackList tracks={selectedPlaylist.tracks} showAlbum={!isMobile} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar
        playlists={playlists}
        activeSection={activeSection}
        onSectionChange={(section) => { setActiveSection(section); setSelectedPlaylist(null); }}
        onPlaylistClick={handlePlaylistClick}
      />
      <main className="flex-1 overflow-y-auto">{renderContent()}</main>
      <PlayerBar
        onOpenLyrics={() => setIsLyricsOpen(true)}
        onOpenQueue={() => setIsQueueOpen(!isQueueOpen)}
        onOpenEqualizer={() => setIsEqualizerOpen(true)}
      />
      <LyricsView isOpen={isLyricsOpen} onClose={() => setIsLyricsOpen(false)} />
      <EqualizerView isOpen={isEqualizerOpen} onClose={() => setIsEqualizerOpen(false)} />
      <QueueView isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
    </div>
  );
}

export default function Index() {
  return (
    <PlayerProvider>
      <MainContent />
    </PlayerProvider>
  );
}
