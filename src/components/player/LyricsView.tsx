import { usePlayer } from '@/contexts/PlayerContext';
import { X, FileText, ClipboardPaste, Trash2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { LyricLine } from '@/types/music';
import { useIsMobile } from '@/hooks/use-mobile';

interface LyricsViewProps {
  isOpen: boolean;
  onClose: () => void;
}

function parseLyricsText(text: string): LyricLine[] {
  const lines = text.split('\n').filter(l => l.trim());
  const lrcRegex = /^\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)$/;
  const lrcLines: LyricLine[] = [];
  let isLrc = false;

  for (const line of lines) {
    const match = line.match(lrcRegex);
    if (match) {
      isLrc = true;
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const text = match[4] || '';
      if (text.trim()) {
        lrcLines.push({ time: minutes * 60 + seconds, text: text.trim() });
      }
    }
  }
  if (isLrc && lrcLines.length > 0) return lrcLines;
  return lines.map((line, i) => ({ time: i * 4, text: line.trim() }));
}

export function LyricsView({ isOpen, onClose }: LyricsViewProps) {
  const { currentTrack, currentTime, isPlaying } = usePlayer();
  const isMobile = useIsMobile();
  const [activeLine, setActiveLine] = useState(0);
  const [customLyrics, setCustomLyrics] = useState<Record<string, LyricLine[]>>({});
  const [showImport, setShowImport] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const lyrics = getLyrics();
    if (!lyrics || lyrics.length === 0) return;
    let activeIndex = 0;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) activeIndex = i;
    }
    setActiveLine(activeIndex);
  }, [currentTime, currentTrack, customLyrics]);

  const getLyrics = (): LyricLine[] => {
    if (!currentTrack) return [];
    return customLyrics[currentTrack.id] || currentTrack.lyrics || [];
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentTrack) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCustomLyrics(prev => ({ ...prev, [currentTrack.id]: parseLyricsText(text) }));
      setShowImport(false);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePaste = () => {
    if (!currentTrack || !pasteText.trim()) return;
    setCustomLyrics(prev => ({ ...prev, [currentTrack.id]: parseLyricsText(pasteText) }));
    setPasteText('');
    setShowImport(false);
  };

  const handleClearLyrics = () => {
    if (!currentTrack) return;
    setCustomLyrics(prev => { const next = { ...prev }; delete next[currentTrack.id]; return next; });
  };

  if (!isOpen) return null;
  const lyrics = getLyrics();
  const hasCustomLyrics = currentTrack ? !!customLyrics[currentTrack.id] : false;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-40 flex flex-col animate-fade-in">
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-border/50">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          {currentTrack && (
            <>
              <img src={currentTrack.coverUrl} alt={currentTrack.album} className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover shrink-0" />
              <div className="min-w-0">
                <h2 className="font-semibold text-sm md:text-base truncate">{currentTrack.title}</h2>
                <p className="text-xs md:text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          {hasCustomLyrics && (
            <button onClick={handleClearLyrics} className="w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground hover:text-destructive">
              <Trash2 size={16} />
            </button>
          )}
          <button onClick={() => setShowImport(!showImport)} className="w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground">
            <FileText size={16} />
          </button>
          <button onClick={onClose} className="w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {showImport && (
        <div className="p-4 md:p-6 border-b border-border/50 bg-card/50 animate-fade-in">
          <h3 className="font-semibold mb-3 text-sm md:text-base">Importar Letra</h3>
          <div className="flex flex-col gap-4">
            <div>
              <input ref={fileInputRef} type="file" accept=".txt,.lrc" onChange={handleFileImport} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
                <FileText size={16} />
                Importar .txt ou .lrc
              </button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Ou cole a letra:</p>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Cole a letra aqui... (suporta LRC)"
                className="w-full h-28 md:h-32 px-4 py-3 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button onClick={handlePaste} disabled={!pasteText.trim()} className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                <ClipboardPaste size={16} />
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-8 md:py-12 px-4 md:px-8">
        {lyrics.length > 0 ? (
          <div className="max-w-2xl mx-auto space-y-2 text-center">
            {lyrics.map((line, index) => (
              <p
                key={index}
                className={`transition-all duration-500 py-1 md:py-2 ${index === activeLine ? 'text-xl md:text-2xl text-foreground font-medium scale-105' : 'text-base md:text-lg text-muted-foreground/60'}`}
                style={{ opacity: Math.max(0.3, 1 - Math.abs(index - activeLine) * 0.15) }}
              >
                {line.text}
              </p>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="text-3xl md:text-4xl">🎵</span>
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">Letra não disponível</h3>
            <p className="text-muted-foreground text-sm mb-6">Não encontramos a letra para esta música.</p>
            <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm">
              <FileText size={16} />
              Importar Letra
            </button>
          </div>
        )}
      </div>

      {isPlaying && !isMobile && (
        <div className="absolute bottom-28 left-0 right-0 flex items-end justify-center gap-1 h-16 px-8">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="w-1 bg-primary/30 rounded-full animate-wave" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.05}s`, animationDuration: `${0.5 + Math.random() * 0.5}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}
