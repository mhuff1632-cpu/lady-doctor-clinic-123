import React, { useState, useEffect, useRef } from 'react';
import { hospitalTourStops, TourStop } from '../../data/hospitalTourData';
import { useRouter } from '../../context/RouterContext';
import { clinicInfo } from '../../data/clinicInfo';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Phone,
  Info,
  CheckCircle2,
  Languages,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const HospitalVideoPlayer: React.FC = () => {
  const { navigate } = useRouter();
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [voiceLanguage, setVoiceLanguage] = useState<'en' | 'ur'>('ur');
  const [isMuted, setIsMuted] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  const currentStop = hospitalTourStops[currentStopIndex];

  // Simulated progressive video playback
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Next stop or pause
            if (currentStopIndex < hospitalTourStops.length - 1) {
              setCurrentStopIndex((i) => i + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          return prev + 1.5 * playbackSpeed;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, currentStopIndex]);

  // Voice narration using Web Speech API if enabled and unmuted
  useEffect(() => {
    if (isPlaying && !isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak =
        voiceLanguage === 'ur'
          ? currentStop.voiceGuidance.ur
          : currentStop.voiceGuidance.en;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = voiceLanguage === 'ur' ? 'ur-PK' : 'en-US';
      utterance.rate = playbackSpeed;
      window.speechSynthesis.speak(utterance);
    } else if (!isPlaying && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [currentStopIndex, isPlaying, voiceLanguage, isMuted, playbackSpeed]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  const handleSelectStop = (index: number) => {
    setCurrentStopIndex(index);
    setProgress(0);
    setActiveHotspot(null);
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={playerRef}
      className={`bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col ${
        isFullscreen ? 'p-6 h-screen' : 'w-full'
      }`}
    >
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                HD Virtual Hospital Tour
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs font-mono text-slate-300">
                Stop {currentStopIndex + 1} of {hospitalTourStops.length}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {currentStop.name}
            </h3>
          </div>
        </div>

        {/* Audio Language & Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setVoiceLanguage((l) => (l === 'ur' ? 'en' : 'ur'))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-rose-300 transition-colors cursor-pointer border border-slate-700"
            title="Toggle Narration Language"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{voiceLanguage === 'ur' ? 'اردو آڈیو' : 'English Voice'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Screen Area */}
      <div className="relative aspect-16/9 bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/60 overflow-hidden flex items-center justify-center select-none group">
        {/* Background Visual Rendering */}
        <div className="absolute inset-0 bg-radial from-slate-800/40 via-transparent to-black/80 pointer-events-none" />

        {/* Room Atmosphere Graphic Overlay */}
        <div className="text-center p-6 space-y-4 max-w-lg z-10 transition-all">
          <div className="inline-block p-4 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
              {currentStop.category}
            </span>
            <h4 className="text-xl sm:text-2xl font-black text-white">
              {currentStop.name}
            </h4>
            <div className="text-sm font-semibold text-rose-200/90 mt-0.5" dir="rtl">
              {currentStop.urduName}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed bg-black/40 backdrop-blur-xs p-3 rounded-2xl border border-white/5">
            {currentStop.description}
          </p>
        </div>

        {/* Interactive Hotspot Pins */}
        {currentStop.hotspots.map((spot, i) => (
          <div
            key={i}
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <button
              type="button"
              onClick={() => setActiveHotspot(activeHotspot === i ? null : i)}
              className="relative group/pin p-2 rounded-full bg-rose-600 text-white shadow-lg shadow-rose-900/50 hover:scale-125 transition-transform cursor-pointer animate-bounce"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-white border border-slate-700 pointer-events-none shadow-md">
                {spot.label}
              </span>
            </button>

            {/* Hotspot Card Popover */}
            {activeHotspot === i && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 p-3 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-xs text-white z-30 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <strong className="text-rose-300 font-bold">{spot.label}</strong>
                  <button
                    type="button"
                    onClick={() => setActiveHotspot(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  {spot.description}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Live Narration Subtitle Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-20 bg-slate-950/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center shadow-lg">
          <p className="text-xs sm:text-sm font-medium text-slate-100">
            {voiceLanguage === 'ur'
              ? currentStop.voiceGuidance.ur
              : currentStop.voiceGuidance.en}
          </p>
        </div>
      </div>

      {/* Scrubber & Timeline Progress */}
      <div className="px-4 pt-3 bg-slate-900/80">
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden cursor-pointer">
          <div
            className="bg-rose-600 h-full transition-all duration-150 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Control Buttons Bar */}
      <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button
            type="button"
            onClick={togglePlay}
            className="p-3 rounded-2xl bg-rose-700 hover:bg-rose-600 text-white transition-all shadow-md hover:scale-105 cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play Tour'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
          </button>

          {/* Restart */}
          <button
            type="button"
            onClick={handleRestart}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Restart Stop"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Prev / Next Stop */}
          <button
            type="button"
            disabled={currentStopIndex === 0}
            onClick={() => handleSelectStop(currentStopIndex - 1)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 cursor-pointer"
            title="Previous Room"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={currentStopIndex === hospitalTourStops.length - 1}
            onClick={() => handleSelectStop(currentStopIndex + 1)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 cursor-pointer"
            title="Next Room"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs font-mono">
            {[0.75, 1, 1.25, 1.5].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  playbackSpeed === speed
                    ? 'bg-rose-700 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Room Action Triggers */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/appointment')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Visit in this Dept</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Department Selector Badges Strip */}
      <div className="p-3 bg-slate-950 border-t border-slate-850 overflow-x-auto flex items-center gap-2">
        {hospitalTourStops.map((stop, idx) => (
          <button
            key={stop.id}
            type="button"
            onClick={() => handleSelectStop(idx)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              currentStopIndex === idx
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="font-mono text-[10px] opacity-70">0{idx + 1}</span>
            <span>{stop.name.split('&')[0].trim()}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
