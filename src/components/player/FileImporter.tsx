import { useState, useRef } from 'react';
import { Track } from '@/types/music';
import { Music, Upload, FolderOpen, FileAudio } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface FileImporterProps {
  onTracksImported: (tracks: Track[]) => void;
}

const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.wma'];

function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/') || AUDIO_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
}

function getDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', () => { resolve(audio.duration); audio.src = ''; });
    audio.addEventListener('error', () => resolve(0));
    audio.src = url;
  });
}

export function FileImporter({ onTracksImported }: FileImporterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const processFiles = async (files: FileList | File[]) => {
    const audioFiles = Array.from(files).filter(isAudioFile);
    if (audioFiles.length === 0) {
      toast({ title: 'Nenhum arquivo de áudio encontrado', description: 'Selecione arquivos MP3, WAV, OGG, M4A, FLAC', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const newTracks: Track[] = await Promise.all(
      audioFiles.map(async (file, index) => {
        const url = URL.createObjectURL(file);
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        const parts = fileName.split(' - ');
        const artist = parts.length > 1 ? parts[0].trim() : 'Artista Desconhecido';
        const title = parts.length > 1 ? parts.slice(1).join(' - ').trim() : fileName;
        const duration = await getDuration(url);
        return { id: `local-${Date.now()}-${index}`, title, artist, album: 'Biblioteca Local', duration, coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', audioUrl: url };
      })
    );
    setIsLoading(false);
    onTracksImported(newTracks);
    toast({ title: `${newTracks.length} música(s) importada(s)`, description: 'Adicionadas à biblioteca.' });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const items = e.dataTransfer.items;
    if (items) {
      const filePromises: Promise<File[]>[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry?.();
        if (item) filePromises.push(readEntry(item));
      }
      Promise.all(filePromises).then(results => { const all = results.flat(); if (all.length > 0) processFiles(all); });
    } else {
      processFiles(e.dataTransfer.files);
    }
  };

  const readEntry = (entry: FileSystemEntry): Promise<File[]> => {
    return new Promise((resolve) => {
      if (entry.isFile) {
        (entry as FileSystemFileEntry).file(file => resolve([file]));
      } else if (entry.isDirectory) {
        const reader = (entry as FileSystemDirectoryEntry).createReader();
        const allFiles: File[] = [];
        const readBatch = () => {
          reader.readEntries(async (entries) => {
            if (entries.length === 0) { resolve(allFiles); return; }
            const results = await Promise.all(entries.map(e => readEntry(e)));
            allFiles.push(...results.flat());
            readBatch();
          });
        };
        readBatch();
      } else { resolve([]); }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) { processFiles(e.target.files); e.target.value = ''; }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      className={`glass-card p-4 md:p-8 border-2 border-dashed transition-all duration-300 ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-muted-foreground hover:bg-muted/30'}`}
    >
      <input ref={fileInputRef} type="file" accept="audio/*" multiple onChange={handleFileChange} className="hidden" />
      <input ref={folderInputRef} type="file" accept="audio/*" multiple onChange={handleFileChange} className="hidden" {...{ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>} />
      
      <div className="flex flex-col items-center text-center">
        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 transition-all ${isDragging ? 'bg-primary text-primary-foreground scale-110' : 'bg-muted text-muted-foreground'}`}>
          {isLoading ? <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" /> : isDragging ? <Upload size={isMobile ? 20 : 28} /> : <FolderOpen size={isMobile ? 20 : 28} />}
        </div>
        <h3 className="font-semibold text-base md:text-lg mb-1 md:mb-2">
          {isLoading ? 'Processando...' : isDragging ? 'Solte aqui' : 'Importar Músicas'}
        </h3>
        {!isMobile && <p className="text-sm text-muted-foreground mb-4">Arraste e solte arquivos ou pastas de áudio</p>}
        <div className="flex items-center gap-2 md:gap-3">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-muted text-foreground text-xs md:text-sm font-medium hover:bg-muted/80 transition-colors">
            <FileAudio size={14} />
            Arquivos
          </button>
          <button type="button" onClick={() => folderInputRef.current?.click()} className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs md:text-sm font-medium hover:bg-primary/90 transition-colors">
            <FolderOpen size={14} />
            Pasta
          </button>
        </div>
        <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground mt-3 md:mt-4">
          <Music size={12} />
          <span>MP3, WAV, OGG, M4A, FLAC</span>
        </div>
      </div>
    </div>
  );
}
