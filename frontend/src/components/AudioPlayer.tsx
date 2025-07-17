'use client';

import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  src: string;
  title: string;
  artist: string;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
}

export default function AudioPlayer({ src, title, artist, onPlay, onPause, className = '' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onPause?.();
    };
    const handleError = () => setError('Failed to load audio');

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onPause]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        onPause?.();
      } else {
        await audio.play();
        setIsPlaying(true);
        onPlay?.();
      }
    } catch (error) {
      setError('Failed to play audio');
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value) / 100;
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`bg-black bg-opacity-20 backdrop-blur-lg rounded-lg p-4 border border-purple-500/20 ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {error && (
        <div className="text-red-400 text-sm mb-2">{error}</div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium truncate">{title}</h4>
          <p className="text-purple-200 text-sm truncate">{artist}</p>
        </div>
        
        <button
          onClick={togglePlay}
          className="ml-4 w-10 h-10 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
          disabled={!src}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      <div className="space-y-2">
        {/* Progress Bar */}
        <div className="flex items-center space-x-2">
          <span className="text-purple-300 text-xs">{formatTime(currentTime)}</span>
          <div className="flex-1 relative">
            <div className="w-full h-2 bg-purple-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-100"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercentage}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-purple-300 text-xs">{formatTime(duration)}</span>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <span className="text-purple-300 text-xs">🔊</span>
          <div className="flex-1 relative">
            <div className="w-full h-1 bg-purple-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-400 transition-all duration-100"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={handleVolumeChange}
              className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}