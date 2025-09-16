'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidingNumber } from '@/components/ui/sliding-number';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<'clock' | 'timer'>('clock');
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#DFF0C4');
  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient' | 'dark'>('solid');
  const [showButtons, setShowButtons] = useState(false);
  const [mouseTimeout, setMouseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [weatherTemp, setWeatherTemp] = useState(22);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherLocation, setWeatherLocation] = useState<string>('');
  const [showCursor, setShowCursor] = useState(true);
  const [showThemeButtons, setShowThemeButtons] = useState(false);
  const [showSeconds, setShowSeconds] = useState(true);
  const [orientationKey, setOrientationKey] = useState(0);
  
  // Focus Timer states
  const [timerDuration, setTimerDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [timerType, setTimerType] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  
  // Tab background dimensions
  const [tabDimensions, setTabDimensions] = useState({ clock: { width: 0, left: 0, height: 0, top: 0 }, timer: { width: 0, left: 0, height: 0, top: 0 } });

  const formatDate = (date: Date) => {
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const day = date.getDate();
    return `${weekday}, ${day}`;
  };

  // Weather fetching function
  const fetchWeather = async (lat: number, lon: number) => {
    setWeatherLoading(true);
    setWeatherError(null);
    
    try {
      // Using a free weather API (no API key required)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
      );
      
      if (!response.ok) {
        throw new Error('Weather data unavailable');
      }
      
      const data = await response.json();
      
      if (data.current_weather) {
        setWeatherTemp(Math.round(data.current_weather.temperature));
        // Location is already set from timezone detection
      } else {
        throw new Error('Invalid weather data');
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
      setWeatherError('Weather unavailable');
      setWeatherTemp(22); // Fallback temperature
    } finally {
      setWeatherLoading(false);
    }
  };

  // Get user location from timezone and fetch weather
  const getLocationAndWeather = useCallback(() => {
    try {
      // Get timezone from browser
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Convert timezone to approximate coordinates
      // This is a simplified mapping of major timezones to coordinates
      const timezoneToCoords: { [key: string]: { lat: number; lon: number; city: string } } = {
        'America/New_York': { lat: 40.7128, lon: -74.0060, city: 'New York' },
        'America/Chicago': { lat: 41.8781, lon: -87.6298, city: 'Chicago' },
        'America/Denver': { lat: 39.7392, lon: -104.9903, city: 'Denver' },
        'America/Los_Angeles': { lat: 34.0522, lon: -118.2437, city: 'Los Angeles' },
        'America/Toronto': { lat: 43.6532, lon: -79.3832, city: 'Toronto' },
        'America/Vancouver': { lat: 49.2827, lon: -123.1207, city: 'Vancouver' },
        'Europe/London': { lat: 51.5074, lon: -0.1278, city: 'London' },
        'Europe/Paris': { lat: 48.8566, lon: 2.3522, city: 'Paris' },
        'Europe/Berlin': { lat: 52.5200, lon: 13.4050, city: 'Berlin' },
        'Europe/Rome': { lat: 41.9028, lon: 12.4964, city: 'Rome' },
        'Europe/Madrid': { lat: 40.4168, lon: -3.7038, city: 'Madrid' },
        'Europe/Amsterdam': { lat: 52.3676, lon: 4.9041, city: 'Amsterdam' },
        'Europe/Stockholm': { lat: 59.3293, lon: 18.0686, city: 'Stockholm' },
        'Europe/Moscow': { lat: 55.7558, lon: 37.6176, city: 'Moscow' },
        'Asia/Tokyo': { lat: 35.6762, lon: 139.6503, city: 'Tokyo' },
        'Asia/Shanghai': { lat: 31.2304, lon: 121.4737, city: 'Shanghai' },
        'Asia/Hong_Kong': { lat: 22.3193, lon: 114.1694, city: 'Hong Kong' },
        'Asia/Singapore': { lat: 1.3521, lon: 103.8198, city: 'Singapore' },
        'Asia/Dubai': { lat: 25.2048, lon: 55.2708, city: 'Dubai' },
        'Asia/Kolkata': { lat: 28.7041, lon: 77.1025, city: 'Delhi' },
        'Asia/Seoul': { lat: 37.5665, lon: 126.9780, city: 'Seoul' },
        'Australia/Sydney': { lat: -33.8688, lon: 151.2093, city: 'Sydney' },
        'Australia/Melbourne': { lat: -37.8136, lon: 144.9631, city: 'Melbourne' },
        'Pacific/Auckland': { lat: -36.8485, lon: 174.7633, city: 'Auckland' },
        'America/Sao_Paulo': { lat: -23.5505, lon: -46.6333, city: 'São Paulo' },
        'America/Buenos_Aires': { lat: -34.6118, lon: -58.3960, city: 'Buenos Aires' },
        'Africa/Cairo': { lat: 30.0444, lon: 31.2357, city: 'Cairo' },
        'Africa/Johannesburg': { lat: -26.2041, lon: 28.0473, city: 'Johannesburg' }
      };

      const coords = timezoneToCoords[timezone];
      
      if (coords) {
        setWeatherLocation(coords.city);
        fetchWeather(coords.lat, coords.lon);
      } else {
        // Fallback: try to extract city from timezone string
        const cityName = timezone.split('/').pop()?.replace('_', ' ') || 'Unknown';
        setWeatherLocation(cityName);
        // Use a default location if timezone not recognized
        fetchWeather(51.5074, -0.1278); // London as fallback
      }
    } catch (error) {
      console.error('Timezone detection error:', error);
      setWeatherError('Location unavailable');
      setWeatherLocation('Unknown');
      // Fallback to London
      fetchWeather(51.5074, -0.1278);
    }
  }, []);

  // Set client-side state to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load saved state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('activeTab') as 'clock' | 'timer';
      const savedBackground = localStorage.getItem('backgroundColor');
      const savedBackgroundType = localStorage.getItem('backgroundType') as 'solid' | 'gradient' | 'dark';
      const savedShowSeconds = localStorage.getItem('showSeconds');
      const savedIsRunning = localStorage.getItem('isRunning') === 'true';
      const savedStartTime = parseInt(localStorage.getItem('startTime') || '0');
      const savedTimeLeft = parseInt(localStorage.getItem('timeLeft') || '1500');
      
      if (savedTab) setActiveTab(savedTab);
      if (savedBackground) setBackgroundColor(savedBackground);
      if (savedBackgroundType) setBackgroundType(savedBackgroundType);
      if (savedShowSeconds !== null) setShowSeconds(savedShowSeconds === 'true');
      
      // Calculate remaining time if timer was running
      if (savedIsRunning && savedStartTime > 0) {
        const elapsed = Math.floor((Date.now() - savedStartTime) / 1000);
        const remaining = Math.max(0, savedTimeLeft - elapsed);
        setTimeLeft(remaining);
        
        // If timer finished while away, auto-switch to break
        if (remaining === 0) {
          setIsRunning(false);
          const savedTimerType = localStorage.getItem('timerType') as 'focus' | 'shortBreak' | 'longBreak';
          if (savedTimerType === 'focus') {
            setTimerType('shortBreak');
            setTimerDuration(5 * 60);
            setTimeLeft(5 * 60);
          }
        }
      }
      
      setIsLoaded(true);
      
      // Fetch weather data on load
      getLocationAndWeather();
    } else {
      setIsLoaded(true);
    }
  }, [getLocationAndWeather]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Weather refresh every 10 minutes
  useEffect(() => {
    const weatherTimer = setInterval(() => {
      getLocationAndWeather();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(weatherTimer);
  }, [getLocationAndWeather]);

  // Save activeTab to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeTab', activeTab);
    }
  }, [activeTab]);

  // Save backgroundColor to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('backgroundColor', backgroundColor);
    }
  }, [backgroundColor]);

  // Save backgroundType to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('backgroundType', backgroundType);
    }
  }, [backgroundType]);

  // Save showSeconds to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showSeconds', showSeconds.toString());
    }
  }, [showSeconds]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
        (document as Document & { mozFullScreenElement?: Element }).mozFullScreenElement ||
        (document as Document & { msFullscreenElement?: Element }).msFullscreenElement
      );
      
      setIsFullscreen(isCurrentlyFullscreen);
      if (!isCurrentlyFullscreen) {
        setShowButtons(true);
        setShowCursor(true);
      }
    };

    // Add event listeners for different vendor prefixes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Save timer state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('timerDuration', timerDuration.toString());
    }
  }, [timerDuration]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('timeLeft', timeLeft.toString());
    }
  }, [timeLeft]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('timerType', timerType);
    }
  }, [timerType]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isRunning', isRunning.toString());
    }
  }, [isRunning]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isPaused', isPaused.toString());
    }
  }, [isPaused]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('startTime', startTime.toString());
    }
  }, [startTime]);

  // Focus Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished
      setIsRunning(false);
      // Auto-switch to break timer
      if (timerType === 'focus') {
        setTimerType('shortBreak');
        setTimerDuration(5 * 60);
        setTimeLeft(5 * 60);
      } else if (timerType === 'shortBreak') {
        setTimerType('focus');
        setTimerDuration(25 * 60);
        setTimeLeft(25 * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerType]);

  const hours = time.getHours() % 12 || 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const ampm = time.getHours() >= 12 ? 'PM' : 'AM';

  const toggleFullscreen = async () => {
    console.log('Fullscreen button clicked!', { isMobile, isFullscreen });
    
    if (!isFullscreen) {
      // Enter fullscreen
      try {
        if (isMobile) {
          // Check if PWA is already installed
          const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                              (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
          
          if (isStandalone) {
            // PWA is installed, try fullscreen
            try {
              if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
              } else if ((document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
                await (document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen!();
              } else if ((document.documentElement as HTMLElement & { mozRequestFullScreen?: () => Promise<void> }).mozRequestFullScreen) {
                await (document.documentElement as HTMLElement & { mozRequestFullScreen?: () => Promise<void> }).mozRequestFullScreen!();
              } else if ((document.documentElement as HTMLElement & { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen) {
                await (document.documentElement as HTMLElement & { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen!();
              }
              
              setIsFullscreen(true);
              setShowButtons(false);
              setShowCursor(false);
            } catch (error) {
              console.log('PWA fullscreen failed:', error);
              // Fallback to overlay mode
              setIsFullscreen(true);
              setShowButtons(false);
              setShowCursor(false);
            }
          } else {
            // Show PWA installation instructions
            const userAgent = navigator.userAgent;
            let instructions = '';
            
            if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
              instructions = `For true fullscreen experience:\n\n1. Tap the Share button (square with arrow up)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to install the app\n4. Open CO'WATCH! from your home screen\n\nThis will give you true fullscreen like a native app!`;
            } else if (userAgent.includes('Android')) {
              instructions = `For true fullscreen experience:\n\n1. Tap the menu (3 dots) in your browser\n2. Tap "Add to Home screen" or "Install App"\n3. Tap "Add" or "Install" to install the app\n4. Open CO'WATCH! from your home screen\n\nThis will give you true fullscreen like a native app!`;
            } else {
              instructions = `For true fullscreen experience:\n\n1. Look for "Install App" or "Add to Home Screen" in your browser menu\n2. Install the app to your device\n3. Open CO'WATCH! from your home screen\n\nThis will give you true fullscreen like a native app!`;
            }
            
            alert(instructions);
            
            // Still try the fullscreen API
            try {
              if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
              } else if ((document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
                await (document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen!();
              } else if ((document.documentElement as HTMLElement & { mozRequestFullScreen?: () => Promise<void> }).mozRequestFullScreen) {
                await (document.documentElement as HTMLElement & { mozRequestFullScreen?: () => Promise<void> }).mozRequestFullScreen!();
              } else if ((document.documentElement as HTMLElement & { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen) {
                await (document.documentElement as HTMLElement & { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen!();
              }
            } catch (error) {
              console.log('Mobile fullscreen API failed:', error);
            }
            
            // Set overlay mode
            setIsFullscreen(true);
            setShowButtons(false);
            setShowCursor(false);
            
            // Try to hide address bar
            setTimeout(() => {
              window.scrollTo(0, 1);
            }, 100);
          }
          
        } else {
          // Desktop fullscreen
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          } else if ((document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
            await (document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen!();
          } else if ((document.documentElement as HTMLElement & { mozRequestFullScreen?: () => Promise<void> }).mozRequestFullScreen) {
            await (document.documentElement as HTMLElement & { mozRequestFullScreen?: () => Promise<void> }).mozRequestFullScreen!();
          } else if ((document.documentElement as HTMLElement & { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen) {
            await (document.documentElement as HTMLElement & { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen!();
          }
          
          setIsFullscreen(true);
          setShowButtons(false);
          setShowCursor(false);
        }
        
      } catch (error) {
        console.log('Fullscreen failed:', error);
        // Fallback
        setIsFullscreen(true);
        setShowButtons(false);
        setShowCursor(false);
      }
    } else {
      // Exit fullscreen
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as Document & { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
          await (document as Document & { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen!();
        } else if ((document as Document & { mozCancelFullScreen?: () => Promise<void> }).mozCancelFullScreen) {
          await (document as Document & { mozCancelFullScreen?: () => Promise<void> }).mozCancelFullScreen!();
        } else if ((document as Document & { msExitFullscreen?: () => Promise<void> }).msExitFullscreen) {
          await (document as Document & { msExitFullscreen?: () => Promise<void> }).msExitFullscreen!();
        }
      } catch (error) {
        console.log('Exit fullscreen failed:', error);
      }
      
      setIsFullscreen(false);
      setShowButtons(true);
      setShowCursor(true);
    }
  };

  const handleMouseMove = () => {
    if (isFullscreen) {
      setShowButtons(true);
      setShowCursor(true);
      
      // Clear existing timeout
      if (mouseTimeout) {
        clearTimeout(mouseTimeout);
      }
      
      // Set new timeout to hide buttons and cursor after 3 seconds
      const timeout = setTimeout(() => {
        setShowButtons(false);
        setShowCursor(false);
      }, 3000);
      
      setMouseTimeout(timeout);
    }
  };

  const handleMouseLeave = () => {
    if (isFullscreen) {
      setShowButtons(false);
      setShowCursor(false);
      if (mouseTimeout) {
        clearTimeout(mouseTimeout);
      }
    }
  };

  const handleTouchStart = () => {
    if (isFullscreen && isMobile) {
      setShowButtons(true);
      setShowCursor(true);
      
      // Clear existing timeout
      if (mouseTimeout) {
        clearTimeout(mouseTimeout);
      }
      
      // Set new timeout to hide buttons after 3 seconds
      const timeout = setTimeout(() => {
        setShowButtons(false);
        setShowCursor(false);
      }, 3000);
      
      setMouseTimeout(timeout);
    }
  };

  // Timer functions
  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
    setStartTime(Date.now());
  };
  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
  };
  const endTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(timerDuration);
    setStartTime(0);
  };

  const setTimer = (minutes: number) => {
    const seconds = minutes * 60;
    setTimerDuration(seconds);
    setTimeLeft(seconds);
    setIsRunning(false);
    setIsPaused(false);
  };


  // Measure tab dimensions
  const measureTabDimensions = () => {
    const clockTab = document.getElementById('clock-tab');
    const timerTab = document.getElementById('timer-tab');
    
    if (clockTab && timerTab) {
      const clockRect = clockTab.getBoundingClientRect();
      const timerRect = timerTab.getBoundingClientRect();
      const containerRect = clockTab.parentElement?.getBoundingClientRect();
      
      if (containerRect) {
        setTabDimensions({
          clock: {
            width: clockRect.width,
            left: clockRect.left - containerRect.left,
            height: clockRect.height,
            top: clockRect.top - containerRect.top
          },
          timer: {
            width: timerRect.width,
            left: timerRect.left - containerRect.left,
            height: timerRect.height,
            top: timerRect.top - containerRect.top
          }
        });
      }
    }
  };

  // Set initial tab dimensions based on active tab
  useEffect(() => {
    if (isLoaded) {
      // Set initial dimensions based on current active tab
      const clockWidth = 72; // Actual width for "Watch" tab (padding + text)
      const timerWidth = 72; // Actual width for "Focus" tab (padding + text)
      const tabHeight = 36;
      const tabTop = 6;
      
      setTabDimensions({
        clock: {
          width: clockWidth,
          left: 6, // Left position for "Watch" tab
          height: tabHeight,
          top: tabTop
        },
        timer: {
          width: timerWidth,
          left: 6 + clockWidth + 6, // Left position for "Focus" tab (6px gap)
          height: tabHeight,
          top: tabTop
        }
      });
    }
  }, [isLoaded]);

  // Measure dimensions on mount and when active tab changes
  useEffect(() => {
    // Small delay to ensure DOM elements are rendered
    const timer = setTimeout(() => {
      measureTabDimensions();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Handle window resize and orientation change
  useEffect(() => {
    const handleResize = () => {
      setTimeout(measureTabDimensions, 100); // Small delay to ensure layout is updated
    };

    const handleOrientationChange = () => {
      // Force a re-render when orientation changes
      setTimeout(() => {
        measureTabDimensions();
        // Force component re-render by updating orientation key
        setOrientationKey(prev => prev + 1);
        setTime(new Date());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Also listen for screen orientation changes if available
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationChange);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (window.screen && window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange);
      }
    };
  }, []);

  // Mobile landscape optimizations
  const isMobile = isClient && typeof window !== 'undefined' && window.innerWidth <= 768;
  const isLandscape = isClient && typeof window !== 'undefined' && window.innerWidth > window.innerHeight;
  const isPortrait = isClient && typeof window !== 'undefined' && window.innerHeight > window.innerWidth && window.innerWidth <= 768;
  
  // More reliable portrait detection using multiple methods
  const isPortraitMode = isClient && typeof window !== 'undefined' && (
    // Method 1: Basic dimension check
    (window.innerHeight > window.innerWidth && window.innerWidth <= 768) ||
    // Method 2: Screen orientation API
    (window.screen && window.screen.orientation && (
      window.screen.orientation.angle === 0 || 
      window.screen.orientation.angle === 180
    ) && window.innerWidth <= 768) ||
    // Method 3: Media query check
    (window.matchMedia && window.matchMedia('(orientation: portrait)').matches && window.innerWidth <= 768)
  );
  
  // Debug logging
  if (isClient && typeof window !== 'undefined') {
    console.log('Orientation debug:', { 
      isMobile, 
      isLandscape, 
      isPortrait, 
      isPortraitMode,
      width: window.innerWidth, 
      height: window.innerHeight,
      screenOrientation: window.screen?.orientation?.angle,
      mediaQueryPortrait: window.matchMedia ? window.matchMedia('(orientation: portrait)').matches : 'N/A'
    });
  }

  const clockStyle = {
    fontFamily: 'SF Pro Rounded, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    fontSize: isMobile && isLandscape ? 'clamp(80px, 8vw, 200px)' : 'clamp(120px, 12vw, 300px)',
    fontWeight: '700',
    letterSpacing: '-0.06em'
  };

  if (!isLoaded) {
    // Show mobile portrait layout for loading screen on mobile
    if (isMobile) {
      return (
        <div 
          className="min-h-screen flex flex-col items-center justify-center" 
          style={{ 
            background: '#DFF0C4',
            padding: '20px 16px'
          }}
        >
          {/* Icon */}
          <div 
            className="mb-8"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: 'white',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg 
              width="64" 
              height="64" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                fillRule="evenodd" 
                clipRule="evenodd" 
                d="M10.2929 1.29289C10.6834 0.902369 11.3166 0.902369 11.7071 1.29289L14.7071 4.29289C15.0976 4.68342 15.0976 5.31658 14.7071 5.70711L11.7071 8.70711C11.3166 9.09763 10.6834 9.09763 10.2929 8.70711C9.90237 8.31658 9.90237 7.68342 10.2929 7.29289L11.5858 6H10C6.68629 6 4 8.68629 4 12C4 13.6352 4.65279 15.1159 5.71424 16.1991C6.10079 16.5935 6.09436 17.2267 5.6999 17.6132C5.30544 17.9998 4.6723 17.9933 4.28576 17.5989C2.87283 16.157 2 14.1794 2 12C2 7.58172 5.58172 4 10 4H11.5858L10.2929 2.70711C9.90237 2.31658 9.90237 1.68342 10.2929 1.29289ZM18.3001 6.38677C18.6946 6.00023 19.3277 6.00665 19.7142 6.40111C21.1272 7.84299 22 9.82056 22 12C22 16.4183 18.4183 20 14 20H12.4142L13.7071 21.2929C14.0976 21.6834 14.0976 22.3166 13.7071 22.7071C13.3166 23.0976 12.6834 23.0976 12.2929 22.7071L9.29289 19.7071C8.90237 19.3166 8.90237 18.6834 9.29289 18.2929L12.2929 15.2929C12.6834 14.9024 13.3166 14.9024 13.7071 15.2929C14.0976 15.6834 14.0976 16.3166 13.7071 16.7071L12.4142 18H14C17.3137 18 20 15.3137 20 12C20 10.3648 19.3472 8.88411 18.2858 7.80091C17.8992 7.40645 17.9056 6.77332 18.3001 6.38677Z" 
                fill="black"
              />
            </svg>
          </div>

          {/* Co'Watch! Title */}
          <div 
            className="mb-1"
            style={{
              fontFamily: 'SF Pro Rounded, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              fontSize: 'clamp(32px, 8vw, 48px)',
              fontWeight: '900',
              letterSpacing: '-0.02em',
              color: 'black',
              textAlign: 'center'
            }}
          >
            CO&apos;WATCH!
          </div>

          {/* Loading indicator */}
          <div 
            style={{
              fontFamily: 'SF Pro Rounded, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              fontSize: 'clamp(16px, 3vw, 20px)',
              fontWeight: '600',
              color: 'rgba(0, 0, 0, 0.6)',
              textAlign: 'center'
            }}
          >
            Loading...
          </div>
        </div>
      );
    }

    // Desktop loading screen
    return (
      <div 
        className="min-h-screen flex items-center justify-center" 
        style={{ 
          background: '#DFF0C4'
        }}
      >
        <div 
          className="text-black flex items-center" 
          style={{
            fontFamily: 'SF Pro Rounded, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            fontSize: 'clamp(120px, 12vw, 300px)',
            fontWeight: '700',
            letterSpacing: '-0.06em',
            color: 'black'
          }}
        >
          CO&apos;WATCH!
        </div>
      </div>
    );
  }

  // Mobile Portrait Screen - Show for any mobile device
  if (isMobile) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center" 
        style={{ 
          background: '#DFF0C4', // Light green background
          padding: '20px 16px'
        }}
      >
        {/* Icon */}
        <div 
          className="mb-8"
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: 'white',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg 
            width="64" 
            height="64" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              d="M10.2929 1.29289C10.6834 0.902369 11.3166 0.902369 11.7071 1.29289L14.7071 4.29289C15.0976 4.68342 15.0976 5.31658 14.7071 5.70711L11.7071 8.70711C11.3166 9.09763 10.6834 9.09763 10.2929 8.70711C9.90237 8.31658 9.90237 7.68342 10.2929 7.29289L11.5858 6H10C6.68629 6 4 8.68629 4 12C4 13.6352 4.65279 15.1159 5.71424 16.1991C6.10079 16.5935 6.09436 17.2267 5.6999 17.6132C5.30544 17.9998 4.6723 17.9933 4.28576 17.5989C2.87283 16.157 2 14.1794 2 12C2 7.58172 5.58172 4 10 4H11.5858L10.2929 2.70711C9.90237 2.31658 9.90237 1.68342 10.2929 1.29289ZM18.3001 6.38677C18.6946 6.00023 19.3277 6.00665 19.7142 6.40111C21.1272 7.84299 22 9.82056 22 12C22 16.4183 18.4183 20 14 20H12.4142L13.7071 21.2929C14.0976 21.6834 14.0976 22.3166 13.7071 22.7071C13.3166 23.0976 12.6834 23.0976 12.2929 22.7071L9.29289 19.7071C8.90237 19.3166 8.90237 18.6834 9.29289 18.2929L12.2929 15.2929C12.6834 14.9024 13.3166 14.9024 13.7071 15.2929C14.0976 15.6834 14.0976 16.3166 13.7071 16.7071L12.4142 18H14C17.3137 18 20 15.3137 20 12C20 10.3648 19.3472 8.88411 18.2858 7.80091C17.8992 7.40645 17.9056 6.77332 18.3001 6.38677Z" 
              fill="black"
            />
          </svg>
        </div>

        {/* Co'Watch! Title */}
        <div 
          className="mb-1"
          style={{
            fontFamily: 'SF Pro Rounded, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            fontSize: 'clamp(32px, 8vw, 48px)',
            fontWeight: '900',
            letterSpacing: '-0.02em',
            color: 'black',
            textAlign: 'center'
          }}
        >
          CO&apos;WATCH!
        </div>

        {/* Rotate Phone Instruction */}
        <div 
          style={{
            fontFamily: 'SF Pro Rounded, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            fontSize: 'clamp(18px, 4vw, 24px)',
            fontWeight: '600',
            color: 'rgba(0, 0, 0, 0.7)',
            textAlign: 'center',
            maxWidth: '280px',
            lineHeight: '1.4'
          }}
        >
          Rotate Your Phone
        </div>
      </div>
    );
  }


  return (
    <div 
      key={orientationKey}
      className={`min-h-screen flex items-center justify-center relative ${isMobile && isFullscreen ? 'mobile-fullscreen' : ''}`}
      style={{ 
        backgroundColor: backgroundType === 'dark' 
          ? '#1a1a1a'
          : (backgroundType === 'gradient' ? 'transparent' : backgroundColor),
        padding: isMobile && isLandscape ? '20px' : '36px',
        transition: 'background-color 0.3s ease-in-out',
        cursor: isFullscreen ? (showCursor ? 'default' : 'none') : 'default',
        minHeight: isMobile && isLandscape ? '100vh' : '100vh',
        width: isMobile && isLandscape ? '100vw' : '100%',
        // Mobile fullscreen styles
        ...(isMobile && isFullscreen ? {
          position: 'fixed' as const,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          height: '100vh',
          width: '100vw'
        } : {})
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
    >
      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: backgroundType === 'dark'
            ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
            : 'linear-gradient(180deg, #3477DF 0%, #738FE3 50%, #ACC2F5 100%)',
          opacity: backgroundType === 'gradient' || backgroundType === 'dark' ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          pointerEvents: 'none',
          zIndex: -1
        }}
      />
      {/* Title */}
      <div 
        className="absolute top-8 left-1/2 transform -translate-x-1/2"
        style={{
          color: backgroundType === 'gradient' || backgroundType === 'dark' ? 'white' : 'black',
          fontFamily: 'SF Pro Rounded, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          fontSize: 'clamp(20px, 2.5vw, 40px)',
          fontWeight: '900',
          transition: 'color 0.3s ease-in-out',
          opacity: isFullscreen ? (showButtons ? 1 : 0) : 1,
          visibility: isFullscreen ? (showButtons ? 'visible' : 'hidden') : 'visible'
        }}
      >
        CO&apos;WATCH!
      </div>

      {/* Top Controls Container */}
      <div 
        className="absolute flex items-center"
        style={{
          top: '36px',
          left: '32px',
          gap: '16px',
          opacity: isFullscreen ? (showButtons ? 1 : 0) : 1,
          visibility: isFullscreen ? (showButtons ? 'visible' : 'hidden') : 'visible',
          transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out'
        }}
      >
        {/* Tab Navigation */}
        <div>
        <div 
          className="relative inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
          style={{
            backgroundColor: backgroundType === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            padding: '6px',
            borderRadius: '24px',
            height: '48px'
          }}
        >
          {/* Sliding Background */}
          <motion.div
            className="absolute rounded-md"
            style={{
              backgroundColor: backgroundType === 'dark' ? '#2a2a2a' : 'white',
              borderRadius: '200px',
              border: backgroundType === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
              left: 0,
              top: 0
            }}
            animate={{
              width: activeTab === 'clock' ? `${tabDimensions.clock.width}px` : `${tabDimensions.timer.width}px`,
              height: '36px',
              left: activeTab === 'clock' ? `${tabDimensions.clock.left}px` : `${tabDimensions.timer.left}px`,
              top: '6px',
              scale: 1
            }}
            initial={{
              width: activeTab === 'clock' ? `${tabDimensions.clock.width}px` : `${tabDimensions.timer.width}px`,
              height: '36px',
              left: activeTab === 'clock' ? `${tabDimensions.clock.left}px` : `${tabDimensions.timer.left}px`,
              top: '6px',
              scale: 0.95
            }}
            transition={{
              type: "spring",
              duration: 0.48,
              stiffness: 300,
              damping: 25,
              mass: 1
            }}
          />
          
          <motion.button
            id="clock-tab"
            onClick={() => setActiveTab('clock')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            style={{
              color: backgroundType === 'gradient' && activeTab !== 'clock' ? 'white' : (backgroundType === 'dark' ? 'white' : 'black'),
              fontFamily: 'SF Pro Rounded, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              fontSize: '16px',
              fontWeight: '600',
              padding: '6px 12px 4px 12px',
              opacity: activeTab === 'clock' ? 1 : 0.5,
              transition: 'opacity 0.2s ease-in-out, color 0.3s ease-in-out'
            }}
          >
            Watch
          </motion.button>
          <motion.button
            id="timer-tab"
            onClick={() => setActiveTab('timer')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            style={{
              color: backgroundType === 'gradient' && activeTab !== 'timer' ? 'white' : (backgroundType === 'dark' ? 'white' : 'black'),
              fontFamily: 'SF Pro Rounded, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              fontSize: '16px',
              fontWeight: '600',
              padding: '6px 12px 4px 12px',
              opacity: activeTab === 'timer' ? 1 : 0.5,
              transition: 'opacity 0.2s ease-in-out, color 0.3s ease-in-out'
            }}
          >
            Focus
          </motion.button>
        </div>
        </div>

        {/* Settings Button */}
        <motion.button
          onClick={() => setShowThemeButtons(!showThemeButtons)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-black transition-all duration-200"
          style={{ 
            width: isMobile && isLandscape ? '48px' : '64px',
            height: isMobile && isLandscape ? '36px' : '48px',
            borderRadius: '200px',
            backgroundColor: backgroundType === 'dark' ? '#2a2a2a' : 'white',
            border: backgroundType === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Theme Settings"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M2 12C2 6.71457 6.51697 2.5 12 2.5C17.483 2.5 22 6.71457 22 12C22 13.8878 21.4937 15.1519 20.4345 15.8123C19.4491 16.4266 18.2002 16.3605 17.1496 16.2236C16.7813 16.1757 16.397 16.1121 16.0307 16.0515C15.8617 16.0235 15.6965 15.9962 15.5384 15.9713C15.0184 15.8895 14.5499 15.8295 14.1335 15.8234C13.298 15.8112 12.8925 16.0091 12.671 16.4526C12.539 16.7171 12.5395 17.0363 12.6858 17.4705C12.8149 17.8538 13.0214 18.2277 13.2435 18.63C13.2828 18.7012 13.3226 18.7734 13.3626 18.8465C13.4857 19.0721 13.6169 19.3217 13.7077 19.5624C13.7926 19.7875 13.8875 20.117 13.8161 20.466C13.7303 20.8858 13.4434 21.1713 13.0891 21.3241C12.7768 21.4588 12.3992 21.5 12 21.5C6.51697 21.5 2 17.2854 2 12ZM10.25 6.25C9.42157 6.25 8.75 6.92157 8.75 7.75C8.75 8.57843 9.42157 9.25 10.25 9.25C11.0784 9.25 11.75 8.57843 11.75 7.75C11.75 6.92157 11.0784 6.25 10.25 6.25ZM7.25 10.5C6.42157 10.5 5.75 11.1716 5.75 12C5.75 12.8284 6.42157 13.5 7.25 13.5C8.07843 13.5 8.75 12.8284 8.75 12C8.75 11.1716 8.07843 10.5 7.25 10.5ZM15.25 7.75C14.4216 7.75 13.75 8.42157 13.75 9.25C13.75 10.0784 14.4216 10.75 15.25 10.75C16.0784 10.75 16.75 10.0784 16.75 9.25C16.75 8.42157 16.0784 7.75 15.25 7.75Z" fill={backgroundType === 'dark' ? "white" : "black"}/>
          </svg>
        </motion.button>

        {/* Theme Buttons - Show when settings is clicked */}
        <AnimatePresence>
          {showThemeButtons && (
            <motion.div 
              className="flex" 
              style={{ gap: '16px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
            {/* 1. Light Gray Theme */}
            <motion.button
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 25 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ 
                type: "spring",
                duration: 0.15,
                stiffness: 500,
                damping: 20,
                mass: 0.8
              }}
              onClick={() => {
                setBackgroundColor('#EBEBEB');
                setBackgroundType('solid');
              }}
              className="bg-white text-black transition-all duration-200"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '200px',
                border: backgroundType === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: backgroundType === 'dark' ? '#2a2a2a' : 'white',
                position: 'relative'
              }}
              title="Light Gray Background"
            >
              <div 
                style={{
                  width: backgroundColor === '#EBEBEB' ? '30px' : '20px',
                  height: backgroundColor === '#EBEBEB' ? '30px' : '20px',
                  borderRadius: '50%',
                  backgroundColor: '#EBEBEB',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  transition: 'all 0.2s ease'
                }}
              />
            </motion.button>

            {/* 2. Dark Theme */}
            <motion.button
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 25 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ 
                type: "spring",
                duration: 0.15,
                stiffness: 500,
                damping: 20,
                mass: 0.8,
                delay: 0.05
              }}
              onClick={() => {
                setBackgroundType('dark');
              }}
              className="bg-white text-black transition-all duration-200"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '200px',
                border: backgroundType === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: backgroundType === 'dark' ? '#2a2a2a' : 'white',
                position: 'relative'
              }}
              title="Dark Theme"
            >
              <div 
                style={{
                  width: backgroundType === 'dark' ? '30px' : '20px',
                  height: backgroundType === 'dark' ? '30px' : '20px',
                  borderRadius: '50%',
                  backgroundColor: backgroundType === 'dark' ? '#1a1a1a' : '#2a2a2a',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  transition: 'all 0.2s ease'
                }}
              />
            </motion.button>

            {/* 3. Green Theme */}
            <motion.button
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 25 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ 
                type: "spring",
                duration: 0.15,
                stiffness: 500,
                damping: 20,
                mass: 0.8,
                delay: 0.1
              }}
              onClick={() => {
                setBackgroundColor('#DFF0C4');
                setBackgroundType('solid');
              }}
              className="bg-white text-black transition-all duration-200"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '200px',
                border: backgroundType === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: backgroundType === 'dark' ? '#2a2a2a' : 'white',
                position: 'relative'
              }}
              title="Light Green Background"
            >
              <div 
                style={{
                  width: backgroundColor === '#DFF0C4' ? '30px' : '20px',
                  height: backgroundColor === '#DFF0C4' ? '30px' : '20px',
                  borderRadius: '50%',
                  backgroundColor: '#DFF0C4',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  transition: 'all 0.2s ease'
                }}
              />
            </motion.button>

            {/* 4. Yellow Theme */}
            <motion.button
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 25 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ 
                type: "spring",
                duration: 0.15,
                stiffness: 500,
                damping: 20,
                mass: 0.8,
                delay: 0.15
              }}
              onClick={() => {
                setBackgroundColor('#FFF788');
                setBackgroundType('solid');
              }}
              className="bg-white text-black transition-all duration-200"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '200px',
                border: backgroundType === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: backgroundType === 'dark' ? '#2a2a2a' : 'white',
                position: 'relative'
              }}
              title="Light Yellow Background"
            >
              <div 
                style={{
                  width: backgroundColor === '#FFF788' ? '30px' : '20px',
                  height: backgroundColor === '#FFF788' ? '30px' : '20px',
                  borderRadius: '50%',
                  backgroundColor: '#FFF788',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  transition: 'all 0.2s ease'
                }}
              />
            </motion.button>

            {/* 5. Gradient Theme */}
            <motion.button
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 25 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ 
                type: "spring",
                duration: 0.15,
                stiffness: 500,
                damping: 20,
                mass: 0.8,
                delay: 0.2
              }}
              onClick={() => {
                setBackgroundType('gradient');
              }}
              className="bg-white text-black transition-all duration-200"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '200px',
                border: backgroundType === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: backgroundType === 'dark' ? '#2a2a2a' : 'white',
                position: 'relative'
              }}
              title="Blue Gradient Background"
            >
              <div 
                style={{
                  width: backgroundType === 'gradient' ? '30px' : '20px',
                  height: backgroundType === 'gradient' ? '30px' : '20px',
                  borderRadius: '50%',
                  background: 'linear-gradient(180deg, #3477DF 0%, #738FE3 50%, #ACC2F5 100%)',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  transition: 'all 0.2s ease'
                }}
              />
            </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* X Account Button */}
      <motion.a
        href="https://x.com/itshassco"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute bg-white text-black transition-all duration-200"
        style={{
          width: isMobile && isLandscape ? '48px' : '64px',
          height: isMobile && isLandscape ? '36px' : '48px',
          borderRadius: '200px',
          backgroundColor: backgroundType === 'dark' ? '#2a2a2a' : 'white',
          border: backgroundType === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          top: isMobile && isLandscape ? '20px' : '36px',
          right: isMobile && isLandscape ? '88px' : '112px',
          opacity: isFullscreen ? (showButtons ? 1 : 0) : 1,
          visibility: isFullscreen ? (showButtons ? 'visible' : 'hidden') : 'visible',
          transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
          textDecoration: 'none'
        }}
        title="Follow @itshassco on X"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.4033 3.5H20.2852L13.989 10.701L21.396 20.5H15.5964L11.054 14.557L5.85637 20.5H2.97269L9.70709 12.7977L2.60156 3.5H8.54839L12.6544 8.93215L17.4033 3.5ZM16.3918 18.7738H17.9887L7.68067 5.13549H5.96702L16.3918 18.7738Z" fill={backgroundType === 'dark' ? "white" : "black"}/>
        </svg>
      </motion.a>

      {/* Fullscreen Button */}
      <motion.button
        onClick={toggleFullscreen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute bg-white text-black transition-all duration-200"
        style={{
          width: isMobile && isLandscape ? '48px' : '64px',
          height: isMobile && isLandscape ? '36px' : '48px',
          borderRadius: '200px',
          backgroundColor: backgroundType === 'dark' ? '#2a2a2a' : 'white',
          border: backgroundType === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          top: isMobile && isLandscape ? '20px' : '36px',
          right: isMobile && isLandscape ? '20px' : '36px',
          opacity: isFullscreen ? (showButtons ? 1 : 0) : 1,
          visibility: isFullscreen ? (showButtons ? 'visible' : 'hidden') : 'visible',
          transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out'
        }}
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullscreen ? (
          // Exit fullscreen icon
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 4V10M14 10H20M14 10L20.25 3.75" stroke="#FF2B3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 20V14M10 14H4M10 14L3.75 20.25" stroke="#FF2B3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          // Enter fullscreen icon
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 4H20V10" stroke={backgroundType === 'dark' ? "white" : "black"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 14V20H10" stroke={backgroundType === 'dark' ? "white" : "black"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19.25 4.75L14 10" stroke={backgroundType === 'dark' ? "white" : "black"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 14L4.75 19.25" stroke={backgroundType === 'dark' ? "white" : "black"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </motion.button>


      {/* Clock Content */}
      {activeTab === 'clock' && (
        <motion.div 
          className="flex items-center cursor-pointer" 
          style={{
            ...clockStyle,
            color: backgroundType === 'gradient' || backgroundType === 'dark' ? 'white' : 'black',
            transition: 'color 0.3s ease-in-out'
          }}
          onClick={() => setShowSeconds(!showSeconds)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, mass: 1 }}
        >
          <SlidingNumber 
            number={hours} 
            padStart 
            transition={{ stiffness: 200, damping: 15, mass: 0.8 }}
          />
          <span className="mx-1">:</span>
          <SlidingNumber 
            number={minutes} 
            padStart 
            transition={{ stiffness: 200, damping: 15, mass: 0.8 }}
          />
          {showSeconds && (
            <>
              <span className="mx-1">:</span>
              <SlidingNumber 
                number={seconds} 
                padStart 
                transition={{ stiffness: 200, damping: 15, mass: 0.8 }}
              />
            </>
          )}
          <span className="ml-8">{ampm}</span>
        </motion.div>
      )}

      {/* Focus Timer Content */}
      {activeTab === 'timer' && (
        <div className="flex flex-col items-center" style={{ color: backgroundType === 'gradient' ? 'white' : (backgroundType === 'dark' ? 'white' : 'black'), transition: 'color 0.3s ease-in-out' }}>
          {/* Timer Display */}
          <div 
            className="flex items-center mb-8"
            style={{
              fontFamily: 'SF Pro Rounded, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              fontSize: isMobile && isLandscape ? 'clamp(80px, 8vw, 200px)' : 'clamp(120px, 12vw, 300px)',
              fontWeight: '700',
              letterSpacing: '-0.06em',
              color: backgroundType === 'gradient' || backgroundType === 'dark' ? 'white' : 'black',
              transition: 'color 0.3s ease-in-out'
            }}
          >
            <SlidingNumber 
              number={Math.floor(timeLeft / 60)} 
              padStart 
              transition={{ stiffness: 200, damping: 15, mass: 0.8 }}
            />
            <span className="mx-1">:</span>
            <SlidingNumber 
              number={timeLeft % 60} 
              padStart 
              transition={{ stiffness: 200, damping: 15, mass: 0.8 }}
            />
          </div>

        </div>
      )}


      {/* Weather Temperature Box */}
      <motion.div 
        className="absolute bg-white text-black transition-all duration-200 cursor-pointer"
        onClick={getLocationAndWeather}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: 'fit-content',
          minWidth: '64px',
          height: '48px',
          borderRadius: '200px',
          backgroundColor: backgroundType === 'dark' ? '#2a2a2a' : 'white',
          border: backgroundType === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bottom: '36px',
          left: '36px',
          opacity: isFullscreen ? (showButtons ? 1 : 0) : 1,
          visibility: isFullscreen ? (showButtons ? 'visible' : 'hidden') : 'visible',
          transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
          fontFamily: 'SF Pro Rounded, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          fontSize: '16px',
          fontWeight: '600',
          padding: '6px 18px 4px 18px',
          textAlign: 'center',
          color: backgroundType === 'dark' ? 'white' : 'black'
        }}
        title={weatherError ? 'Click to refresh weather' : weatherLocation ? `Weather in ${weatherLocation} - Click to refresh` : 'Click to refresh weather'}
      >
        {weatherLoading ? (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs">°C</span>
          </div>
        ) : weatherError ? (
          <div className="flex items-center gap-1">
            <span className="text-xs">⚠️</span>
            <span className="text-xs">°C</span>
          </div>
        ) : (
          `${weatherTemp}°C`
        )}
      </motion.div>

      {/* Date Box */}
      <div 
        className="absolute bg-white text-black transition-all duration-200"
        style={{
          width: 'fit-content',
          height: '48px',
          borderRadius: '200px',
          backgroundColor: backgroundType === 'dark' ? '#2a2a2a' : 'white',
          border: backgroundType === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bottom: '36px',
          right: '36px',
          opacity: isFullscreen ? (showButtons ? 1 : 0) : 1,
          visibility: isFullscreen ? (showButtons ? 'visible' : 'hidden') : 'visible',
          transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
          fontFamily: 'SF Pro Rounded, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          fontSize: '16px',
          fontWeight: '600',
          padding: '6px 18px 4px 18px',
          textAlign: 'center',
          color: backgroundType === 'dark' ? 'white' : 'black'
        }}
      >
        {formatDate(time)}
      </div>

      {/* Timer Controls - Bottom Center */}
      {activeTab === 'timer' && (
        <div 
          className="absolute flex items-center gap-4"
          style={{
            bottom: '36px',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: isFullscreen ? (showButtons ? 1 : 0) : 1,
            visibility: isFullscreen ? (showButtons ? 'visible' : 'hidden') : 'visible',
            transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out'
          }}
        >
          {/* Preset Time Buttons - Only show when not running/paused */}
          {(!isRunning && !isPaused) && (
            <>
              <motion.button
            onClick={() => {
              setTimer(5);
              setTimerType('focus');
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black transition-all duration-200"
            style={{
              width: 'fit-content',
              height: '48px',
              borderRadius: '200px',
              border: backgroundType === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'SF Pro Rounded, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              fontSize: '16px',
              fontWeight: '600',
              padding: '6px 18px 4px 18px',
              textAlign: 'center',
              backgroundColor: backgroundType === 'dark' ? '#2a2a2a' : 'white',
              color: timerDuration === 5 * 60 ? (backgroundType === 'dark' ? 'white' : 'black') : (backgroundType === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)')
            }}
          >
            5 Min
          </motion.button>
          <motion.button
            onClick={() => {
              setTimer(10);
              setTimerType('focus');
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black transition-all duration-200"
            style={{
              width: 'fit-content',
              height: '48px',
              borderRadius: '200px',
              border: backgroundType === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'SF Pro Rounded, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              fontSize: '16px',
              fontWeight: '600',
              padding: '6px 18px 4px 18px',
              textAlign: 'center',
              backgroundColor: backgroundType === 'dark' ? '#2a2a2a' : 'white',
              color: timerDuration === 10 * 60 ? (backgroundType === 'dark' ? 'white' : 'black') : (backgroundType === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)')
            }}
          >
            10 Min
          </motion.button>
          <motion.button
            onClick={() => {
              setTimer(25);
              setTimerType('focus');
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black transition-all duration-200"
            style={{
              width: 'fit-content',
              height: '48px',
              borderRadius: '200px',
              border: backgroundType === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'SF Pro Rounded, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              fontSize: '16px',
              fontWeight: '600',
              padding: '6px 18px 4px 18px',
              textAlign: 'center',
              backgroundColor: backgroundType === 'dark' ? '#2a2a2a' : 'white',
              color: timerDuration === 25 * 60 ? (backgroundType === 'dark' ? 'white' : 'black') : (backgroundType === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)')
            }}
          >
            25 Min
          </motion.button>

              {/* Increment/Decrement Controls */}
          <motion.button
            onClick={() => {
              const currentMinutes = Math.floor(timerDuration / 60);
              if (currentMinutes > 1) {
                setTimer(currentMinutes - 1);
                setTimerType('focus');
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black transition-all duration-200"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '200px',
              border: backgroundType === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: backgroundType === 'dark' ? '#2a2a2a' : 'white'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M6 12C6 11.4477 6.44772 11 7 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H7C6.44772 13 6 12.5523 6 12Z" fill="#FF6800"/>
            </svg>
          </motion.button>
          
          <motion.button
            onClick={() => {
              const currentMinutes = Math.floor(timerDuration / 60);
              if (currentMinutes < 60) {
                setTimer(currentMinutes + 1);
                setTimerType('focus');
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black transition-all duration-200"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '200px',
              border: backgroundType === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: backgroundType === 'dark' ? '#2a2a2a' : 'white'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 6C12.5523 6 13 6.44772 13 7V11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H13V17C13 17.5523 12.5523 18 12 18C11.4477 18 11 17.5523 11 17V13H7C6.44772 13 6 12.5523 6 12C6 11.4477 6.44772 11 7 11H11V7C11 6.44772 11.4477 6 12 6Z" fill="#00CA48"/>
            </svg>
          </motion.button>
            </>
          )}

          {/* Start/Pause/End Controls */}
          {!isRunning && !isPaused && (
            <motion.button
              onClick={startTimer}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white transition-all duration-200"
              style={{
                width: 'fit-content',
                height: '48px',
                borderRadius: '200px',
                border: backgroundType === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'SF Pro Rounded, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                fontSize: '16px',
                fontWeight: '600',
                padding: '6px 18px 4px 18px',
                textAlign: 'center',
                backgroundColor: backgroundType === 'dark' ? '#2a2a2a' : 'white',
                color: '#00B2FF'
              }}
            >
              Start Focus
            </motion.button>
          )}
          
          {isRunning && (
            <>
              <motion.button
                onClick={pauseTimer}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-black transition-all duration-200"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '200px',
                  border: backgroundType === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                  boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: backgroundType === 'dark' ? '#2a2a2a' : 'white'
                }}
                title="Pause"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6C4 4.34315 5.34315 3 7 3C8.65685 3 10 4.34315 10 6V18C10 19.6569 8.65685 21 7 21C5.34315 21 4 19.6569 4 18V6Z" fill="#00CA48"/>
                  <path d="M14 6C14 4.34315 15.3431 3 17 3C18.6569 3 20 4.34315 20 6V18C20 19.6569 18.6569 21 17 21C15.3431 21 14 19.6569 14 18V6Z" fill="#00CA48"/>
                </svg>
              </motion.button>
              
              <motion.button
                onClick={endTimer}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-black transition-all duration-200"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '200px',
                  border: backgroundType === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                  boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: backgroundType === 'dark' ? '#2a2a2a' : 'white'
                }}
                title="End"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.2413 3H8.7587C7.95374 2.99999 7.28937 2.99998 6.74818 3.04419C6.18608 3.09012 5.66937 3.18868 5.18404 3.43598C4.43139 3.81947 3.81947 4.43139 3.43598 5.18404C3.18868 5.66937 3.09012 6.18608 3.04419 6.74818C2.99998 7.28937 2.99999 7.95372 3 8.75869V15.2413C2.99999 16.0463 2.99998 16.7106 3.04419 17.2518C3.09012 17.8139 3.18868 18.3306 3.43598 18.816C3.81947 19.5686 4.43139 20.1805 5.18404 20.564C5.66937 20.8113 6.18608 20.9099 6.74818 20.9558C7.28937 21 7.95372 21 8.75868 21H15.2413C16.0463 21 16.7106 21 17.2518 20.9558C17.8139 20.9099 18.3306 20.8113 18.816 20.564C19.5686 20.1805 20.1805 19.5686 20.564 18.816C20.8113 18.3306 20.9099 17.8139 20.9558 17.2518C21 16.7106 21 16.0463 21 15.2413V8.75868C21 7.95372 21 7.28936 20.9558 6.74818C20.9099 6.18608 20.8113 5.66937 20.564 5.18404C20.1805 4.43139 19.5686 3.81947 18.816 3.43598C18.3306 3.18868 17.8139 3.09012 17.2518 3.04419C16.7106 2.99998 16.0463 2.99999 15.2413 3Z" fill="#FF2B3A"/>
                </svg>
              </motion.button>
            </>
          )}
          
          {isPaused && (
            <>
              <motion.button
                onClick={startTimer}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-black transition-all duration-200"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '200px',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: '4px'
                }}
                title="Continue"
              >
                <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.19671 0.718275C3.53683 -1.02965 0 0.878304 0 4.0611V15.9387C0 19.1215 3.53684 21.0294 6.19672 19.2815L15.234 13.3427C17.6384 11.7627 17.6384 8.23709 15.234 6.65706L6.19671 0.718275Z" fill="#00B2FF"/>
                </svg>
              </motion.button>
              
              <motion.button
                onClick={endTimer}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-black transition-all duration-200"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '200px',
                  border: backgroundType === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                  boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: backgroundType === 'dark' ? '#2a2a2a' : 'white'
                }}
                title="End"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.2413 3H8.7587C7.95374 2.99999 7.28937 2.99998 6.74818 3.04419C6.18608 3.09012 5.66937 3.18868 5.18404 3.43598C4.43139 3.81947 3.81947 4.43139 3.43598 5.18404C3.18868 5.66937 3.09012 6.18608 3.04419 6.74818C2.99998 7.28937 2.99999 7.95372 3 8.75869V15.2413C2.99999 16.0463 2.99998 16.7106 3.04419 17.2518C3.09012 17.8139 3.18868 18.3306 3.43598 18.816C3.81947 19.5686 4.43139 20.1805 5.18404 20.564C5.66937 20.8113 6.18608 20.9099 6.74818 20.9558C7.28937 21 7.95372 21 8.75868 21H15.2413C16.0463 21 16.7106 21 17.2518 20.9558C17.8139 20.9099 18.3306 20.8113 18.816 20.564C19.5686 20.1805 20.1805 19.5686 20.564 18.816C20.8113 18.3306 20.9099 17.8139 20.9558 17.2518C21 16.7106 21 16.0463 21 15.2413V8.75868C21 7.95372 21 7.28936 20.9558 6.74818C20.9099 6.18608 20.8113 5.66937 20.564 5.18404C20.1805 4.43139 19.5686 3.81947 18.816 3.43598C18.3306 3.18868 17.8139 3.09012 17.2518 3.04419C16.7106 2.99998 16.0463 2.99999 15.2413 3Z" fill="#FF2B3A"/>
                </svg>
              </motion.button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
