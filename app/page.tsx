'use client';

import { useState, useEffect, useRef } from 'react';
import DecryptedText from './components/DecryptedText';
import { Instagram, Youtube, Twitter } from 'lucide-react';
import { SiTiktok } from 'react-icons/si';

export default function Home() {
  const [showWhiteScreen, setShowWhiteScreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(-1);
  const [showTitle, setShowTitle] = useState(false);
  const [showTitleBg, setShowTitleBg] = useState(false);
  const [fadeOutTitle, setFadeOutTitle] = useState(false);
  const [containerOpacity, setContainerOpacity] = useState(1);
  const [blackBarsVisible, setBlackBarsVisible] = useState(false);
  const [blackBarsAnimateOut, setBlackBarsAnimateOut] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSoundtrack, setShowSoundtrack] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showStoryDropdown, setShowStoryDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [showRestartButtons, setShowRestartButtons] = useState(false);
  const [showAboutPage, setShowAboutPage] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const secondAudioRef = useRef<HTMLAudioElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const audioInitializedRef = useRef(false);
  const timelineStartedRef = useRef(false);
  const timelineSkippedRef = useRef(false);
  
  const soundtrack = [
    { name: 'Opening', file: '/assets/opening cinematic.wav' },
    { name: 'Warm Memories', file: '/assets/warm memories.wav' },
    { name: 'Beautiful', file: '/assets/beautiful.wav' },
    { name: 'Fallacy', file: '/assets/fallacy.wav' },
    { name: 'Jasmine', file: '/assets/jasmine.wav' }
  ];

  const slides = [
    "I was a dreamer once. I dreamt of love, of peace, of happiness.",
    "But they... They took that dream from me and stripped me of any purpose.",
    "And a man without purpose will always come back to his old ways.",
    "Unfortunately for them, my old ways can be extremely brutal."
  ];

  const wait = (ms: number) => new Promise((res) => setTimeout(res, Math.max(ms, 0)));

  const transitionToWhiteScreen = async () => {
    // Fade out all buttons
    setShowButtons(false);
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
      
      // Check if user skipped
      if (timelineSkippedRef.current) return;

      // Fade out current slide
      setCurrentSlide(-1);
      await wait(FADE_MS);
      
      // Check if user skipped
      if (timelineSkippedRef.current) return;

      // Swap to next slide and fade in on the cue
      setCurrentSlide(i);
    }

    // 3) Title card at its cue time
    const lastCue = cueTimesMs[cueTimesMs.length - 1];
    await wait((titleCueMs - FADE_MS) - lastCue);
    
    // Check if user skipped
    if (timelineSkippedRef.current) return;
    
    setCurrentSlide(-1);
    
    // Wait 0.5 seconds before starting letterbox transition
    await wait(500);
    
    // Check if user skipped
    if (timelineSkippedRef.current) return;
    
    // Start animating black bars out (4s animation)
    setBlackBarsAnimateOut(true);
    
    await wait(4000); // Updated to match 4s letterbox animation
    
    // Check if user skipped
    if (timelineSkippedRef.current) return;

    // Show title with background
    setShowTitleBg(true);
    setShowTitle(true);
    
    // Fade in restart buttons after letterbox transition
    await wait(500);
    setShowRestartButtons(true);
  };

  const handleBeginClick = async () => {
    console.log('BEGIN button clicked!');
    
    // Prevent double initialization
    if (audioInitializedRef.current) {
      console.log('Audio already initialized, skipping');
      return;
    }
    
    try {
      // Stop any currently playing soundtrack
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (secondAudioRef.current && isPlaying) {
        secondAudioRef.current.pause();
        secondAudioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      
      // Initialize first audio (cinematic opening track)
      audioRef.current = new Audio('/assets/opening.wav');
      audioRef.current.loop = false;
      audioRef.current.preload = 'auto';
      
      // Set up event listener for when first audio ends
      audioRef.current.addEventListener('ended', handleFirstAudioEnd);

      // Initialize second audio (preload only)
      secondAudioRef.current = new Audio('/assets/warm memories.wav');
      secondAudioRef.current.loop = true;
      secondAudioRef.current.preload = 'auto';
      secondAudioRef.current.volume = 0;

      // Mark as initialized
      audioInitializedRef.current = true;

      // Prime audio: start muted
      audioRef.current.volume = 0.0;
      audioRef.current.currentTime = 0;

      await audioRef.current.play();
      console.log('Music primed (muted).');

      // Record timeline start
      timelineStartedRef.current = true;

      // Start the transition
      transitionToWhiteScreen();
    } catch (error) {
      console.error('Could not play music:', error);
      alert('Could not play audio. Please check if the audio file exists and your browser supports audio playback.');
    }
  };

  const handleFirstAudioEnd = async () => {
    console.log('First audio ended, starting second audio with fade');
    
    // Start second audio first
    if (secondAudioRef.current) {
      try {
        await secondAudioRef.current.play();
        
        // Start fading out title screen, social icons, and restart buttons as audio fades in
        setFadeOutTitle(true);
        setShowRestartButtons(false);
        
        // After fade completes, hide the element
        setTimeout(() => {
          setShowTitle(false);
        }, 4000);
        
        // Fade in second audio over 3 seconds
        const fadeSteps = 30;
        const fadeInterval = 3000 / fadeSteps;
        const targetVolume = isMuted ? 0 : 0.7;
        
        for (let i = 0; i <= fadeSteps; i++) {
          setTimeout(() => {
            if (secondAudioRef.current && !isMuted) {
              secondAudioRef.current.volume = (targetVolume * i) / fadeSteps;
            }
          }, fadeInterval * i);
        }
      } catch (error) {
        console.error('Error playing second audio:', error);
      }
    }
  };

  // Simple skip to predefined points
  const skipToPoint = async (point: number) => {
    if (!audioRef.current || !audioInitializedRef.current || !timelineStartedRef.current) {
      console.log('Timeline not started yet');
      return;
    }
    
    console.log(`Skipping to point ${point}`);
    
    // Stop the old timeline
    timelineSkippedRef.current = true;
    
    const cueTimesMs = [2000, 8757, 15714, 22671];
    const titleCueMs = 29628;
    const FADE_MS = 1000;
    const letterboxStartTime = titleCueMs - FADE_MS + 500; // 29128ms
    
    // Helper to continue timeline from a specific slide
    const continueFromSlide = async (slideIndex: number, startTime: number) => {
      // Reset skip flag to allow new timeline to run
      timelineSkippedRef.current = false;
      
      // Set audio and slide
      audioRef.current!.currentTime = startTime / 1000;
      setCurrentSlide(slideIndex);
      setShowTitle(false);
      setShowTitleBg(false);
      setBlackBarsVisible(true);
      setBlackBarsAnimateOut(false);
      
      // Calculate remaining timeline
      const remainingSlides = cueTimesMs.slice(slideIndex + 1);
      
      for (let i = 0; i < remainingSlides.length; i++) {
        const currentSlideIndex = slideIndex + 1 + i;
        const fadeOutStart = remainingSlides[i] - FADE_MS;
        const prevCue = i === 0 ? startTime : remainingSlides[i - 1];
        await wait(fadeOutStart - prevCue);
        
        if (timelineSkippedRef.current) return;
        
        setCurrentSlide(-1);
        await wait(FADE_MS);
        
        if (timelineSkippedRef.current) return;
        
        setCurrentSlide(currentSlideIndex);
      }
      
      // Continue to title card
      const lastCue = slideIndex < cueTimesMs.length - 1 ? remainingSlides[remainingSlides.length - 1] : startTime;
      await wait((titleCueMs - FADE_MS) - lastCue);
      
      if (timelineSkippedRef.current) return;
      
      setCurrentSlide(-1);
      await wait(500);
      
      if (timelineSkippedRef.current) return;
      
      setBlackBarsAnimateOut(true);
      await wait(4000);
      
      if (timelineSkippedRef.current) return;
      
      setShowTitleBg(true);
      setShowTitle(true);
    };
    
    // Jump to specific points
    switch(point) {
      case 1: // Jump to slide 1
        await continueFromSlide(0, cueTimesMs[0]);
        break;
        
      case 2: // Jump to slide 2
        await continueFromSlide(1, cueTimesMs[1]);
        break;
        
      case 3: // Jump to slide 3
        await continueFromSlide(2, cueTimesMs[2]);
        break;
        
      case 4: // Jump to slide 4
        await continueFromSlide(3, cueTimesMs[3]);
        break;
        
      case 5: // Jump to letterbox animation
        timelineSkippedRef.current = false;
        audioRef.current.currentTime = letterboxStartTime / 1000;
        setCurrentSlide(-1);
        setShowTitle(false);
        setShowTitleBg(false);
        setBlackBarsVisible(true);
        setBlackBarsAnimateOut(true);
        
        await wait(4000);
        if (timelineSkippedRef.current) return;
        
        setShowTitleBg(true);
        setShowTitle(true);
        break;
        
      case 6: // Jump to title card
        timelineSkippedRef.current = false;
        audioRef.current.currentTime = titleCueMs / 1000;
        setCurrentSlide(-1);
        setShowTitle(true);
        setShowTitleBg(true);
        setBlackBarsVisible(false);
        setBlackBarsAnimateOut(true);
        break;
        
      case 7: // Jump to warm memories transition
        timelineSkippedRef.current = false;
        // Stop first audio if playing
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        // Trigger transition
        await handleFirstAudioEnd();
        break;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      // Unmute
      if (audioRef.current) audioRef.current.volume = 0.7;
      if (secondAudioRef.current) secondAudioRef.current.volume = 0.7;
      setIsMuted(false);
    } else {
      // Mute
      if (audioRef.current) audioRef.current.volume = 0;
      if (secondAudioRef.current) secondAudioRef.current.volume = 0;
      setIsMuted(true);
    }
  };
  
  const playTrack = async (index: number) => {
    setCurrentTrackIndex(index);
    const track = soundtrack[index];
    
    console.log('Playing track:', track.name, track.file);
    
    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (secondAudioRef.current) {
      secondAudioRef.current.pause();
      secondAudioRef.current.currentTime = 0;
    }
    
    // Create new audio element and play
    const newAudio = new Audio(track.file);
    newAudio.volume = isMuted ? 0 : 0.7;
    
    // Set up time update listeners
    newAudio.addEventListener('loadedmetadata', () => {
      setDuration(newAudio.duration);
      console.log('Track loaded, duration:', newAudio.duration);
    });
    
    newAudio.addEventListener('timeupdate', () => {
      setCurrentTime(newAudio.currentTime);
    });
    
    newAudio.addEventListener('ended', () => {
      setCurrentTime(0);
      setIsPlaying(false);
    });
    
    newAudio.addEventListener('play', () => {
      setIsPlaying(true);
    });
    
    newAudio.addEventListener('pause', () => {
      setIsPlaying(false);
    });
    
    newAudio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      console.error('Failed to load:', track.file);
    });
    
    try {
      await newAudio.play();
      setIsPlaying(true);
      console.log('Track playing successfully');
    } catch (error) {
      console.error('Error playing track:', error);
      console.error('Track file:', track.file);
      setIsPlaying(false);
    }
    
    // Store the audio in the appropriate ref for first two tracks, or use a generic reference
    if (index === 0) {
      audioRef.current = newAudio;
    } else if (index === 1) {
      secondAudioRef.current = newAudio;
    } else {
      // For tracks beyond the first two, use secondAudioRef as the active player
      secondAudioRef.current = newAudio;
    }
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    // Use the appropriate audio ref based on track index
    const activeAudio = currentTrackIndex === 0 ? audioRef.current : secondAudioRef.current;
    
    if (activeAudio) {
      activeAudio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const togglePlayPause = () => {
    const activeAudio = currentTrackIndex === 0 ? audioRef.current : secondAudioRef.current;
    
    if (activeAudio) {
      if (isPlaying) {
        activeAudio.pause();
        setIsPlaying(false);
      } else {
        activeAudio.play().then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.error('Error resuming playback:', error);
        });
      }
    }
  };
  
  const handleStoryClick = () => {
    setShowStoryDropdown(!showStoryDropdown);
  };
  
  const skipToNextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % soundtrack.length;
    playTrack(nextIndex);
  };
  
  const skipToPreviousTrack = () => {
    const prevIndex = (currentTrackIndex - 1 + soundtrack.length) % soundtrack.length;
    playTrack(prevIndex);
  };


  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleBeginClick();
      }
      
      // Number keys 1-7 to skip to different points
      if (event.key >= '1' && event.key <= '7') {
        event.preventDefault();
        skipToPoint(parseInt(event.key));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mounted]);

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
        {currentSlide >= 0 && (
          <div className={`white-screen-text visible`} id="white-screen-text">
            <DecryptedText
              key={`slide-${currentSlide}`}
              text={slides[currentSlide]}
              animateOn="view"
              speed={50}
              maxIterations={15}
              sequential={true}
              revealDirection="start"
            />
          </div>
        )}
        
        <div className={`title-card ${showTitle ? 'slide-in' : ''} ${fadeOutTitle ? 'fade-out' : ''}`}>
          <span className="title-skyline">SKYLINE</span>{' '}
          <span className="title-fallacy">FALLACY</span>
        </div>
        
        {/* Social Media Icons - Visible when title card is shown */}
        {showTitle && (
          <div className="social-icons">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="Instagram"
            >
              <Instagram size={28} />
            </a>
            <a 
              href="https://tiktok.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="TikTok"
            >
              <SiTiktok size={28} />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="YouTube"
            >
              <Youtube size={28} />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="X (Twitter)"
            >
              <Twitter size={28} />
            </a>
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
              {isMuted ? 'UNMUTE' : 'MUTE'}
            </button>
          </>
        )}
      </div>
      
      {/* Homepage Buttons */}
      {showButtons && (
        <div className="container homepage-buttons-container" style={{ opacity: containerOpacity, transition: 'opacity 0.8s ease-in-out' }}>
          {/* Soundtrack Box - Center of left third */}
          <div className="soundtrack-container" style={{
            position: 'fixed',
            top: '50%',
            left: '16.66%',
            transform: 'translate(-50%, -50%)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}>
            <button 
              className="homepage-button soundtrack-toggle"
              onClick={() => setShowSoundtrack(!showSoundtrack)}
              style={{
                margin: 0,
                padding: '12px 20px'
              }}
            >
              Soundtrack
            </button>
            
            {showSoundtrack && (
              <>
                <div className="soundtrack-list">
                  {soundtrack.map((track, index) => (
                    <div 
                      key={index}
                      className={`soundtrack-item ${currentTrackIndex === index && isPlaying ? 'active' : ''}`}
                      onClick={() => playTrack(index)}
                    >
                      {track.name}
                    </div>
                  ))}
                </div>
                
                {isPlaying && (
                  <div className="soundtrack-controls">
                    <div className="soundtrack-time-display">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="soundtrack-progress-bar"
                    />
                    
                    <div className="soundtrack-nav">
                      <button 
                        className="soundtrack-nav-btn"
                        onClick={skipToPreviousTrack}
                        disabled={currentTrackIndex === 0}
                      >
                        ◄ Prev
                      </button>
                      
                      <button 
                        className="soundtrack-play-pause-btn"
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? '⏸' : '▶'}
                      </button>
                      
                      <button 
                        className="soundtrack-nav-btn"
                        onClick={skipToNextTrack}
                        disabled={currentTrackIndex === soundtrack.length - 1}
                      >
                        Next ►
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Begin Button - Center of middle column */}
          <button 
            ref={buttonRef}
            className="homepage-button begin-button"
            onClick={handleBeginClick}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10
            }}
            onMouseDown={() => {
              if (buttonRef.current) {
                buttonRef.current.style.transform = 'scale(0.95) translate(-50%, -50%)';
                setTimeout(() => {
                  if (buttonRef.current) {
                    buttonRef.current.style.transform = 'scale(1) translate(-50%, -50%)';
                  }
                }, 150);
              }
            }}
          >
            Begin
          </button>
          
          {/* Story Button - Center of right third */}
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '83.33%',
            transform: 'translateY(-50%)',
            zIndex: 10
          }}>
            <button 
              className="homepage-button story-button"
              onClick={handleStoryClick}
              style={{
                margin: 0,
                padding: '12px 20px'
              }}
            >
              Story
            </button>
            
            {showStoryDropdown && (
              <div style={{
                marginTop: '15px',
                background: 'rgba(0, 0, 0, 0.9)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                padding: '20px',
                borderRadius: '4px',
                maxWidth: '500px',
                color: '#ffffff',
                fontFamily: 'Press Start 2P, monospace',
                fontSize: '10px',
                lineHeight: '1.6',
                backdropFilter: 'blur(10px)',
                whiteSpace: 'normal',
                wordWrap: 'break-word'
              }}>
                Skyline Fallacy follows the story of...
              </div>
            )}
          </div>
          
          {/* About Us Button */}
          <button 
            className="homepage-button about-us-button"
            onClick={() => setShowAboutPage(true)}
            style={{
              position: 'fixed',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              padding: '8px 14px',
              fontSize: '10px'
            }}
          >
            About Us
          </button>
        </div>
      )}
      
      {/* Restart Buttons - shown after letterbox transition */}
      {showRestartButtons && (
        <div className="container restart-buttons-container" style={{ 
          opacity: showRestartButtons ? 1 : 0,
          transition: 'opacity 1s ease-in-out'
        }}>
          {/* Soundtrack Box - Center of left third */}
          <div className="soundtrack-container" style={{
            position: 'fixed',
            top: '50%',
            left: '16.66%',
            transform: 'translate(-50%, -50%)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}>
          <button 
            className="homepage-button soundtrack-toggle"
            onClick={() => setShowSoundtrack(!showSoundtrack)}
            style={{
              margin: 0,
              padding: '12px 20px'
            }}
          >
            Soundtrack
          </button>
          
          {showSoundtrack && (
            <>
              <div className="soundtrack-list">
                {soundtrack.map((track, index) => (
                  <button
                    key={index}
                    className={`soundtrack-item ${currentTrackIndex === index ? 'active' : ''}`}
                    onClick={() => playTrack(index)}
                  >
                    {track.name}
                  </button>
                ))}
              </div>
              
              {/* Progress bar and controls */}
              <div className="soundtrack-controls">
                <div className="soundtrack-progress-container">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="soundtrack-progress-bar"
                  />
                </div>
                <div className="soundtrack-time-display">
                  <span>{formatTime(currentTime)}</span>
                  <span>/</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div className="soundtrack-nav">
                  <button 
                    className="soundtrack-nav-btn"
                    onClick={skipToPreviousTrack}
                    aria-label="Previous track"
                  >
                    ◀
                  </button>
                  <button 
                    className="soundtrack-play-pause-btn"
                    onClick={togglePlayPause}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? '⏸' : '▶'}
                  </button>
                  <span className="soundtrack-nav-info">
                    {currentTrackIndex + 1} / {soundtrack.length}
                  </span>
                  <button 
                    className="soundtrack-nav-btn"
                    onClick={skipToNextTrack}
                    aria-label="Next track"
                  >
                    ▶
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Restart Button - Center of middle column */}
        <button 
          className="homepage-button begin-button"
          onClick={() => window.location.reload()}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}
        >
          Restart
        </button>
        
        {/* Story Button - Center of right third */}
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '83.33%',
          transform: 'translateY(-50%)',
          zIndex: 10
        }}>
          <button 
            className="homepage-button story-button"
            onClick={handleStoryClick}
            style={{
              margin: 0,
              padding: '12px 20px'
            }}
          >
            Story
          </button>
          
          {showStoryDropdown && (
            <div style={{
              marginTop: '15px',
              background: 'rgba(0, 0, 0, 0.9)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              padding: '20px',
              borderRadius: '4px',
              maxWidth: '500px',
              color: '#ffffff',
              fontFamily: 'Press Start 2P, monospace',
              fontSize: '10px',
              lineHeight: '1.6',
              backdropFilter: 'blur(10px)',
              whiteSpace: 'normal',
              wordWrap: 'break-word'
            }}>
              Skyline Fallacy follows the story of...
            </div>
          )}
        </div>
      </div>
      )}
      
      {/* About Us Page */}
      {showAboutPage && (
        <div className="about-page" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px'
        }}>
          {/* Background Image */}
          <div className="cinematic-bg" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/assets/image6.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3,
            zIndex: -1
          }} />
          
          <div style={{
            maxWidth: '800px',
            background: 'rgba(0, 0, 0, 0.85)',
            padding: '40px',
            borderRadius: '8px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <h1 style={{
              fontFamily: 'Press Start 2P, monospace',
              fontSize: '24px',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: '40px',
              letterSpacing: '2px'
            }}>
              About Us
            </h1>
            
            <div style={{
              fontFamily: 'Press Start 2P, monospace',
              fontSize: '10px',
              lineHeight: '2',
              color: '#ffffff',
              marginBottom: '30px'
            }}>
              <h2 style={{ fontSize: '14px', marginBottom: '20px', color: '#ff69b4' }}>Ojas Agarwal</h2>
              <p style={{ marginBottom: '30px' }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
              
              <h2 style={{ fontSize: '14px', marginBottom: '20px', color: '#87ceeb' }}>Ani Potts</h2>
              <p>
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. 
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, 
                eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              </p>
            </div>
            
            <button 
              onClick={() => setShowAboutPage(false)}
              style={{
                background: '#000000',
                border: '2px solid #ffffff',
                color: '#ffffff',
                padding: '12px 24px',
                fontSize: '12px',
                fontFamily: 'Press Start 2P, monospace',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                display: 'block',
                margin: '0 auto'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#000000';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

