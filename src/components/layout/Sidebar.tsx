import { Home, Search, Library, Plus, Heart, Music, Menu, X } from 'lucide-react';
import { Playlist } from '@/types/music';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  playlists: Playlist[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  onPlaylistClick: (playlist: Playlist) => void;
}

export function Sidebar({ playlists, activeSection, onSectionChange, onPlaylistClick }: SidebarProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'search', label: 'Buscar', icon: Search },
    { id: 'library', label: 'Sua Biblioteca', icon: Library },
  ];

  const handleNav = (section: string) => {
    onSectionChange(section);
    if (isMobile) setIsOpen(false);
  };

  const handlePlaylist = (playlist: Playlist) => {
    onPlaylistClick(playlist);
    if (isMobile) setIsOpen(false);
  };

  // Mobile: bottom tab bar + hamburger for playlists
  if (isMobile) {
    return (
      <>
        {/* Bottom Navigation Tabs */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-xl border-t border-border z-30 flex items-center justify-around px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors',
                activeSection === item.id ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => handleNav('liked')}
            className={cn(
              'flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors',
              activeSection === 'liked' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Heart size={20} />
            <span className="text-[10px] font-medium">Curtidas</span>
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center gap-1 py-2 px-3 rounded-lg text-muted-foreground"
          >
            <Menu size={20} />
            <span className="text-[10px] font-medium">Mais</span>
          </button>
        </nav>

        {/* Mobile Drawer for Playlists */}
        {isOpen && (
          <div className="fixed inset-0 z-50 animate-fade-in">
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border flex flex-col animate-slide-in-right">
              <div className="p-4 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Music className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-display font-bold text-gradient">Snow Player</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
                  <X size={18} />
                </button>
              </div>

              <div className="px-3 py-2">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">Playlists</h2>
              </div>
              <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handlePlaylist(playlist)}
                    className="nav-item w-full text-left"
                  >
                    <img src={playlist.coverUrl} alt={playlist.name} className="w-8 h-8 rounded object-cover" />
                    <span className="truncate text-sm">{playlist.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside className="w-64 h-full bg-sidebar flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary">
          <Music className="w-5 h-5 text-primary-foreground" />
        </div>
        <h1 className="font-display font-bold text-xl text-gradient">Snow Player</h1>
      </div>

      <nav className="px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn('nav-item w-full text-left', activeSection === item.id && 'nav-item-active')}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mx-6 my-4 border-t border-sidebar-border" />

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-6 mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Playlists</h2>
          <button className="w-8 h-8 rounded-lg hover:bg-sidebar-accent flex items-center justify-center transition-colors">
            <Plus size={18} className="text-muted-foreground" />
          </button>
        </div>

        <button
          onClick={() => onSectionChange('liked')}
          className={cn('mx-3 mb-2 nav-item', activeSection === 'liked' && 'nav-item-active')}
        >
          <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Heart size={14} className="text-primary-foreground" fill="currentColor" />
          </div>
          <span className="font-medium">Músicas Curtidas</span>
        </button>

        <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => onPlaylistClick(playlist)}
              className="nav-item w-full text-left"
            >
              <img src={playlist.coverUrl} alt={playlist.name} className="w-8 h-8 rounded object-cover" />
              <span className="truncate">{playlist.name}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
