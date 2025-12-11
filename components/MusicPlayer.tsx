import React, { useEffect, useRef } from 'react';

interface MusicPlayerProps {
  playing: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ playing }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set a pleasant background volume
    audio.volume = 0.4;

    if (playing) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .catch((error) => {
             // Swallow "The play() request was interrupted" errors which happen often when toggling fast
             if (error.name !== 'AbortError') {
                 console.log("Playback start error:", error.message);
             }
          });
      }
    } else {
      audio.pause();
    }
  }, [playing]);

  return (
    <audio 
      ref={audioRef} 
      loop 
      preload="auto"
      // Removed crossOrigin to avoid unnecessary CORS checks that might block standard playback
      onError={(e) => {
          const target = e.currentTarget;
          const errorCode = target.error ? target.error.code : 'Unknown';
          const errorMessage = target.error ? target.error.message : 'No specific error message';
          console.warn(`Audio source failed. Code: ${errorCode}, Message: ${errorMessage}`);
      }}
    >
      {/* Source 1: Archive.org (Very stable) */}
      <source 
        src="https://archive.org/download/JingleBells_334/Jingle%20Bells.mp3" 
        type="audio/mpeg" 
      />
      {/* Source 2: Wikimedia OGG */}
      <source 
        src="https://upload.wikimedia.org/wikipedia/commons/e/e8/Kevin_MacLeod_-_Jingle_Bells.ogg" 
        type="audio/ogg" 
      />
       {/* Source 3: Wikimedia MP3 Transcode */}
       <source 
        src="https://upload.wikimedia.org/wikipedia/commons/transcoded/e/e8/Kevin_MacLeod_-_Jingle_Bells.ogg/Kevin_MacLeod_-_Jingle_Bells.ogg.mp3" 
        type="audio/mpeg" 
      />
    </audio>
  );
};

export default MusicPlayer;