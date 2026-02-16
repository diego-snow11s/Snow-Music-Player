import { useState, useRef, useCallback, useEffect } from 'react';
import { Track, RepeatMode } from '@/types/music';

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodesRef = useRef<GainNode[]>([]);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [queue, setQueue] = useState<Track[]>([]);
  const [originalQueue, setOriginalQueue] = useState<Track[]>([]);
  const [equalizerGains, setEqualizerGains] = useState<number[]>([0, 0, 0, 0, 0]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => handleTrackEnd();
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current && audioRef.current) {
      audioContextRef.current = new AudioContext();
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);

      const frequencies = [60, 250, 1000, 4000, 16000];
      gainNodesRef.current = frequencies.map((freq, index) => {
        const filter = audioContextRef.current!.createBiquadFilter();
        filter.type = index === 0 ? 'lowshelf' : index === frequencies.length - 1 ? 'highshelf' : 'peaking';
        filter.frequency.value = freq;
        filter.gain.value = equalizerGains[index];
        filter.Q.value = 1;
        return filter as unknown as GainNode;
      });

      let prevNode: AudioNode = sourceRef.current;
      gainNodesRef.current.forEach((filter) => {
        prevNode.connect(filter as unknown as AudioNode);
        prevNode = filter as unknown as AudioNode;
      });
      prevNode.connect(audioContextRef.current.destination);
    }
  }, [equalizerGains]);

  const handleTrackEnd = useCallback(() => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      playNext();
    }
  }, [repeatMode]);

  const playTrack = useCallback((track: Track) => {
    if (audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.load();
      audioRef.current.play().catch(console.error);
      setCurrentTrack(track);
      initAudioContext();
    }
  }, [initAudioContext]);

  const play = useCallback(() => {
    if (audioRef.current && currentTrack) {
      audioContextRef.current?.resume();
      audioRef.current.play().catch(console.error);
    }
  }, [currentTrack]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((value: number) => {
    if (audioRef.current) {
      audioRef.current.volume = value;
      setVolumeState(value);
      if (value > 0) setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const toggleShuffle = useCallback(() => {
    if (isShuffled) {
      setQueue(originalQueue);
    } else {
      setQueue(shuffleArray(queue));
    }
    setIsShuffled(!isShuffled);
  }, [isShuffled, queue, originalQueue]);

  const cycleRepeatMode = useCallback(() => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  }, [repeatMode]);

  const playNext = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    let nextIndex = currentIndex + 1;
    
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return;
      }
    }
    
    playTrack(queue[nextIndex]);
  }, [currentTrack, queue, repeatMode, playTrack]);

  const playPrevious = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    
    if (currentTime > 3) {
      seek(0);
      return;
    }
    
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    let prevIndex = currentIndex - 1;
    
    if (prevIndex < 0) {
      if (repeatMode === 'all') {
        prevIndex = queue.length - 1;
      } else {
        seek(0);
        return;
      }
    }
    
    playTrack(queue[prevIndex]);
  }, [currentTrack, queue, currentTime, repeatMode, playTrack, seek]);

  const setPlaylist = useCallback((tracks: Track[], startIndex = 0) => {
    setOriginalQueue(tracks);
    setQueue(isShuffled ? shuffleArray(tracks) : tracks);
    if (tracks[startIndex]) {
      playTrack(tracks[startIndex]);
    }
  }, [isShuffled, playTrack]);

  const updateEqualizerBand = useCallback((index: number, gain: number) => {
    const newGains = [...equalizerGains];
    newGains[index] = gain;
    setEqualizerGains(newGains);
    
    if (gainNodesRef.current[index]) {
      (gainNodesRef.current[index] as unknown as BiquadFilterNode).gain.value = gain;
    }
  }, [equalizerGains]);

  return {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    queue,
    equalizerGains,
    playTrack,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    playNext,
    playPrevious,
    setPlaylist,
    updateEqualizerBand,
  };
}
