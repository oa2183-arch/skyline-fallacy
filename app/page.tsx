'use client';

import { useState, useEffect, useRef } from 'react';
import DecryptedText from './components/DecryptedText';

export default function Home() {
  const [showWhiteScreen, setShowWhiteScreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(-1);
  const [showTitle, setShowTitle] = useState(false);
  const [showTitleBg, setShowTitleBg] = useState(false);
  const [containerOpacity, setContainerOpacity] = useState(1);
  const [blackBarsVisible, setBlackBarsVisible] = useState(false);
  const [blackBarsAnimateOut, setBlackBarsAnimateOut] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const slides = [
    "I was a dreamer once. I dreamt of love, of peace, of happiness.",
    "But they... They took that dream from me and stripped me of any purpose.",
    "And a man without purpose will always come back to his old ways.",
    "Unfortunately for them, my old ways can be extremely brutal."
  ];

  const wait = (ms: number) => new Promise((res) => setTimeout(res, Math.max(ms, 0)));

  const transitionToWhiteScreen = async () => {
    // Fade out Begin button
    setContainerOpacity(0);

    // After the button fade, show screen and run timeline
    await wait(800);
    setShowWhiteScreen(true);
    setBlackBarsVisible(true);

    // =================== TIMING ===================
    const cueTimesMs = [
      2000,    // Slide 1 at 2s (also when music fades in)
      8757,    // Slide 2
      15714,   // Slide 3
      22671    // Slide 4
    ];

    const titleCueMs = 29628; // Title card
    // ==============================================

    const FADE_MS = 1000;
    const MUSIC_TARGET_VOL = 0.7;
    const MUSIC_FADE_MS = 400;

    // 1) Wait until Slide 1 cue
    await wait(cueTimesMs[0]);

    // Show Slide 1
    setCurrentSlide(0);

    // Fade music in exactly with Slide 1
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.0;
      
      const steps = 20;
      const stepTime = MUSIC_FADE_MS / steps;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const v = (MUSIC_TARGET_VOL * step) / steps;
        if (audioRef.current) audioRef.current.volume = Math.min(MUSIC_TARGET_VOL, v);
        if (step >= steps) clearInterval(timer);
      }, stepTime);
    }

    // 2) Slides 2–4 at their cue times
    for (let i = 1; i < slides.length; i++) {
      const fadeOutStart = cueTimesMs[i] - FADE_MS;
      const prevCue = cueTimesMs[i - 1];
      await wait(fadeOutStart - prevCue);

      // Fade out current slide
      setCurrentSlide(-1);
      await wait(FADE_MS);

      // Swap to next slide and fade in on the cue
      setCurrentSlide(i);
    }

    // 3) Title card at its cue time
    const lastCue = cueTimesMs[cueTimesMs.length - 1];
    await wait((titleCueMs - FADE_MS) - lastCue);
    setCurrentSlide(-1);
    
    // Wait 0.5 seconds before starting letterbox transition
    await wait(500);
    
    // Start animating black bars out (4s animation)
    setBlackBarsAnimateOut(true);
    
    await wait(4000); // Updated to match 4s letterbox animation

    // Show title with background
    setShowTitleBg(true);
    setShowTitle(true);
  };

  const handleBeginClick = async () => {
    console.log('BEGIN button clicked!');
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/assets/opening.wav');
        audioRef.current.loop = false;
        audioRef.current.preload = 'auto';
      }

      // Prime audio: start muted
      audioRef.current.volume = 0.0;
      audioRef.current.currentTime = 0;
      audioRef.current.loop = false;

      await audioRef.current.play();
      console.log('Music primed (muted).');

      // Start the transition
      transitionToWhiteScreen();
    } catch (error) {
      console.error('Could not play music:', error);
      alert('Could not play audio. Please check if the audio file exists and your browser supports audio playback.');
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = 0.7;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleBeginClick();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="three-panel-container" id="three-panels">
        <div className="panel panel-left" id="panel-1"></div>
        <div className="panel panel-center" id="panel-2"></div>
        <div className="panel panel-right" id="panel-3"></div>
      </div>
      
      <div className={`white-screen ${showWhiteScreen ? 'visible' : ''}`} id="white-screen">
        <div className="star-bg"></div>
        
        {/* Cinematic placeholder background image */}
        <div className="cinematic-bg"></div>
        
        {/* Letterbox black bars */}
        {blackBarsVisible && (
          <>
            <div className={`letterbox-bar letterbox-top ${blackBarsAnimateOut ? 'slide-out' : ''}`}></div>
            <div className={`letterbox-bar letterbox-bottom ${blackBarsAnimateOut ? 'slide-out' : ''}`}></div>
          </>
        )}
        
        {showTitleBg && <div className={`title-card-bg ${showTitleBg ? 'visible' : ''}`}></div>}
        
        {/* Text positioned on bottom letterbox bar */}
        <div className={`white-screen-text ${currentSlide >= 0 ? 'visible' : ''}`} id="white-screen-text">
          {currentSlide >= 0 && (
            <DecryptedText
              text={slides[currentSlide]}
              animateOn="view"
              speed={50}
              maxIterations={15}
              sequential={true}
              revealDirection="start"
            />
          )}
        </div>
        
        {showTitle && (
          <div className={`title-card ${showTitle ? 'slide-in' : ''}`}>
            <span className="title-skyline">SKYLINE</span>{' '}
            <span className="title-fallacy">FALLACY</span>
          </div>
        )}
        
        {/* Control buttons */}
        {showWhiteScreen && (
          <>
            {/* Mute/Unmute button */}
            <button 
              className="control-btn mute-btn"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </>
        )}
      </div>
      
      <div className="container" style={{ opacity: containerOpacity, transition: 'opacity 0.8s ease-in-out' }}>
        <button 
          ref={buttonRef}
          className="neon-button"
          onClick={handleBeginClick}
          onMouseDown={() => {
            if (buttonRef.current) {
              buttonRef.current.style.transform = 'scale(0.95)';
              setTimeout(() => {
                if (buttonRef.current) {
                  buttonRef.current.style.transform = 'scale(1)';
                }
              }, 150);
            }
          }}
        >
          <span className="button-text">Begin</span>
          <div className="button-glow"></div>
        </button>
      </div>
    </>
  );
}

