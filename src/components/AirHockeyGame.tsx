import React, { useEffect, useRef, useState } from 'react';
import { User, ShopItem, LiveGameState } from '../types';
import { ArrowLeft, Play, ShieldAlert, Cpu, Users, Volume2, VolumeX, Lock, Unlock, Plus, RefreshCw, Trophy, Settings, HelpCircle, Check } from 'lucide-react';

interface AirHockeyGameProps {
  user: User;
  shopItems: ShopItem[];
  onGameCompleted: (win: boolean, scoreSelf: number, scoreOpponent: number) => void;
  onExit: () => void;
  gameMode: 'ai' | 'multiplayer';
  socketUrl: string;
}

// Translations lexicon
const LOCALES = {
  en: {
    leave: 'Leave',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    mute: 'Mute',
    unmute: 'Unmute',
    settings: 'Settings',
    audioSettings: 'Settings Menu',
    bgmVolume: 'BGM Volume',
    sfxVolume: 'SFX Volume',
    language: 'Language Selection',
    graphicsQuality: 'Graphics Quality',
    low: 'Low (No particles/shadows)',
    med: 'Medium (Standard effects)',
    high: 'High (Max glow & sparks)',
    close: 'Close & Save',
    vsBot: 'VS Bot Controller',
    activeBot: 'Active Bot Class',
    startEngine: 'Start Game Engine',
    playerStats: 'Player Stats',
    highFreq: 'High frequency data sync',
    connecting: 'Connecting to arena sync matrix...',
    playAgain: 'Play Again',
    matchOver: 'Match Concluded',
    victory: 'Victory Achieved',
    defeat: 'Defeat Suffered',
    ready: 'Ready',
    notReady: 'Not Ready',
    createRoom: 'Create Room',
    quickMatch: 'Quick Match Queue',
    activeRooms: 'Active Sync Arenas',
    username: 'Username',
    bio: 'Bio',
    saveProfile: 'Save Profile',
    editProfile: 'Edit Profile',
    avatar: 'Avatar',
  },
  id: {
    leave: 'Keluar',
    easy: 'Mudah',
    medium: 'Sedang',
    hard: 'Sulit',
    mute: 'Bisukan',
    unmute: 'Suarakan',
    settings: 'Pengaturan',
    audioSettings: 'Menu Pengaturan',
    bgmVolume: 'Volume BGM',
    sfxVolume: 'Volume SFX',
    language: 'Pilihan Bahasa',
    graphicsQuality: 'Kualitas Grafis',
    low: 'Rendah (Tanpa partikel/bayangan)',
    med: 'Sedang (Efek standar)',
    high: 'Tinggi (Efek glow & percikan penuh)',
    close: 'Tutup & Simpan',
    vsBot: 'Lawan Bot AI',
    activeBot: 'Kelas Bot Aktif',
    startEngine: 'Mulai Game',
    playerStats: 'Statistik Pemain',
    highFreq: 'Sinkronisasi data frekuensi tinggi',
    connecting: 'Menghubungkan ke matriks sinkronisasi...',
    playAgain: 'Main Lagi',
    matchOver: 'Pertandingan Selesai',
    victory: 'Kemenangan Diraih',
    defeat: 'Kekalahan Dialami',
    ready: 'Siap',
    notReady: 'Belum Siap',
    createRoom: 'Buat Ruangan',
    quickMatch: 'Antrean Cepat',
    activeRooms: 'Arena Sinkronisasi Aktif',
    username: 'Nama Tampilan',
    bio: 'Biografi',
    saveProfile: 'Simpan Profil',
    editProfile: 'Ubah Profil',
    avatar: 'Avatar',
  }
};

// Custom synthesizer class using Web Audio API for immersive sound effects
class SoundSynth {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;
  public bgmVolume: number = 0.5;
  public sfxVolume: number = 0.5;

  private bgmInterval: any = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playHit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.35 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playScore() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(330, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.3);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(165, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc2.start();
    osc.stop(this.ctx.currentTime + 0.35);
    osc2.stop(this.ctx.currentTime + 0.35);
  }

  playGameOver(win: boolean) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = win ? 'sine' : 'sawtooth';
    osc.frequency.setValueAtTime(win ? 440 : 220, this.ctx.currentTime);
    
    if (win) {
      osc.frequency.linearRampToValueAtTime(880, this.ctx.currentTime + 0.5);
    } else {
      osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.6);
    }

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.6);
  }

  startBgm() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    this.stopBgm();

    const chords = [
      // IV: Fmaj7
      {
        root: 87.31, // F2
        tones: [174.61, 220.00, 261.63, 329.63], // F3, A3, C4, E4
        arp: [174.61, 261.63, 329.63, 523.25, 329.63, 261.63, 220.00, 329.63]
      },
      // V: G
      {
        root: 98.00, // G2
        tones: [196.00, 246.94, 293.66, 392.00], // G3, B3, D4, G4
        arp: [196.00, 293.66, 392.00, 587.33, 392.00, 293.66, 246.94, 392.00]
      },
      // iii: Em7
      {
        root: 82.41, // E2
        tones: [164.81, 196.00, 246.94, 293.66], // E3, G3, B3, D4
        arp: [164.81, 246.94, 293.66, 493.88, 293.66, 246.94, 196.00, 293.66]
      },
      // vi: Am7
      {
        root: 110.00, // A2
        tones: [220.00, 261.63, 329.63, 392.00], // A3, C4, E4, G4
        arp: [220.00, 329.63, 392.00, 659.25, 392.00, 329.63, 261.63, 392.00]
      }
    ];

    let step = 0;
    
    this.bgmInterval = setInterval(() => {
      if (this.muted || !this.ctx || this.bgmVolume <= 0) return;
      
      const chordIdx = Math.floor((step % 16) / 4);
      const activeChord = chords[chordIdx];
      const time = this.ctx.currentTime;

      // 1. Warm Atmospheric Synth Pad (triggers every 4 steps / once per chord swap)
      if (step % 4 === 0) {
        activeChord.tones.forEach((freq) => {
          if (!this.ctx) return;
          const oscPad = this.ctx.createOscillator();
          const gainPad = this.ctx.createGain();
          const filterPad = this.ctx.createBiquadFilter();

          oscPad.type = 'sawtooth';
          oscPad.frequency.setValueAtTime(freq, time);

          filterPad.type = 'lowpass';
          filterPad.frequency.setValueAtTime(500, time);
          filterPad.Q.setValueAtTime(1.0, time);

          gainPad.gain.setValueAtTime(0, time);
          gainPad.gain.linearRampToValueAtTime(0.04 * this.bgmVolume, time + 0.1);
          gainPad.gain.exponentialRampToValueAtTime(0.001, time + 0.95);

          oscPad.connect(filterPad);
          filterPad.connect(gainPad);
          gainPad.connect(this.ctx.destination);

          oscPad.start(time);
          oscPad.stop(time + 1.0);
        });
      }

      // 2. Sub-Bass notes (lowpassed sine wave on every block beat)
      if (step % 2 === 0) {
        const oscBass = this.ctx.createOscillator();
        const gainBass = this.ctx.createGain();
        const filterBass = this.ctx.createBiquadFilter();

        oscBass.type = 'sine';
        oscBass.frequency.setValueAtTime(activeChord.root, time);

        filterBass.type = 'lowpass';
        filterBass.frequency.setValueAtTime(120, time);

        gainBass.gain.setValueAtTime(0.12 * this.bgmVolume, time);
        gainBass.gain.exponentialRampToValueAtTime(0.001, time + 0.38);

        oscBass.connect(filterBass);
        filterBass.connect(gainBass);
        gainBass.connect(this.ctx.destination);

        oscBass.start(time);
        oscBass.stop(time + 0.4);
      }

      // 3. Futuristic Arpeggio (square wave on every step)
      const arpNotes = activeChord.arp;
      const arpFreq = arpNotes[step % arpNotes.length];

      const oscArp = this.ctx.createOscillator();
      const gainArp = this.ctx.createGain();
      const filterArp = this.ctx.createBiquadFilter();

      // Cyber sound design pairing: square + soft bandpass/lowpass decay
      oscArp.type = 'square';
      oscArp.frequency.setValueAtTime(arpFreq, time);

      filterArp.type = 'bandpass';
      filterArp.frequency.setValueAtTime(1000, time);
      filterArp.frequency.exponentialRampToValueAtTime(300, time + 0.22);
      filterArp.Q.setValueAtTime(2.0, time);

      gainArp.gain.setValueAtTime(0.03 * this.bgmVolume, time);
      gainArp.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

      oscArp.connect(filterArp);
      filterArp.connect(gainArp);
      gainArp.connect(this.ctx.destination);

      oscArp.start(time);
      oscArp.stop(time + 0.24);

      step++;
    }, 240); // 125 BPM
  }

  stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  updateVolumes(bgmVol: number, sfxVol: number) {
    this.bgmVolume = bgmVol;
    this.sfxVolume = sfxVol;
  }
}

const synthInstance = new SoundSynth();

export default function AirHockeyGame({
  user,
  shopItems,
  onGameCompleted,
  onExit,
  gameMode,
  socketUrl
}: AirHockeyGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // States
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('nexkey_game_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          bgmVolume: parsed.bgmVolume !== undefined ? parsed.bgmVolume : 0.5,
          sfxVolume: parsed.sfxVolume !== undefined ? parsed.sfxVolume : 0.5,
          muted: parsed.muted !== undefined ? parsed.muted : false,
          language: parsed.language !== undefined ? parsed.language : 'en',
          graphicsQuality: parsed.graphicsQuality !== undefined ? parsed.graphicsQuality : 'high'
        };
      }
    } catch (e) {
      console.error('Settings load error', e);
    }
    return {
      bgmVolume: 0.5,
      sfxVolume: 0.5,
      muted: false,
      language: 'en',
      graphicsQuality: 'high'
    };
  });

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const t = LOCALES[settings.language as 'en' | 'id'] || LOCALES.en;
  const graphicsQuality = settings.graphicsQuality;

  const [muted, setMuted] = useState(settings.muted);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'gameover'>('lobby');
  const [multiplayerStatus, setMultiplayerStatus] = useState<string>('Connecting... ');
  const [lobbyReady, setLobbyReady] = useState(false);
  const [endSummary, setEndSummary] = useState<{ win: boolean; scoreSelf: number; scoreOpponent: number; isDraw?: boolean } | null>(null);
  const [role, setRole] = useState<'p1' | 'p2'>('p1');

  useEffect(() => {
    try {
      localStorage.setItem('nexkey_game_settings', JSON.stringify(settings));
    } catch {}
    synthInstance.muted = settings.muted;
    synthInstance.updateVolumes(settings.bgmVolume, settings.sfxVolume);
    setMuted(settings.muted);
  }, [settings]);

  // Handle playing background music dynamically
  useEffect(() => {
    if (gameState === 'playing') {
      synthInstance.startBgm();
    } else {
      synthInstance.stopBgm();
    }
    return () => {
      synthInstance.stopBgm();
    };
  }, [gameState, settings.muted, settings.bgmVolume]);

  // Prevent mobile zooming/gestures and disable pull-to-refresh during game play sessions
  useEffect(() => {
    if (gameState === 'playing') {
      document.body.classList.add('playing-game');
    } else {
      document.body.classList.remove('playing-game');
    }
    return () => {
      document.body.classList.remove('playing-game');
    };
  }, [gameState]);

  // End game cleanly when the 120 seconds run out
  const triggerTimeUpEnd = () => {
    const selfScore = scoreRef.current.self;
    const oppScore = scoreRef.current.opponent;
    const won = selfScore > oppScore;
    const isDraw = selfScore === oppScore;

    setEndSummary({
      win: won && !isDraw,
      scoreSelf: selfScore,
      scoreOpponent: oppScore,
      isDraw: isDraw
    });

    setGameState('gameover');
    synthInstance.playGameOver(won && !isDraw);

    // Persist to DB or send socket signal if multiplayer
    if (gameMode === 'ai') {
      onGameCompleted(won && !isDraw, selfScore, oppScore);
    } else {
      if (role === 'p1') {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'move_paddle',
            gameId: wsRef.current && (wsRef.current as any).gameId,
            role: 'p1',
            x: playerPaddle.current.x,
            y: playerPaddle.current.y,
            puck: { pos: puckPos.current, vel: puckVel.current },
            scores: { p1: selfScore, p2: oppScore },
            timeLeft: 0,
            isTimeUp: true
          }));
        }
      }
    }
  };

  // Primary Countdown Timer hook
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      if (isDialogueOpenRef.current) return;

      if (timeLeftRef.current <= 1) {
        clearInterval(interval);
        timeLeftRef.current = 0;
        setTimeLeft(0);
        triggerTimeUpEnd();
      } else {
        timeLeftRef.current -= 1;
        setTimeLeft(timeLeftRef.current);

        // Host authoritatively synchronized timeLeft
        if (gameMode === 'multiplayer' && role === 'p1') {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'move_paddle',
              gameId: wsRef.current && (wsRef.current as any).gameId,
              role: 'p1',
              x: playerPaddle.current.x,
              y: playerPaddle.current.y,
              puck: { pos: puckPos.current, vel: puckVel.current },
              scores: { p1: scoreRef.current.self, p2: scoreRef.current.opponent },
              timeLeft: timeLeftRef.current,
              isTimeUp: false
            }));
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, gameMode, role]);

  // Unified dynamic scaling system to preserve the strict 3:4 arena ratio on desktop & mobile screen bounds
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const aspect = arenaWidth / arenaHeight; // 750 / 1000 = 0.75
      
      // Compute safe scaling dimension targets matching both height and width boundaries
      const availableWidth = window.innerWidth - 16;
      const availableHeight = window.innerHeight - 150; // Leave space for headers/controls
      
      let width = Math.min(availableWidth, 576); // Max out on desktop bento boundaries (576px max-w-xl)
      let height = width / aspect;
      
      if (height > availableHeight) {
        height = availableHeight;
        width = height * aspect;
      }
      
      // Inline styles bypass any tailwind aspect ratio constraints
      container.style.width = `${Math.floor(width)}px`;
      container.style.height = `${Math.floor(height)}px`;
      
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.width = `${Math.floor(width)}px`;
        canvas.style.height = `${Math.floor(height)}px`;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Also attach MutationObserver to run resizing as soon as canvas is mounted or unmounted
    const observer = new MutationObserver(handleResize);
    const containerEl = containerRef.current;
    if (containerEl) {
      observer.observe(containerEl, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [gameState]);

  // --- MULTIPLAYER ROOMS & LOBBY STATES ---
  const [multiplayerView, setMultiplayerView] = useState<'menu' | 'lobby_room'>('menu');
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [currentRoom, setCurrentRoom] = useState<any | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [roomNameInput, setRoomNameInput] = useState('');
  const [roomPasswordInput, setRoomPasswordInput] = useState('');
  const [isPrivateInput, setIsPrivateInput] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState<any | null>(null);
  const [joinPassword, setJoinPassword] = useState('');
  const [joinError, setJoinError] = useState('');
  const [createError, setCreateError] = useState('');
  const [liveRoomState, setLiveRoomState] = useState<LiveGameState | null>(null);
  const [isRefreshingRooms, setIsRefreshingRooms] = useState(false);
  const [isQueuing, setIsQueuing] = useState(false);
  const [hostLeftMessage, setHostLeftMessage] = useState<string | null>(null);

  // Internal Gameplay state (for physics / AI / sync rendering)
  const scoreRef = useRef({ self: 0, opponent: 0 });
  const isScoringRef = useRef(false);

  // --- Strict 2-minute countdown timer states ---
  const [timeLeft, setTimeLeft] = useState(120);
  const timeLeftRef = useRef(120);

  // --- Gemini AI Dynamic Arcade Dialogue systems ---
  const [isDialogueOpen, setIsDialogueOpen] = useState(false);
  const isDialogueOpenRef = useRef(false);
  const [dialogueScorer, setDialogueScorer] = useState<'player' | 'ai'>('player');
  const [dialogueVelocity, setDialogueVelocity] = useState<number>(0);
  const [dialoguePhase, setDialoguePhase] = useState<1 | 2 | 3>(1); // 1 = AI reaction, 2 = Player replying, 3 = AI final retort
  const [dialogueText, setDialogueText] = useState('');
  const [playerReplyInput, setPlayerReplyInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const arenaWidth = 750;
  const arenaHeight = 1000;
  const puckRadius = 18;
  const paddleRadius = 30;

  // Track entities coordinates
  const puckPos = useRef({ x: 375, y: 500 });
  const puckVel = useRef({ x: 0, y: 0 });
  const playerPaddle = useRef({ x: 375, y: 850 });
  const opponentPaddle = useRef({ x: 375, y: 150 });
  const lastPlayerPaddlePos = useRef({ x: 375, y: 850 });
  const lastOpponentPaddlePos = useRef({ x: 375, y: 150 });

  // Trails for visual flare
  const puckTrail = useRef<{ x: number; y: number }[]>([]);
  const puckHistoryRef = useRef<{ x: number; y: number }[]>([]);
  const particlesRef = useRef<any[]>([]);

  const createSparks = (x: number, y: number, color: string, count: number) => {
    if (graphicsQuality === 'low') return;
    const actualCount = graphicsQuality === 'medium' ? Math.round(count / 2) : count;
    for (let i = 0; i < actualCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 5 + 2) * (graphicsQuality === 'high' ? 1.45 : 1.0);
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 3 + 1.5,
        alpha: 1.0,
        decay: Math.random() * 0.03 + 0.015
      });
    }
    
    // Maintain a strict maximum particles array buffer length to solve memory leaks and RAM overload
    const maxParticles = graphicsQuality === 'high' ? 120 : 60;
    if (particlesRef.current.length > maxParticles) {
      particlesRef.current = particlesRef.current.slice(-maxParticles);
    }
  };

  // AI level / speed bounds
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // --- REGULATED ESPORTS TELEMETRY TRACKERS & HELPERS ---
  const coordinateTrackingRef = useRef<{ x: number; y: number }[]>([]);
  const analyticsDataRef = useRef({
    framesInOffense: 0,
    framesInDefense: 0,
    totalFrames: 0,
    velocitySum: 0,
    velocityCount: 0,
    successfulHits: 0,
    missedSwings: 0,
    activeSwingTimer: 0,
    hadNearbyPuck: false,
    frameCounter: 0
  });

  const calculateTelemetryMetrics = () => {
    const data = analyticsDataRef.current;
    
    // Aggressiveness: ratio of frames spent in forward zones
    const aggressiveness = data.totalFrames > 0 
      ? Math.max(15, Math.min(95, (data.framesInOffense / data.totalFrames) * 100 * 2.2))
      : 40;

    // Defensiveness: ratio of frames spent near bottom goal boundary
    const defensiveness = data.totalFrames > 0
      ? Math.max(15, Math.min(95, (data.framesInDefense / data.totalFrames) * 100 * 1.5))
      : 40;

    // Speed: average velocity mapped relative to maximum speed scale
    const avgVelocity = data.velocityCount > 0 ? (data.velocitySum / data.velocityCount) : 0;
    const speed = avgVelocity > 0
      ? Math.max(15, Math.min(98, (avgVelocity / 4.5) * 100))
      : 35;

    // Accuracy: strikes / (strikes + missed swings) with simple dampening
    const totalStrikes = data.successfulHits + data.missedSwings;
    const accuracy = totalStrikes > 0
      ? Math.max(10, Math.min(100, (data.successfulHits / totalStrikes) * 100))
      : 70;

    return { aggressiveness, defensiveness, speed, accuracy };
  };

  const drawHeatmap = (canvas: HTMLCanvasElement, coordinates: { x: number; y: number }[]) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const scaleX = canvas.width / arenaWidth;
    const scaleY = canvas.height / arenaHeight;
    
    // Draw miniature table pitch
    ctx.fillStyle = '#060609';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw borders & center line
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 35 * scaleX, 0, Math.PI * 2);
    ctx.stroke();

    // Goals arcs
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 5, 50 * scaleX, 0, Math.PI);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height - 5, 50 * scaleX, Math.PI, 0);
    ctx.stroke();

    // Draw Heat points (additive blending screen/lighter)
    ctx.globalCompositeOperation = 'screen';
    coordinates.forEach((point) => {
      const cx = point.x * scaleX;
      const cy = point.y * scaleY;
      
      const radGrad = ctx.createRadialGradient(cx, cy, 1, cx, cy, 18);
      radGrad.addColorStop(0, 'rgba(0, 255, 65, 0.25)');
      radGrad.addColorStop(0.3, 'rgba(191, 0, 255, 0.08)');
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
  };

  const drawRadarChartFallback = (canvas: HTMLCanvasElement, metrics: {
    aggressiveness: number;
    defensiveness: number;
    speed: number;
    accuracy: number;
  }) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.32;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const labels = ["AGGRESSIVE", "DEFENSIVE", "SPEED", "ACCURACY"];
    const values = [metrics.aggressiveness, metrics.defensiveness, metrics.speed, metrics.accuracy];
    const numAxes = 4;
    const angleStep = (Math.PI * 2) / numAxes;
    
    // Draw concentric scale rings
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
    ctx.lineWidth = 1;
    for (let j = 1; j <= 4; j++) {
      const r = radius * (j / 4);
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const x = cx + Math.cos(i * angleStep - Math.PI / 2) * r;
        const y = cy + Math.sin(i * angleStep - Math.PI / 2) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
    
    // Draw Axis lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < numAxes; i++) {
      const ax = cx + Math.cos(i * angleStep - Math.PI / 2) * radius;
      const ay = cy + Math.sin(i * angleStep - Math.PI / 2) * radius;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ax, ay);
      ctx.stroke();
    }
    
    // Draw Poly
    ctx.strokeStyle = '#00FF41';
    ctx.fillStyle = 'rgba(0, 255, 65, 0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < numAxes; i++) {
      const val = Math.max(10, Math.min(100, values[i])) / 100;
      const vx = cx + Math.cos(i * angleStep - Math.PI / 2) * radius * val;
      const vy = cy + Math.sin(i * angleStep - Math.PI / 2) * radius * val;
      if (i === 0) ctx.moveTo(vx, vy);
      else ctx.lineTo(vx, vy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw Label text
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFF';
    
    for (let i = 0; i < numAxes; i++) {
      const lx = cx + Math.cos(i * angleStep - Math.PI / 2) * (radius + 18);
      const ly = cy + Math.sin(i * angleStep - Math.PI / 2) * (radius + 12);
      ctx.fillStyle = '#FFF';
      ctx.fillText(labels[i], lx, ly);
      ctx.fillStyle = '#00FF41';
      ctx.fillText(`${Math.round(values[i])}%`, lx, ly + 9);
    }
  };

  // Load colors based on active skins
  const activePaddle = shopItems.find(i => i.id === user.activePaddleSkin) || { styleValue: '#00ffff' };
  const paddleHex = activePaddle.styleValue;

  // Render skin colors dynamically based on live room state users!
  const getP1PaddleStyle = () => {
    if (gameMode === 'multiplayer' && liveRoomState?.player1) {
      const skinId = liveRoomState.player1.activePaddleSkin;
      const s = shopItems.find(i => i.id === skinId);
      if (s) return s.styleValue;
    }
    return role === 'p1' ? paddleHex : '#00ffff';
  };

  const getP2PaddleStyle = () => {
    if (gameMode === 'multiplayer' && liveRoomState?.player2) {
      const skinId = liveRoomState.player2.activePaddleSkin;
      const s = shopItems.find(i => i.id === skinId);
      if (s) return s.styleValue;
    }
    return role === 'p2' ? paddleHex : '#39ff14';
  };

  const getBoardBackgroundStyle = () => {
    if (gameMode === 'multiplayer' && liveRoomState?.player1) {
      const skinId = liveRoomState.player1.activeBoardSkin;
      const s = shopItems.find(i => i.id === skinId);
      if (s) return s.styleValue;
    }
    const s = shopItems.find(i => i.id === user.activeBoardSkin);
    return s?.styleValue || 'grid';
  };

  const boardStyle = getBoardBackgroundStyle();

  // Toggle audio
  const handleToggleMute = () => {
    synthInstance.muted = !muted;
    setMuted(!muted);
  };

  // --- REST LOBBY OPERATIONS ---
  const fetchRooms = async () => {
    if (gameMode !== 'multiplayer' || multiplayerView !== 'menu' || gameState !== 'lobby') return;
    setIsRefreshingRooms(true);
    try {
      const res = await fetch('/api/multiplayer/rooms');
      const data = await res.json();
      if (data.success) {
        setRoomsList(data.rooms);
      }
    } catch (err) {
      console.error("Failed to sync multiplayer lobbies", err);
    } finally {
      setIsRefreshingRooms(false);
    }
  };

  useEffect(() => {
    if (gameMode === 'multiplayer' && multiplayerView === 'menu' && gameState === 'lobby') {
      fetchRooms();
      const poll = setInterval(fetchRooms, 3500);
      return () => clearInterval(poll);
    }
  }, [gameMode, multiplayerView, gameState]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNameInput.trim()) return;
    setCreateError('');
    try {
      const res = await fetch('/api/multiplayer/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: roomNameInput.trim(),
          password: isPrivateInput ? roomPasswordInput : undefined,
          isPrivate: isPrivateInput,
          userId: user.id,
          boardSkin: user.activeBoardSkin
        })
      });
      const data = await res.json();
      if (data.success) {
        setHostLeftMessage(null);
        setCurrentRoom(data.room);
        setMultiplayerView('lobby_room');
        setShowCreateForm(false);
        setRoomNameInput('');
        setRoomPasswordInput('');
        setIsPrivateInput(false);
      } else {
        setCreateError(data.error || 'Room name already taken!');
      }
    } catch (err) {
      setCreateError('System error establishing room connection matrix.');
    }
  };

  const handleRandomMatch = async () => {
    setIsQueuing(true);
    setCreateError('');
    setHostLeftMessage(null);
    try {
      const res = await fetch('/api/multiplayer/rooms/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          boardSkin: user.activeBoardSkin
        })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentRoom(data.room);
        setRole(data.role);
        setMultiplayerView('lobby_room');
      } else {
        setCreateError(data.error || 'Antrean matchmaking bermasalah');
      }
    } catch (err) {
      setCreateError('Matchmaking connection grid desynced.');
    } finally {
      setIsQueuing(false);
    }
  };

  const handleJoinRoom = async (room: any, providedPassword?: string) => {
    setJoinError('');
    try {
      const res = await fetch('/api/multiplayer/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: room.roomName,
          password: providedPassword,
          userId: user.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setHostLeftMessage(null);
        setCurrentRoom(data.room);
        setRole('p2');
        setMultiplayerView('lobby_room');
        setJoiningRoom(null);
        setJoinPassword('');
      } else {
        setJoinError(data.error || 'Gagal masuk');
      }
    } catch (err) {
      setJoinError('Failed to synchronize with selected arena matrix.');
    }
  };

  const handleToggleReady = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && currentRoom) {
      const nextReady = !lobbyReady;
      setLobbyReady(nextReady);
      wsRef.current.send(JSON.stringify({
        type: 'toggle_ready',
        gameId: currentRoom.id,
        userId: user.id,
        ready: nextReady
      }));
    }
  };

  const handleLeaveLobby = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'leave_game' }));
    }
    setMultiplayerView('menu');
    setCurrentRoom(null);
    setLiveRoomState(null);
    setLobbyReady(false);
  };

  // Start matching for Multiplayer over auth socket connections
  useEffect(() => {
    if (gameMode === 'multiplayer' && multiplayerView === 'lobby_room' && currentRoom) {
      const socket = new WebSocket(socketUrl);
      (socket as any).gameId = currentRoom.id;
      wsRef.current = socket;

      socket.onopen = () => {
        setMultiplayerStatus('Connecting to arena sync matrix...');
        socket.send(JSON.stringify({
          type: 'join_game',
          roomId: currentRoom.id,
          userId: user.id
        }));
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'lobby_update') {
            const serverGame: LiveGameState = message.game;
            setLiveRoomState(serverGame);
            if (message.role) {
              setRole(message.role);
            }
            if (user.id === serverGame.player1?.id) {
              setLobbyReady(serverGame.player1?.ready || false);
            } else {
              setLobbyReady(serverGame.player2?.ready || false);
            }
          } else if (message.type === 'match_started') {
            const serverGame: LiveGameState = message.game;
            setLiveRoomState(serverGame);
            setRole(message.role);
            coordinateTrackingRef.current = [{ x: 375, y: 850 }];
            analyticsDataRef.current = {
              framesInOffense: 0,
              framesInDefense: 0,
              totalFrames: 0,
              velocitySum: 0,
              velocityCount: 0,
              successfulHits: 0,
              missedSwings: 0,
              activeSwingTimer: 0,
              hadNearbyPuck: false,
              frameCounter: 0
            };
            setGameState('playing');
            setTimeLeft(120);
            timeLeftRef.current = 120;
            isScoringRef.current = false;
            synthInstance.playScore();
          } else if (message.type === 'lobby_host_left') {
            setHostLeftMessage(message.message);
            setMultiplayerView('menu');
            setCurrentRoom(null);
            setLiveRoomState(null);
            setLobbyReady(false);
          } else if (message.type === 'game_state') {
            const serverGame: LiveGameState = message.game;
            
            if (role === 'p1') {
              // P1 has Host Authority and runs physics locally, so we do not overwrite puck coordinates.
              scoreRef.current.self = serverGame.player1?.score || 0;
              scoreRef.current.opponent = serverGame.player2?.score || 0;
              if (serverGame.player2) {
                opponentPaddle.current = serverGame.player2.pos;
              }
            } else {
              // P2 is client-only receiver and receives isomorphic flipped physics coordinates
              puckPos.current = {
                x: arenaWidth - serverGame.puck.pos.x,
                y: arenaHeight - serverGame.puck.pos.y
              };
              puckVel.current = {
                x: -serverGame.puck.vel.x,
                y: -serverGame.puck.vel.y
              };
              scoreRef.current.self = serverGame.player2?.score || 0;
              scoreRef.current.opponent = serverGame.player1?.score || 0;
              if (serverGame.timeLeft !== undefined) {
                setTimeLeft(serverGame.timeLeft);
                timeLeftRef.current = serverGame.timeLeft;
              }
              if (serverGame.player1) {
                opponentPaddle.current = {
                  x: arenaWidth - serverGame.player1.pos.x,
                  y: arenaHeight - serverGame.player1.pos.y
                };
              }
            }
          } else if (message.type === 'opponent_disconnected') {
            setMultiplayerStatus('Opponent disconnected. You win by forfeit!');
            setEndSummary({ win: true, scoreSelf: 5, scoreOpponent: 0 });
            setGameState('gameover');
            synthInstance.playGameOver(true);
            onGameCompleted(true, 5, 0);
          } else if (message.type === 'game_over') {
            const won = message.winnerId === user.id;
            setEndSummary({
              win: won,
              scoreSelf: won ? 5 : (role === 'p1' ? message.game.player2?.score : message.game.player1?.score) || 0,
              scoreOpponent: won ? (role === 'p1' ? message.game.player2?.score : message.game.player1?.score) || 0 : 5
            });
            setGameState('gameover');
            synthInstance.playGameOver(won);
            onGameCompleted(won, won ? 5 : 0, won ? 0 : 5);
          }
        } catch (err) {
          console.error('Error handling multiplayer socket packet:', err);
        }
      };

      socket.onerror = (err) => {
        console.error('WebSocket connecting error: ', err);
        setMultiplayerStatus('Failed to hook into match server. Please retry.');
      };

      socket.onclose = () => {
        if (gameState === 'playing') {
          setMultiplayerStatus('Connection snapped from the game matrix.');
          setGameState('lobby');
          setMultiplayerView('menu');
          setCurrentRoom(null);
          setLiveRoomState(null);
        }
      };

      return () => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'leave_game' }));
        }
        socket.close();
      };
    }
  }, [gameMode, currentRoom, multiplayerView, socketUrl, user.id, role, gameState]);

  // Interactive Dialogue Fetcher from server-side proxy
  const fetchGeminiDialogue = async (
    scorer: 'player' | 'ai',
    velocity: number,
    priorMessage: string = '',
    reply: string = '',
    phase: number = 1
  ) => {
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/gemini/dialogue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scorer,
          puckVelocity: velocity,
          priorAiMessage: priorMessage,
          playerReply: reply,
          phase,
          language: settings.language
        })
      });
      const data = await response.json();
      if (data.success && data.text) {
        setDialogueText(data.text);
      } else {
        setDialogueText('Keren juga! Ayo kita tanding lagi!');
      }
    } catch (err) {
      console.error('Failed to get Gemini dialogue response:', err);
      setDialogueText('Woi, fokus tanding dulu! Sini hajar lagi!');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Match Goal Scored Handler
  const checkAndAwardMatchProgress = (lastScorer: 'player' | 'ai', hitVelocity: number = 0) => {
    // Win condition is governed by the 2-minute timer countdown, so we do not trigger gameover here.
    if (gameMode === 'ai') {
      setDialogueScorer(lastScorer);
      setDialogueVelocity(hitVelocity);
      setDialoguePhase(1);
      setPlayerReplyInput('');
      setDialogueText('Menganalisis gol...');
      
      isDialogueOpenRef.current = true;
      setIsDialogueOpen(true);
      
      // Fetch dialogue reaction
      fetchGeminiDialogue(lastScorer, hitVelocity, '', '', 1);
    } else {
      // Multiplayer modes: reset the puck immediately for continuous fast play
      puckPos.current = { x: 375, y: 500 };
      puckVel.current = {
        x: (Math.random() > 0.5 ? 2.5 : -2.5) + (Math.random() - 0.5),
        y: (Math.random() > 0.5 ? 4 : -4) + (Math.random() - 0.5)
      };
      setTimeout(() => {
        isScoringRef.current = false;
      }, 300);
    }
  };

  const handleSendPlayerReply = () => {
    if (!playerReplyInput.trim() || isAiLoading) return;
    setDialoguePhase(3);
    fetchGeminiDialogue(dialogueScorer, dialogueVelocity, dialogueText, playerReplyInput, 3);
  };

  const handleResumeGameAndCloseDialogue = () => {
    puckPos.current = { x: 375, y: 500 };
    puckVel.current = {
      x: (Math.random() > 0.5 ? 2.5 : -2.5) + (Math.random() - 0.5),
      y: (Math.random() > 0.5 ? 4 : -4) + (Math.random() - 0.5)
    };
    
    isDialogueOpenRef.current = false;
    setIsDialogueOpen(false);
    
    setTimeout(() => {
      isScoringRef.current = false;
    }, 300);
  };

  // Starts AI Single Player mode
  const handleStartAiGame = () => {
    scoreRef.current = { self: 0, opponent: 0 };
    playerPaddle.current = { x: 375, y: 850 };
    opponentPaddle.current = { x: 375, y: 150 };
    lastPlayerPaddlePos.current = { x: 375, y: 850 };
    lastOpponentPaddlePos.current = { x: 375, y: 150 };
    puckPos.current = { x: 375, y: 500 };
    puckVel.current = {
      x: (Math.random() > 0.5 ? 2.5 : -2.5) + (Math.random() - 0.5),
      y: (Math.random() > 0.5 ? 4 : -4) + (Math.random() - 0.5)
    };
    puckTrail.current = [];
    coordinateTrackingRef.current = [{ x: 375, y: 850 }];
    
    // Reset Strict countdown counters
    setTimeLeft(120);
    timeLeftRef.current = 120;
    
    // Close dialogue systems
    isDialogueOpenRef.current = false;
    setIsDialogueOpen(false);
    isScoringRef.current = false;

    analyticsDataRef.current = {
      framesInOffense: 0,
      framesInDefense: 0,
      totalFrames: 0,
      velocitySum: 0,
      velocityCount: 0,
      successfulHits: 0,
      missedSwings: 0,
      activeSwingTimer: 0,
      hadNearbyPuck: false,
      frameCounter: 0
    };
    setGameState('playing');
    // sound alert
    synthInstance.playScore();
  };

  // Canvas Interactions / Main Render & Local AI Physics loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isDragging = false;

    // Advanced AI tuning parameters
    let botMaxSpeed = 5.5; 
    let lagFactor = 0.18;
    let maxNoise = 16;
    let delayFrames = 12; // Normal (Medium): 200ms delay

    if (aiDifficulty === 'easy') {
      botMaxSpeed = 3.2;    // Slower than player
      lagFactor = 0.08;
      maxNoise = 58;        // High error margin
      delayFrames = 30;     // 500ms delay at 60fps
    } else if (aiDifficulty === 'hard') {
      botMaxSpeed = 9.5;    // High speed
      lagFactor = 0.35;
      maxNoise = 2;         // Spot on accurate
      delayFrames = 3;      // 50ms delay
    }

    // Advanced Reaction & Prediction state
    const perceivedPuck = { x: puckPos.current.x, y: puckPos.current.y };
    let aiOffsetTimer = 0;
    let aiOffsetX = 0;
    let aiOffsetY = 0;

    const goalMinX = 250;
    const goalMaxX = 500;

    // Canvas scaling to match viewport
    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;
      const aspect = arenaWidth / arenaHeight;
      const availableWidth = window.innerWidth - 16;
      const availableHeight = window.innerHeight - 150;
      
      let width = Math.min(availableWidth, 576);
      let height = width / aspect;
      
      if (height > availableHeight) {
        height = availableHeight;
        width = height * aspect;
      }
      
      canvas.style.width = `${Math.floor(width)}px`;
      canvas.style.height = `${Math.floor(height)}px`;
      container.style.width = `${Math.floor(width)}px`;
      container.style.height = `${Math.floor(height)}px`;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Coordinate parsing helpers
    const getCanvasCoords = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;

      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      // Translate DOM coords to virtual grid of 750x1000
      const x = ((clientX - rect.left) / rect.width) * arenaWidth;
      const y = ((clientY - rect.top) / rect.height) * arenaHeight;
      return { x, y };
    };

    // DRAG EVENT HANDLERS
    const handleStartDrag = (e: MouseEvent | TouchEvent) => {
      const coords = getCanvasCoords(e);
      const dist = Math.hypot(coords.x - playerPaddle.current.x, coords.y - playerPaddle.current.y);
      if (dist < paddleRadius * 2) {
        isDragging = true;
      }
    };

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const coords = getCanvasCoords(e);

      // Save new location bounded inside bottom half
      if (gameMode === 'ai') {
        playerPaddle.current.x = Math.max(paddleRadius, Math.min(arenaWidth - paddleRadius, coords.x));
        playerPaddle.current.y = Math.max(arenaHeight / 2 + paddleRadius, Math.min(arenaHeight - paddleRadius, coords.y));
      } else {
        // Send coordinate updates to websocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'move_paddle',
            gameId: wsRef.current && (wsRef.current as any).gameId,
            role,
            x: coords.x,
            y: role === 'p1' ? coords.y : arenaHeight - coords.y // flip coordinates representation for P2 so top looks normal
          }));
        }

        // Optimistic local update
        playerPaddle.current.x = Math.max(paddleRadius, Math.min(arenaWidth - paddleRadius, coords.x));
        // Client views paddle on bottom hemi (P1 bottom, P2 also views themselves on bottom)
        playerPaddle.current.y = Math.max(arenaHeight / 2 + paddleRadius, Math.min(arenaHeight - paddleRadius, coords.y));
      }
    };

    const handleStopDrag = () => {
      isDragging = false;
    };

    // Attach listeners
    canvas.addEventListener('mousedown', handleStartDrag);
    canvas.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleStopDrag);

    canvas.addEventListener('touchstart', handleStartDrag, { passive: false });
    canvas.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('touchend', handleStopDrag);

    // ==========================================
    // MULTIPLAYER OR bot LOCAL PHYSICS LOOP
    // ==========================================
    const updatePhysics = () => {
      // --- ESPORTS METRICS DATA ACQUISITION ENGINES ---
      const uPaddle = playerPaddle.current;
      const lastUPaddle = lastPlayerPaddlePos.current;
      const pVelocity = Math.hypot(uPaddle.x - lastUPaddle.x, uPaddle.y - lastUPaddle.y);

      // Record paddle coordinate trace indices every 8 ticks
      analyticsDataRef.current.frameCounter++;
      if (analyticsDataRef.current.frameCounter % 8 === 0) {
        coordinateTrackingRef.current.push({ x: uPaddle.x, y: uPaddle.y });
        // Prevent buffer memory spikes: limit logs to 1000 items (ample for a match)
        if (coordinateTrackingRef.current.length > 1000) {
          coordinateTrackingRef.current.shift();
        }
      }

      analyticsDataRef.current.totalFrames++;

      // Metric 1: Aggressiveness
      if (uPaddle.y < arenaHeight * 0.72) {
        analyticsDataRef.current.framesInOffense++;
      }

      // Metric 2: Defensiveness
      const distToGoal = Math.hypot(uPaddle.x - arenaWidth / 2, uPaddle.y - arenaHeight);
      if (distToGoal < 200) {
        analyticsDataRef.current.framesInDefense++;
      }

      // Metric 3: Speed index
      if (pVelocity > 0.05) {
        analyticsDataRef.current.velocitySum += pVelocity;
        analyticsDataRef.current.velocityCount++;
      }

      // Metric 4: Hit and Swing validation (Accuracy tracking)
      if (pVelocity > 4 && uPaddle.y - lastUPaddle.y < -3) {
        if (analyticsDataRef.current.activeSwingTimer === 0) {
          analyticsDataRef.current.activeSwingTimer = 15;
          analyticsDataRef.current.hadNearbyPuck = false;
        }
      }

      if (analyticsDataRef.current.activeSwingTimer > 0) {
        analyticsDataRef.current.activeSwingTimer--;
        const distPuck = Math.hypot(uPaddle.x - puckPos.current.x, uPaddle.y - puckPos.current.y);
        if (distPuck < paddleRadius + puckRadius + 15) {
          analyticsDataRef.current.hadNearbyPuck = true;
        }
        if (analyticsDataRef.current.activeSwingTimer === 0) {
          if (!analyticsDataRef.current.hadNearbyPuck) {
            analyticsDataRef.current.missedSwings++;
          }
        }
      }

      const currentDistToPuck = Math.hypot(uPaddle.x - puckPos.current.x, uPaddle.y - puckPos.current.y);
      if (currentDistToPuck < paddleRadius + puckRadius + 2) {
        if (!analyticsDataRef.current.hadNearbyPuck) {
          analyticsDataRef.current.successfulHits++;
          analyticsDataRef.current.hadNearbyPuck = true;
        }
      } else {
        analyticsDataRef.current.hadNearbyPuck = false;
      }

      if (gameMode === 'multiplayer') {
        lastPlayerPaddlePos.current = { x: playerPaddle.current.x, y: playerPaddle.current.y };
        lastOpponentPaddlePos.current = { x: opponentPaddle.current.x, y: opponentPaddle.current.y };

        // Add puck trails coordinates
        const trailMaxLen = graphicsQuality === 'low' ? 3 : graphicsQuality === 'medium' ? 7 : 14;
        puckTrail.current.push({ x: puckPos.current.x, y: puckPos.current.y });
        while (puckTrail.current.length > trailMaxLen) {
          puckTrail.current.shift();
        }

        if (role === 'p2') {
          // Player 2 is client-only receiver: send local paddle update, do not run physics simulation
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && currentRoom) {
            wsRef.current.send(JSON.stringify({
              type: 'move_paddle',
              gameId: currentRoom.id,
              role: 'p2',
              x: arenaWidth - playerPaddle.current.x,
              y: arenaHeight - playerPaddle.current.y
            }));
          }
          return;
        }
      }

      // Singleplayer Local Advanced Physics Loop
      const puck = puckPos.current;
      const vel = puckVel.current;
      const bot = opponentPaddle.current;

      if (gameMode !== 'multiplayer') {
        // Update puck history coordinates queue to simulate reaction time latency
        puckHistoryRef.current.push({ x: puck.x, y: puck.y });
        if (puckHistoryRef.current.length > 120) {
          puckHistoryRef.current.shift();
        }

        // Fetch a coordinate from the past based on difficulty delay
        const getDelayedPuck = () => {
          const history = puckHistoryRef.current;
          if (history.length === 0) return { x: puck.x, y: puck.y };
          const idx = Math.max(0, history.length - 1 - delayFrames);
          return history[idx];
        };

        const delayedPuck = getDelayedPuck();

        // 1. Reactive AI Perception with custom latency lag
        perceivedPuck.x += (delayedPuck.x - perceivedPuck.x) * lagFactor;
        perceivedPuck.y += (delayedPuck.y - perceivedPuck.y) * lagFactor;

        // Reset or fluctuate target offsets to simulate human prediction offset errors
        aiOffsetTimer--;
        if (aiOffsetTimer <= 0) {
          aiOffsetTimer = 15 + Math.round(Math.random() * 25);
          aiOffsetX = (Math.random() - 0.5) * maxNoise;
          aiOffsetY = (Math.random() - 0.5) * maxNoise;
        }

        let targetX = arenaWidth / 2;
        let targetY = 150;

        // Simple AI state machine driven by delayed perception
        if (delayedPuck.y < arenaHeight / 2) {
          // Puck is inside AI opponent's active territory
          if (bot.y > delayedPuck.y - 12) {
            // RECOVER MODE: Puck is behind AI. Avoid hitting own goal - quickly navigate around it.
            targetY = Math.max(paddleRadius + 15, delayedPuck.y - 65 + aiOffsetY);
            if (delayedPuck.x > arenaWidth / 2) {
              targetX = delayedPuck.x - 70 + aiOffsetX;
            } else {
              targetX = delayedPuck.x + 70 + aiOffsetX;
            }
          } else {
            // ATTACK MODE: AI in position behind puck. Set up and execute a dynamic strike!
            const targetGoalX = 375 + aiOffsetX * 3; // Aim with randomized error offsets
            const targetGoalY = arenaHeight;

            const dirX = delayedPuck.x - targetGoalX;
            const dirY = delayedPuck.y - targetGoalY;
            const distGoal = Math.hypot(dirX, dirY) || 1;
            const uX = dirX / distGoal;
            const uY = dirY / distGoal;

            // Target a position behind the puck aligned with player's goal
            const prepX = delayedPuck.x + uX * (paddleRadius + puckRadius + 15);
            const prepY = delayedPuck.y + uY * (paddleRadius + puckRadius + 15);

            const distToPrep = Math.hypot(prepX - bot.x, prepY - bot.y);
            if (distToPrep > 35) {
              // Traverse behind puck first to set up alignment
              targetX = prepX + aiOffsetX;
              targetY = prepY + aiOffsetY;
            } else {
              // Align finished - thrust forward with full strike velocity past puck
              targetX = delayedPuck.x - uX * 22;
              targetY = delayedPuck.y - uY * 22;
            }
          }
        } else {
          // DEFENSE MODE: Puck on player's side or fleeing
          // Shadow the puck's perceived location to cover goal angles from distance
          targetX = arenaWidth / 2 + (perceivedPuck.x + aiOffsetX - arenaWidth / 2) * 0.45;
          targetY = 135 + aiOffsetY * 0.4;
        }

        // 2. Smooth Kinematic Motion Execution (Strictly bounded by botMaxSpeed, preventing any frame rate teleportation)
        const dX = targetX - bot.x;
        const dY = targetY - bot.y;
        const dist = Math.hypot(dX, dY);

        if (dist > 1) {
          const interpK = aiDifficulty === 'easy' ? 0.08 : aiDifficulty === 'medium' ? 0.16 : 0.40;
          let stepX = dX * interpK;
          let stepY = dY * interpK;

          // Force rigorous capping under maximum speed threshold to eliminate quantum tunneling/teleportation
          const stepDist = Math.hypot(stepX, stepY);
          if (stepDist > botMaxSpeed) {
            stepX = (stepX / stepDist) * botMaxSpeed;
            stepY = (stepY / stepDist) * botMaxSpeed;
          }

          bot.x += stepX;
          bot.y += stepY;
        }

        // Clamp inside opponent's half of the arena
        bot.x = Math.max(paddleRadius + 12, Math.min(arenaWidth - paddleRadius - 12, bot.x));
        bot.y = Math.max(paddleRadius + 12, Math.min(arenaHeight / 2 - paddleRadius - 5, bot.y));
      }

      // Calculate instantaneous paddle velocities (distance moved between last frame and current frame)
      const playerPaddleVelX = playerPaddle.current.x - lastPlayerPaddlePos.current.x;
      const playerPaddleVelY = playerPaddle.current.y - lastPlayerPaddlePos.current.y;

      const opponentPaddleVelX = opponentPaddle.current.x - lastOpponentPaddlePos.current.x;
      const opponentPaddleVelY = opponentPaddle.current.y - lastOpponentPaddlePos.current.y;

      // 2. High-Fidelity Physics Solver utilizing sub-stepping for Continuous Collision Detection (CCD)
      const subSteps = 6;
      const friction = 0.994; // Realistic natural air table friction representation
      const frictionPerStep = Math.pow(friction, 1 / subSteps);

      for (let step = 0; step < subSteps; step++) {
        // Linearly interpolate positions of moving entities per sub-step for continuous precision
        const stepFractionEnd = (step + 1) / subSteps;
        const playerPaddleX = lastPlayerPaddlePos.current.x + playerPaddleVelX * stepFractionEnd;
        const playerPaddleY = lastPlayerPaddlePos.current.y + playerPaddleVelY * stepFractionEnd;

        const opponentPaddleX = lastOpponentPaddlePos.current.x + opponentPaddleVelX * stepFractionEnd;
        const opponentPaddleY = lastOpponentPaddlePos.current.y + opponentPaddleVelY * stepFractionEnd;

        // Move puck by sub-step increment
        puck.x += vel.x / subSteps;
        puck.y += vel.y / subSteps;

        // Apply friction decay
        vel.x *= frictionPerStep;
        vel.y *= frictionPerStep;

        // Bouncing constraints: Left Wall (accounting for the 10px frame border)
        if (puck.x - puckRadius < 10) {
          puck.x = puckRadius + 10;
          vel.x = -vel.x * 0.85; // Natural elastic reflection
          synthInstance.playHit();
          createSparks(10, puck.y, '#00ff66', 12);
        } 
        // Bouncing constraints: Right Wall
        else if (puck.x + puckRadius > arenaWidth - 10) {
          puck.x = arenaWidth - puckRadius - 10;
          vel.x = -vel.x * 0.85;
          synthInstance.playHit();
          createSparks(arenaWidth - 10, puck.y, '#00ffff', 12);
        }

        // Bouncing constraints: Top Wall / Goal Post validation
        if (puck.y - puckRadius < 10) {
          if (puck.x >= goalMinX && puck.x <= goalMaxX) {
            // Puck enters/crosses the P1 top goal area
            if (puck.y < -puckRadius) {
              if (!isScoringRef.current) {
                isScoringRef.current = true;
                scoreRef.current.self += 1;
                synthInstance.playScore();
                checkAndAwardMatchProgress('player', Math.hypot(vel.x, vel.y));
              }
              break; // break the sub-step physics simulation for reset
            }
          } else {
            // Bounce off non-goal top boundary wall
            puck.y = puckRadius + 10;
            vel.y = -vel.y * 0.85;
            synthInstance.playHit();
            createSparks(puck.x, 10, '#00ffff', 12);
          }
        }

        // Bouncing constraints: Bottom Wall / Opponent Goal Post validation
        if (puck.y + puckRadius > arenaHeight - 10) {
          if (puck.x >= goalMinX && puck.x <= goalMaxX) {
            // Puck enters/crosses bottom goal
            if (puck.y > arenaHeight + puckRadius) {
              if (!isScoringRef.current) {
                isScoringRef.current = true;
                scoreRef.current.opponent += 1;
                synthInstance.playScore();
                checkAndAwardMatchProgress('ai', Math.hypot(vel.x, vel.y));
              }
              break; // break physics simulation for reset
            }
          } else {
            // Bounce off bottom boundary wall
            puck.y = arenaHeight - puckRadius - 10;
            vel.y = -vel.y * 0.85;
            synthInstance.playHit();
            createSparks(puck.x, arenaHeight - 10, '#00ff66', 12);
          }
        }

        // Round Goal Posts Corners Collision Reflection (Insanely dynamic and authentic corner bounces!)
        const posts = [
          { x: goalMinX, y: 10 },
          { x: goalMaxX, y: 10 },
          { x: goalMinX, y: arenaHeight - 10 },
          { x: goalMaxX, y: arenaHeight - 10 }
        ];

        for (const post of posts) {
          const dx = puck.x - post.x;
          const dy = puck.y - post.y;
          const dist = Math.hypot(dx, dy);
          if (dist < puckRadius) {
            const normX = dx / dist;
            const normY = dy / dist;
            // Push puck outside safely to prevent tunnel embedding
            puck.x = post.x + normX * puckRadius;
            puck.y = post.y + normY * puckRadius;

            // Reflect relative velocity along normal
            const velNorm = vel.x * normX + vel.y * normY;
            if (velNorm < 0) {
              vel.x -= (1 + 0.85) * velNorm * normX;
              vel.y -= (1 + 0.85) * velNorm * normY;
              synthInstance.playHit();
              createSparks(post.x, post.y, '#ff0055', 14);
            }
          }
        }

        // Momentum Collision: Player Paddle and Puck
        const dx1 = puck.x - playerPaddleX;
        const dy1 = puck.y - playerPaddleY;
        const dist1 = Math.hypot(dx1, dy1);
        const minDist = puckRadius + paddleRadius;

        if (dist1 < minDist) {
          const normX = dx1 / dist1;
          const normY = dy1 / dist1;

          // Push puck outside of paddle to avoid overlapping
          puck.x = playerPaddleX + normX * minDist;
          puck.y = playerPaddleY + normY * minDist;

          // Relative velocity calculation of Puck relative to Player paddle
          const relVelX = vel.x - playerPaddleVelX;
          const relVelY = vel.y - playerPaddleVelY;
          const relVelNorm = relVelX * normX + relVelY * normY;

          // Only collide if they are moving towards each other
          if (relVelNorm < 0) {
            const restitution = 0.88; // Sleek high-energy bounciness coefficient
            const impulse = -(1 + restitution) * relVelNorm;
            
            // Adjust puck speed vector by normal rebound force
            vel.x += impulse * normX;
            vel.y += impulse * normY;

            // Tangential spin transfer: Adds a physical slicing effect when swiped sideways!
            const tanX = -normY;
            const tanY = normX;
            const relVelTan = relVelX * tanX + relVelY * tanY;
            vel.x -= relVelTan * tanX * 0.18;
            vel.y -= relVelTan * tanY * 0.18;

            synthInstance.playHit();
            createSparks(puck.x, puck.y, getP1PaddleStyle(), 18);
          }
        }

        // Momentum Collision: Bot Paddle and Puck
        const dx2 = puck.x - opponentPaddleX;
        const dy2 = puck.y - opponentPaddleY;
        const dist2 = Math.hypot(dx2, dy2);

        if (dist2 < minDist) {
          const normX = dx2 / dist2;
          const normY = dy2 / dist2;

          // Push outside
          puck.x = opponentPaddleX + normX * minDist;
          puck.y = opponentPaddleY + normY * minDist;

          // Relative velocity of puck relative to bot paddle
          const relVelX = vel.x - opponentPaddleVelX;
          const relVelY = vel.y - opponentPaddleVelY;
          const relVelNorm = relVelX * normX + relVelY * normY;

          if (relVelNorm < 0) {
            const restitution = 0.88;
            const impulse = -(1 + restitution) * relVelNorm;
            
            vel.x += impulse * normX;
            vel.y += impulse * normY;

            // Tangential spin transfer
            const tanX = -normY;
            const tanY = normX;
            const relVelTan = relVelX * tanX + relVelY * tanY;
            vel.x -= relVelTan * tanX * 0.18;
            vel.y -= relVelTan * tanY * 0.18;

            synthInstance.playHit();
            createSparks(puck.x, puck.y, getP2PaddleStyle(), 18);
          }
        }
      }

      // Enforce physical peak speed cap to ensure safe, ultra-smooth visual rendering under 60FPS+
      const puckSpeed = Math.hypot(vel.x, vel.y);
      const maxPuckSpeed = 35;
      if (puckSpeed > maxPuckSpeed) {
        vel.x = (vel.x / puckSpeed) * maxPuckSpeed;
        vel.y = (vel.y / puckSpeed) * maxPuckSpeed;
      }

      // Append trail dynamically based on Graphics settings
      const maxTrailLength = graphicsQuality === 'low' ? 3 : graphicsQuality === 'medium' ? 7 : 14;
      puckTrail.current.push({ x: puck.x, y: puck.y });
      while (puckTrail.current.length > maxTrailLength) {
        puckTrail.current.shift();
      }

      // Commit previous coordinates for tracking the next frame's paddle velocities
      lastPlayerPaddlePos.current = { x: playerPaddle.current.x, y: playerPaddle.current.y };
      lastOpponentPaddlePos.current = { x: opponentPaddle.current.x, y: opponentPaddle.current.y };

      // Under Host Authority, Player 1 (creator) continuously streams paddle, scores, and calculated puck physics to server
      if (gameMode === 'multiplayer' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN && currentRoom && role === 'p1') {
        wsRef.current.send(JSON.stringify({
          type: 'move_paddle',
          gameId: currentRoom.id,
          role: 'p1',
          x: playerPaddle.current.x,
          y: playerPaddle.current.y,
          puck: {
            pos: puckPos.current,
            vel: puckVel.current
          },
          scores: {
            p1: scoreRef.current.self,
            p2: scoreRef.current.opponent
          }
        }));
      }
    };

    // RENDER CANVAS GRAPHICS
    const drawCanvas = () => {
      // Clear canvas drawing buffer to prevent GPU/CPU leaks & overheating
      ctx.clearRect(0, 0, arenaWidth, arenaHeight);
      
      // Clear with dark ambient space backdrop
      ctx.fillStyle = '#060609';
      ctx.fillRect(0, 0, arenaWidth, arenaHeight);

      // Arena Grid Background Styles
      if (boardStyle === 'matrix') {
        // Matrix Green Grid
        ctx.strokeStyle = 'rgba(0, 255, 102, 0.15)';
        ctx.lineWidth = 1.5;
        const step = 50;
        for (let x = 0; x < arenaWidth; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, arenaHeight);
          ctx.stroke();
        }
        for (let y = 0; y < arenaHeight; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(arenaWidth, y);
          ctx.stroke();
        }
      } else if (boardStyle === 'vaporwave') {
        // Vaporwave Dusk Pink/Violet Grid
        ctx.strokeStyle = 'rgba(217, 70, 239, 0.15)';
        ctx.lineWidth = 1.5;
        const step = 50;
        for (let x = 0; x < arenaWidth; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, arenaHeight);
          ctx.stroke();
        }
        for (let y = 0; y < arenaHeight; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(arenaWidth, y);
          ctx.stroke();
        }
      } else if (boardStyle === 'solar') {
        // Obsidian & Sun Gold Amber Grid
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.15)';
        ctx.lineWidth = 1.5;
        const step = 50;
        for (let x = 0; x < arenaWidth; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, arenaHeight);
          ctx.stroke();
        }
        for (let y = 0; y < arenaHeight; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(arenaWidth, y);
          ctx.stroke();
        }
      } else {
        // Neon Cyan Classic Grid
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        const step = 50;
        for (let x = 0; x < arenaWidth; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, arenaHeight);
          ctx.stroke();
        }
        for (let y = 0; y < arenaHeight; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(arenaWidth, y);
          ctx.stroke();
        }
      }

      // Outer Arena Borders Frame Setup
      ctx.strokeStyle = '#00ffff';
      if (boardStyle === 'matrix') ctx.strokeStyle = '#39ff14';
      if (boardStyle === 'vaporwave') ctx.strokeStyle = '#d946ef';
      if (boardStyle === 'solar') ctx.strokeStyle = '#eab308';
      
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, arenaWidth - 10, arenaHeight - 10);

      // Draw Goals structures (Open spaces highlighted with glowing neon lines)
      ctx.strokeStyle = '#ff003c'; // Danger goal line color
      ctx.lineWidth = 8;
      
      // Top Goal
      ctx.beginPath();
      ctx.moveTo(goalMinX, 5);
      ctx.lineTo(goalMaxX, 5);
      ctx.stroke();

      // Bottom Goal
      ctx.beginPath();
      ctx.moveTo(goalMinX, arenaHeight - 5);
      ctx.lineTo(goalMaxX, arenaHeight - 5);
      ctx.stroke();

      // Draw Center Line division
      ctx.strokeStyle = ctx.strokeStyle; // Match the border neon accent
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(10, arenaHeight / 2);
      ctx.lineTo(arenaWidth - 10, arenaHeight / 2);
      ctx.stroke();

      // Center Ring
      ctx.beginPath();
      ctx.arc(arenaWidth / 2, arenaHeight / 2, 100, 0, Math.PI * 2);
      ctx.stroke();

      // Goal Crease arches
      ctx.beginPath();
      ctx.arc(arenaWidth / 2, 0, 200, 0, Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(arenaWidth / 2, arenaHeight, 200, Math.PI, Math.PI * 2);
      ctx.stroke();

      // DRAW TRAILS OF DRAGGING GLOWING PUCK WITH ADAPTIVE QUALITY ALPHA RAMPS
      const trailLength = puckTrail.current.length;
      puckTrail.current.forEach((t, i) => {
        const factor = (i + 1) / (trailLength + 1);
        const alpha = factor * (graphicsQuality === 'high' ? 0.35 : graphicsQuality === 'medium' ? 0.22 : 0.12);
        
        let trailColor = '#00ffff';
        if (boardStyle === 'matrix') trailColor = '#39ff14';
        if (boardStyle === 'vaporwave') trailColor = '#d946ef';
        if (boardStyle === 'solar') trailColor = '#eab308';
        
        ctx.fillStyle = trailColor;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        const sizeRadius = puckRadius - (trailLength - i) * (graphicsQuality === 'low' ? 2.0 : 0.82);
        ctx.arc(t.x, t.y, Math.max(2, sizeRadius), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // DRAW PUCK ENTITY WITH CONDITIONAL NEON SHADOWS
      if (graphicsQuality !== 'low') {
        ctx.shadowBlur = graphicsQuality === 'high' ? 22 : 12;
        ctx.shadowColor = '#00ffff';
        if (boardStyle === 'matrix') ctx.shadowColor = '#39ff14';
        if (boardStyle === 'vaporwave') ctx.shadowColor = '#d946ef';
        if (boardStyle === 'solar') ctx.shadowColor = '#eab308';
      } else {
        ctx.shadowBlur = 0;
      }
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(puckPos.current.x, puckPos.current.y, puckRadius, 0, Math.PI * 2);
      ctx.fill();

      // Inner puck detailing
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#00ffff';
      if (boardStyle === 'matrix') ctx.strokeStyle = '#39ff14';
      if (boardStyle === 'vaporwave') ctx.strokeStyle = '#d946ef';
      if (boardStyle === 'solar') ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(puckPos.current.x, puckPos.current.y, puckRadius - 6, 0, Math.PI * 2);
      ctx.stroke();

      // DRAW PLAYER PADDLE (PLAYER 1 OR INDIVIDUALIZED SKIN)
      const p1SkinsColor = getP1PaddleStyle();
      if (graphicsQuality !== 'low') {
        ctx.shadowBlur = graphicsQuality === 'high' ? 22 : 12;
        ctx.shadowColor = p1SkinsColor;
      }
      ctx.fillStyle = p1SkinsColor;
      ctx.beginPath();
      ctx.arc(playerPaddle.current.x, playerPaddle.current.y, paddleRadius, 0, Math.PI * 2);
      ctx.fill();

      // Highlight knob
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(playerPaddle.current.x, playerPaddle.current.y, paddleRadius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // DRAW OPPONENT PADDLE (PLAYER 2 OR AI COLOR WITH SKINS SUPPORT)
      const p2SkinsColor = gameMode === 'multiplayer' ? getP2PaddleStyle() : '#ff003c';
      if (graphicsQuality !== 'low') {
        ctx.shadowBlur = graphicsQuality === 'high' ? 22 : 12;
        ctx.shadowColor = p2SkinsColor;
      }
      ctx.fillStyle = p2SkinsColor;
      ctx.beginPath();
      ctx.arc(opponentPaddle.current.x, opponentPaddle.current.y, paddleRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(opponentPaddle.current.x, opponentPaddle.current.y, paddleRadius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // UPDATE AND DRAW NEON CORUSCATING SPARKS (COLLISION PARTICLES)
      if (graphicsQuality !== 'low') {
        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.982;
          p.vy *= 0.982;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }

          if (graphicsQuality === 'high') {
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - (1 - p.alpha) * 0.3), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      }

      // DRAW SCORES DIRECTLY ON FIELD BACKDROP
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.font = 'bold 150px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Opponent score on top
      ctx.fillText(scoreRef.current.opponent.toString(), arenaWidth / 2, arenaHeight * 0.25);
      // Self score on bottom
      ctx.fillText(scoreRef.current.self.toString(), arenaWidth / 2, arenaHeight * 0.75);

      // Embedded branding "credits by Zidandev" on center line space for credit accountability
      ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
      if (boardStyle === 'matrix') ctx.fillStyle = 'rgba(57, 255, 20, 0.18)';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('credits by Zidandev', arenaWidth / 2, arenaHeight / 2 - 20);
    };

    // Primary Game Loop ticks
    const loop = () => {
      if (isDialogueOpenRef.current) {
        // Paused on Dialogue - do not update physics, but keep drawing canvas so it remains responsive
        drawCanvas();
      } else {
        updatePhysics();
        drawCanvas();
      }
      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', handleStartDrag);
      canvas.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleStopDrag);
      canvas.removeEventListener('touchstart', handleStartDrag);
      canvas.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleStopDrag);
    };
  }, [gameState, gameMode, role, aiDifficulty, paddleHex, boardStyle]);

  // --- TELEMETRY POST-MATCH VISUALIZATIONS EFFECT ---
  useEffect(() => {
    if (gameState !== 'gameover') return;

    // Small delay to ensure canvas elements are mounted to DOM
    const timer = setTimeout(() => {
      // Heatmap board rendering
      const heatmapCanvas = document.getElementById('heatmap-canvas') as HTMLCanvasElement;
      if (heatmapCanvas) {
        drawHeatmap(heatmapCanvas, coordinateTrackingRef.current);
      }

      // Radar board rendering
      const radarCanvas = document.getElementById('radar-canvas') as HTMLCanvasElement;
      if (radarCanvas) {
        const metrics = calculateTelemetryMetrics();
        const globalChart = (window as any).Chart;
        if (globalChart) {
          try {
            // Destroy previous instance if cached on the target canvas
            const existingChartObj = globalChart.getChart(radarCanvas);
            if (existingChartObj) {
              existingChartObj.destroy();
            }

            new globalChart(radarCanvas, {
              type: 'radar',
              data: {
                labels: ['AGGRESSIVENESS', 'DEFENSIVENESS', 'SPEED', 'ACCURACY'],
                datasets: [{
                  label: 'METRICS %',
                  data: [
                    Math.round(metrics.aggressiveness),
                    Math.round(metrics.defensiveness),
                    Math.round(metrics.speed),
                    Math.round(metrics.accuracy)
                  ],
                  backgroundColor: 'rgba(0, 255, 65, 0.22)',
                  borderColor: '#00FF41',
                  pointBackgroundColor: '#BF00FF',
                  pointBorderColor: '#FFF',
                  pointHoverBackgroundColor: '#FFF',
                  pointHoverBorderColor: '#00FF41',
                  borderWidth: 2,
                  pointRadius: 4
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: { enabled: true }
                },
                scales: {
                  r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.12)' },
                    grid: { color: 'rgba(0, 255, 65, 0.12)' },
                    pointLabels: {
                      color: '#FFF',
                      font: { family: 'monospace', size: 9, weight: 'bold' }
                    },
                    ticks: {
                      backdropColor: 'transparent',
                      color: 'rgba(255, 255, 255, 0.4)',
                      font: { size: 8 },
                      stepSize: 25
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                  }
                }
              }
            });
          } catch (err) {
            console.error('Error compiling Chart.js radar:', err);
            drawRadarChartFallback(radarCanvas, metrics);
          }
        } else {
          drawRadarChartFallback(radarCanvas, metrics);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [gameState, settings.language]);

  return (
    <div className="w-full flex flex-col items-center select-none" id="air-hockey-game-view">
      {/* Top Header Control Ribbon */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 px-2" id="game-ribbon-controls">
        <button
          onClick={onExit}
          id="btn-game-exit-return"
          className="flex items-center gap-2 px-4 py-2 bg-black border border-[#00FF41]/30 text-[#00FF41] font-mono text-sm uppercase font-semibold hover:border-[#00FF41] hover:text-white cursor-pointer rounded transition-all active:scale-95 duration-100"
        >
          <ArrowLeft size={16} /> {t.leave}
        </button>

        <div className="flex items-center gap-3">
          {gameMode === 'ai' && gameState === 'lobby' && (
            <div id="ai-difficulty-toggles" className="flex bg-black border border-[#00FF41]/20 p-0.5 rounded text-sm font-mono text-white/40">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setAiDifficulty(diff)}
                  className={`px-3 py-1 font-bold rounded capitalize uppercase text-xs cursor-pointer transition-all ${
                    aiDifficulty === diff ? 'bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30 font-bold' : 'hover:text-[#00FF41]/80 hover:text-white'
                  }`}
                >
                  {diff === 'easy' ? t.easy : diff === 'medium' ? t.medium : t.hard}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setSettingsModalOpen(true)}
            id="btn-settings-toggle"
            className="p-2 bg-black border border-[#00FF41]/30 text-[#00FF41] hover:border-[#00FF41] hover:text-white rounded cursor-pointer transition-all active:scale-90"
            title="Configure Parameters"
          >
            <Settings size={18} />
          </button>

          <button
            onClick={handleToggleMute}
            id="btn-sound-mute-toggle"
            className="p-2 bg-black border border-[#00FF41]/30 text-[#00FF41] hover:border-[#00FF41] hover:text-white rounded cursor-pointer transition-all active:scale-95"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>

      {/* Main interactive area wrapper */}
      <div
        ref={containerRef}
        className="relative w-full max-w-xl aspect-[3/4] bg-black border border-[#00FF41]/10 shadow-2xl flex items-center justify-center overflow-hidden rounded-lg"
        id="arena-container-viewport"
      >
        {gameState === 'lobby' && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm z-10 flex flex-col items-center justify-start py-6 px-4 overflow-y-auto text-center animate-fade-in" id="modes-selection-dialog">
            {gameMode === 'ai' ? (
              <div className="flex flex-col items-center justify-center h-full my-auto">
                <div className="w-16 h-16 rounded-full bg-black border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.2)] mb-4 animate-pulse">
                  <Cpu size={32} />
                </div>

                <h2 className="font-sans font-bold tracking-tight text-2xl text-white uppercase" id="modes-dialog-title">
                  VS Artificial Intelligence
                </h2>
                <p className="font-mono text-xs text-[#00FF41]/60 max-w-sm mt-2 mb-6" id="modes-dialog-desc">
                  Standard target of 5 goals. Adjust AI difficulty speed on upper ribbon bar.
                </p>

                <button
                  onClick={handleStartAiGame}
                  id="btn-launch-ai-game"
                  className="flex items-center gap-2 px-8 py-4 neon-border-cyan bg-[#00F0FF]/15 text-[#00F0FF] hover:bg-[#00F0FF]/25 font-bold font-mono uppercase text-sm tracking-widest cursor-pointer rounded shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all hover:scale-105 active:scale-95"
                >
                  <Play size={16} fill="currentColor" /> Engage AI Match
                </button>
              </div>
            ) : (
              /* MULTIPLAYER FLOW */
              <div className="w-full flex flex-col items-center h-full">
                {multiplayerView === 'menu' ? (
                  <div className="w-full max-w-md flex flex-col items-center py-2 h-full">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                      <Users size={20} className="text-[#00F0FF]" />
                      <h2 className="font-sans font-bold tracking-tight text-xl text-white uppercase">
                        Nexkey Multiplayer Sync
                      </h2>
                    </div>
                    <p className="font-mono text-[10px] text-[#00FF41]/60 mb-4 uppercase">
                      Quantum Matchmaking & Private Grid Sectors
                    </p>

                    {/* Hosts left notification message */}
                    {hostLeftMessage && (
                      <div className="w-full py-2 px-3 mb-3 bg-red-950/40 border border-red-500/30 rounded text-red-400 font-mono text-[11px] animate-pulse">
                        {hostLeftMessage}
                      </div>
                    )}

                    {/* Quick play action */}
                    <button
                      onClick={handleRandomMatch}
                      disabled={isQueuing}
                      className="w-full py-3 mb-4 rounded bg-gradient-to-r from-cyan-950 to-blue-900/60 border border-[#00F0FF]/40 text-[#00F0FF] font-mono text-xs uppercase tracking-wider font-bold transition-all hover:border-[#00F0FF] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isQueuing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin" />
                          Queuing Matchmaker Matrix...
                        </>
                      ) : (
                        <>
                          <Trophy size={14} />
                          Random Match (Quick Play)
                        </>
                      )}
                    </button>

                    <div className="w-full flex items-center justify-between border-b border-[#00FF41]/10 pb-1 mb-2">
                      <span className="font-mono text-xs text-[#00FF41]/60 uppercase tracking-widest font-bold">
                        Private Room Decryption
                      </span>
                      <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="flex items-center gap-1 font-mono text-[10px] text-[#00F0FF] uppercase border border-[#00F0FF]/25 px-2 py-0.5 rounded hover:bg-[#00F0FF]/10 transition-all"
                      >
                        <Plus size={10} /> Create Room
                      </button>
                    </div>

                    {/* Create Room Form */}
                    {showCreateForm ? (
                      <form onSubmit={handleCreateRoom} className="w-full p-3 bg-black border border-[#00FF41]/25 rounded space-y-3 mb-4">
                        <div className="text-left font-mono text-[10px] text-[#00FF41]/50 uppercase tracking-wider">
                          New Room Protocol parameters:
                        </div>
                        {createError && (
                          <div className="text-left font-mono text-[10px] text-red-500">{createError}</div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            required
                            type="text"
                            placeholder="NAMA ROOM"
                            value={roomNameInput}
                            onChange={(e) => setRoomNameInput(e.target.value.substring(0, 15))}
                            className="bg-black text-[11px] font-mono border border-[#00FF41]/20 rounded p-1.5 text-white focus:outline-none focus:border-[#00FF41]"
                          />
                          <input
                            disabled={!isPrivateInput}
                            type="password"
                            placeholder="PASSWORD"
                            value={roomPasswordInput}
                            onChange={(e) => setRoomPasswordInput(e.target.value.substring(0, 10))}
                            className="bg-black text-[11px] font-mono border border-[#00FF41]/20 rounded p-1.5 text-white focus:outline-none focus:border-[#00FF41] disabled:opacity-30"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-1.5 text-white/70 font-mono text-[11px] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isPrivateInput}
                              onChange={(e) => setIsPrivateInput(e.target.checked)}
                              className="accent-[#00FF41]"
                            />
                            Apply private shield password
                          </label>
                          <button
                            type="submit"
                            className="px-3 py-1 bg-black border border-[#00F0FF]/50 text-[#00F0FF] font-mono text-[10px] uppercase rounded hover:bg-[#00F0FF]/20 cursor-pointer"
                          >
                            Establish
                          </button>
                        </div>
                      </form>
                    ) : null}

                    {/* Room join selection grid */}
                    <div className="w-full flex-1 overflow-y-auto min-h-[160px] max-h-[220px] pr-1 scrollbar-thin">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest font-semibold flex items-center gap-1">
                          Browse active sectors ({roomsList.length})
                        </span>
                        <button
                          onClick={fetchRooms}
                          disabled={isRefreshingRooms}
                          className="p-1 bg-black text-[#00FF41]/70 border border-[#00FF41]/10 hover:border-[#00FF41] rounded disabled:opacity-40"
                          title="Refresh Lobby Grid"
                        >
                          <RefreshCw size={10} className={isRefreshingRooms ? "animate-spin" : ""} />
                        </button>
                      </div>

                      {roomsList.length === 0 ? (
                        <div className="w-full py-8 border border-white/[0.04] bg-black/40 rounded flex flex-col items-center justify-center font-mono text-white/40 text-[11px]">
                          <div>NO WAITING ROOMS DETECTED</div>
                          <div className="text-[9px] text-[#00FF41]/40 mt-1 uppercase">Be the pioneer and establish a new sector above!</div>
                        </div>
                      ) : (
                        <div className="space-y-1.5 w-full">
                          {roomsList.map((room) => {
                            const isFullStatus = room.status === 'full' || room.player2_id;
                            return (
                              <div
                                key={room.id}
                                className="w-full px-3 py-2 bg-black hover:bg-white/[0.02] border border-white/[0.06] rounded flex items-center justify-between gap-2 transition-all"
                              >
                                <div className="text-left font-mono min-w-0 flex-1">
                                  <div className="flex items-center gap-1 text-[12px] font-bold text-[#00F0FF] truncate">
                                    {room.isPrivate ? <Lock size={10} className="text-yellow-500 inline shrink-0" /> : <Unlock size={10} className="text-green-500 inline shrink-0" />}
                                    {room.roomName}
                                  </div>
                                  <div className="text-[9px] text-white/40 truncate">
                                    Host: {room.player1_username} (Lvl {room.player1_level})
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="font-mono text-[10px] text-[#00FF41]/80">
                                    {isFullStatus ? "2/2 FULL" : "1/2 OPEN"}
                                  </span>
                                  <button
                                    disabled={isFullStatus}
                                    onClick={() => {
                                      if (room.isPrivate) {
                                        setJoiningRoom(room);
                                        setJoinPassword('');
                                        setJoinError('');
                                      } else {
                                        handleJoinRoom(room);
                                      }
                                    }}
                                    className={`px-3 py-1 font-mono text-[10px] uppercase font-bold rounded transition-all cursor-pointer ${
                                      isFullStatus
                                        ? "bg-white/[0.04] text-white/20 border border-white/[0.05]"
                                        : "bg-black border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/10"
                                    }`}
                                  >
                                    Join
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Join Password Dialog Modal Overlay inside main viewport */}
                    {joiningRoom && (
                      <div className="absolute inset-0 bg-black/98 z-20 flex flex-col items-center justify-center p-6 animate-fade-in font-mono">
                        <Lock size={32} className="text-yellow-500 mb-3 animate-pulse" />
                        <div className="text-sm font-bold text-white uppercase mb-1">
                          Private Encryption Key Required
                        </div>
                        <div className="text-[10px] text-[#00FF41]/60 mb-4">
                          Enter credentials for: <span className="text-[#00F0FF]">{joiningRoom.roomName}</span>
                        </div>

                        {joinError && (
                          <div className="text-red-500 text-[10px] mb-3 uppercase font-bold">{joinError}</div>
                        )}

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleJoinRoom(joiningRoom, joinPassword);
                          }}
                          className="w-full max-w-xs space-y-3"
                        >
                          <input
                            required
                            type="password"
                            placeholder="PASSWORD"
                            value={joinPassword}
                            onChange={(e) => setJoinPassword(e.target.value)}
                            className="w-full bg-black text-center text-xs font-mono border border-[#00FF41]/40 rounded p-2 text-white focus:outline-none focus:border-[#00FF41]"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setJoiningRoom(null)}
                              className="flex-1 py-1.5 border border-red-500/30 text-red-400 text-[10px] uppercase rounded hover:bg-red-950/20"
                            >
                              Abort
                            </button>
                            <button
                              type="submit"
                              className="flex-1 py-1.5 border border-[#00FF41]/50 bg-[#00FF41]/10 text-[#00FF41] text-[10px] uppercase font-bold rounded hover:bg-[#00FF41]/20"
                            >
                              Decrypt
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                ) : (
                  /* LOBBY ACTIVE ROOM VIEW */
                  <div className="w-full max-w-md flex flex-col items-center justify-between h-full py-4 font-mono">
                    {/* Top Room Name */}
                    <div className="w-full text-center">
                      <div className="text-[9px] text-[#00FF41] uppercase animate-pulse">LOBBY TERMINAL ESTABLISHED</div>
                      <h3 className="text-xl font-bold uppercase tracking-wide text-[#00F0FF] mt-0.5">
                        {liveRoomState?.roomName || currentRoom?.roomName || "SECTOR MATRIX"}
                      </h3>
                      <div className="inline-block px-2.5 py-0.5 rounded border border-[#00FF41]/10 bg-black/60 text-[8px] text-white/40 mt-1 uppercase">
                        Skin: {liveRoomState?.boardSkin || "Neon Arena Grid"}
                      </div>
                    </div>

                    {/* Dual player profiles */}
                    <div className="w-full grid grid-cols-2 gap-4 my-4">
                      {/* Host */}
                      <div className="p-3 bg-black/40 border border-white/[0.04] rounded flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full border border-[#00F0FF]/30 select-none flex items-center justify-center text-[#00F0FF] mb-2 font-bold text-sm bg-cyan-950/20">
                          P1
                        </div>
                        <div className="text-[12px] font-bold text-white max-w-full truncate">
                          {liveRoomState?.player1?.username || "Host Player"}
                        </div>
                        <div className="text-[9px] text-white/40 mt-0.5">
                          Lvl {liveRoomState?.player1?.level || 1} Exp
                        </div>

                        <div className="mt-3">
                          <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-widest ${
                            liveRoomState?.player1?.ready
                              ? "border border-[#00FF41]/40 bg-[#00FF41]/10 text-[#00FF41]"
                              : "border border-red-500/20 bg-red-950/10 text-red-400"
                          }`}>
                            {liveRoomState?.player1?.ready ? "READY" : "NOT READY"}
                          </span>
                        </div>
                      </div>

                      {/* Opponent Guest */}
                      <div className="p-3 bg-black/40 border border-white/[0.04] rounded flex flex-col items-center">
                        {liveRoomState?.player2 ? (
                          <>
                            <div className="w-10 h-10 rounded-full border border-green-500/30 select-none flex items-center justify-center text-[#00FF41] mb-2 font-bold text-sm bg-green-950/20">
                              P2
                            </div>
                            <div className="text-[12px] font-bold text-white max-w-full truncate">
                              {liveRoomState.player2.username}
                            </div>
                            <div className="text-[9px] text-white/40 mt-0.5">
                              Lvl {liveRoomState.player2.level} Exp
                            </div>

                            <div className="mt-3">
                              <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-widest ${
                                liveRoomState.player2.ready
                                  ? "border border-[#00FF41]/40 bg-[#00FF41]/10 text-[#00FF41]"
                                  : "border border-red-500/20 bg-red-950/10 text-red-400"
                              }`}>
                                {liveRoomState.player2.ready ? "READY" : "NOT READY"}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center py-6">
                            <div className="w-5 h-5 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin mb-2" />
                            <span className="text-[9px] text-white/30 uppercase tracking-widest animate-pulse">
                              WAITING...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions and Controls */}
                    <div className="w-full space-y-2">
                      <button
                        onClick={handleToggleReady}
                        disabled={!liveRoomState?.player2}
                        className={`w-full py-3 rounded font-mono text-xs uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                          !liveRoomState?.player2
                            ? "bg-white/[0.02] text-white/20 border border-white/[0.05] cursor-not-allowed"
                            : lobbyReady
                            ? "border border-[#00FF41] bg-[#00FF41]/20 text-white shadow-[0_0_15px_rgba(0,255,65,0.25)] hover:scale-[1.01] active:scale-[0.99]"
                            : "border border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:bg-[#00F0FF]/25 hover:scale-[1.01] active:scale-[0.99]"
                        }`}
                      >
                        {lobbyReady ? "✓ INDUCTION CONFIRMED" : "⚡ SELECT READY PROTOCOL"}
                      </button>

                      <button
                        onClick={handleLeaveLobby}
                        className="w-full py-2 bg-black hover:bg-neutral-900 border border-red-500/25 text-red-400 font-mono text-[10px] uppercase rounded transition-all cursor-pointer"
                      >
                        Dismantle Session & Return
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="absolute bottom-3 neon-text-green font-mono text-[9px] uppercase tracking-wider font-bold" id="lobby-footer-credits">
              credits by Zidandev
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="relative">
            {/* E-Sports Strict Match Timer Display */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/85 backdrop-blur-md border border-fuchsia-500/25 px-4 py-1.5 rounded-full z-10 flex items-center justify-center gap-2 pointer-events-none shadow-[0_0_15px_rgba(236,72,153,0.25)] select-none">
              <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
              <span className="font-mono text-[9px] text-fuchsia-400 font-bold uppercase tracking-widest">
                TIME LIMIT:
              </span>
              <span className="font-mono text-xs text-white font-bold tracking-wider">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Interactive Neon-Matrix AI Dialogue Overlay Modal */}
            {isDialogueOpen && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-[6px] z-20 flex items-center justify-center p-4">
                <div className="w-full max-w-sm bg-neutral-950 border border-fuchsia-500/30 rounded p-5 shadow-[0_0_20px_rgba(236,72,153,0.3)] text-left">
                  {/* Neon Matrix Transmission Header */}
                  <div className="flex items-center gap-2 border-b border-fuchsia-500/10 pb-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></div>
                    <span className="font-mono text-[8px] uppercase tracking-widest text-fuchsia-400 font-semibold">
                      MATRIX CHAT TRANCH // PHASE {dialoguePhase}
                    </span>
                  </div>

                  {/* Opponent cognitive identifier */}
                  <div className="mb-3">
                    <span className="font-mono text-[8px] uppercase tracking-widest text-[#00ff66] bg-[#00ff66]/10 px-2 py-0.5 rounded">
                      SYSTEM OPPONENT ACTIVE
                    </span>
                  </div>

                  {/* Character Monologue Bubbles */}
                  <div className="bg-black/90 border border-fuchsia-500/15 rounded p-3 mb-3 min-h-[75px] flex items-center">
                    {isAiLoading ? (
                      <div className="flex flex-col items-center justify-center w-full gap-2">
                        <div className="w-4 h-4 border border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-mono text-[7px] text-fuchsia-400/50 uppercase tracking-widest">
                          Incoming matrix dialect...
                        </span>
                      </div>
                    ) : (
                      <p className="font-mono text-xs text-neutral-200 leading-relaxed">
                        {dialogueText}
                      </p>
                    )}
                  </div>

                  {/* Reaction Phase Options */}
                  {dialoguePhase === 1 && (
                    <div className="flex flex-col gap-1.5">
                      <p className="font-mono text-[8px] text-neutral-400 uppercase tracking-wide">
                        Draft your mental pressure bypass:
                      </p>
                      <input
                        type="text"
                        value={playerReplyInput}
                        onChange={(e) => setPlayerReplyInput(e.target.value)}
                        placeholder="Type reply... (e.g. 'Lucky shot!', 'I will win!')"
                        disabled={isAiLoading}
                        className="w-full bg-black border border-fuchsia-500/25 rounded px-2.5 py-1.5 text-neutral-200 font-mono text-[10px] focus:outline-none focus:border-fuchsia-400 focus:shadow-[0_0_8px_rgba(236,72,153,0.3)] transition-all"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && playerReplyInput.trim() && !isAiLoading) {
                            handleSendPlayerReply();
                          }
                        }}
                      />
                      <button
                        onClick={handleSendPlayerReply}
                        disabled={!playerReplyInput.trim() || isAiLoading}
                        className="mt-1 w-full py-1.5 bg-fuchsia-500/10 hover:bg-fuchsia-500 text-fuchsia-400 hover:text-white border border-fuchsia-500/40 rounded font-mono text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer disabled:opacity-40"
                      >
                        Send Transmission
                      </button>
                    </div>
                  )}

                  {dialoguePhase === 3 && (
                    <button
                      onClick={handleResumeGameAndCloseDialogue}
                      disabled={isAiLoading}
                      className="w-full py-1.5 bg-[#00ff66]/10 hover:bg-[#00ff66] text-[#00ff66] hover:text-black border border-[#00ff66]/40 rounded font-mono text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer"
                    >
                      Bypass Matrix & Resume
                    </button>
                  )}
                </div>
              </div>
            )}

            <canvas
              ref={canvasRef}
              width={arenaWidth}
              height={arenaHeight}
              className="block max-w-full bg-black cursor-crosshair rounded"
              id="air-hockey-arena-canvas"
            />
          </div>
        )}

        {gameState === 'gameover' && endSummary && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-10 flex flex-col items-center justify-start py-8 px-4 text-center animate-fade-in overflow-y-auto max-h-full" id="game-over-modal-view">
            <div className={`w-16 h-16 rounded-full border flex items-center justify-center shadow-lg mb-4 ${
              endSummary.isDraw
                ? 'bg-black border-yellow-500/50 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.25)]'
                : endSummary.win 
                ? 'bg-black border-[#00FF41]/50 text-[#00FF41] shadow-[0_0_20px_rgba(0,255,65,0.25)]' 
                : 'bg-black border-red-500/50 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
            }`}>
              <ShieldAlert size={32} />
            </div>

            <span className="font-mono text-xs text-white/40 uppercase tracking-widest block mb-1">
              Battle Synapses Finished
            </span>
            <h2 className="font-sans font-bold text-3xl uppercase tracking-tighter" id="game-over-match-status-title">
              {endSummary.isDraw ? (
                <span className="text-yellow-400 font-extrabold text-shadow">
                  Match Drawn!
                </span>
              ) : endSummary.win ? (
                <span className="neon-text-green drop-shadow font-extrabold text-shadow">
                  Victory Achieved!
                </span>
              ) : (
                <span className="text-red-500 font-extrabold text-shadow">
                  Sub-Grid Override
                </span>
              )}
            </h2>

            {/* Scoreboard summary */}
            <div className="flex items-center gap-6 mt-4 mb-4 px-8 py-2.5 glass-panel border-[#00FF41]/25 rounded-lg font-mono" id="scoreboard-modal-summary">
              <div>
                <span className="text-[10px] text-white/40 uppercase block">Your Score</span>
                <span className="text-2xl font-bold neon-text-cyan">{endSummary.scoreSelf}</span>
              </div>
              <div className="text-[#00FF41]/50 text-lg font-bold">:</div>
              <div>
                <span className="text-[10px] text-white/40 uppercase block">Opponent</span>
                <span className="text-2xl font-bold text-white/70">{endSummary.scoreOpponent}</span>
              </div>
            </div>

            {/* E-Sports Telemetry Metrics Section */}
            <div className="w-full max-w-md bg-black/60 border border-[#00FF41]/10 rounded-lg p-3 my-2 cursor-default select-none" id="telemetry-dashboard-panel">
              <span className="font-mono text-[10px] uppercase font-bold text-[#BF00FF] tracking-widest block mb-2 border-b border-white/[0.04] pb-1 text-center">
                📡 SYNERGY MATRIX TELEMETRY & PLAYSTYLE SPECS
              </span>
              <div className="flex flex-col min-[420px]:flex-row items-center justify-center min-[420px]:justify-around gap-4 min-[420px]:gap-2">
                
                {/* Heatmap Area */}
                <div className="flex flex-col items-center shrink-0">
                  <span className="font-mono text-[8px] text-[#00F0FF] uppercase mb-1 tracking-wider">PADDLE HEATMAP</span>
                  <div className="relative border border-[#00FF41]/20 bg-black rounded p-0.5 overflow-hidden shadow-[0_0_10px_rgba(0,255,65,0.05)]">
                    <canvas id="heatmap-canvas" width={110} height={146} className="block rounded bg-[#060609]" />
                    <div className="absolute top-1 left-1 text-[6px] font-mono text-white/30 uppercase">Mini board</div>
                  </div>
                </div>

                {/* Radar Chart Area */}
                <div className="flex flex-col items-center select-none">
                  <span className="font-mono text-[8px] text-[#BF00FF] uppercase mb-1 tracking-wider font-semibold">PLAYSTYLE ANALYZER</span>
                  <div className="relative w-[150px] h-[150px] overflow-hidden">
                    <canvas id="radar-canvas" className="w-full h-full block" />
                  </div>
                </div>

              </div>
            </div>

            {/* Progress indicators */}
            <div className="w-full max-w-xs mt-1 space-y-2 font-mono text-xs text-left text-[#00FF41]/80 cursor-default" id="match-over-payouts-panel">
              <div className="flex justify-between border-b border-[#00FF41]/10 pb-1">
                <span>Battle Status:</span>
                <span className={endSummary.win ? 'neon-text-green font-bold text-[11px]' : 'text-white/40 text-[11px]'}>
                  {endSummary.win ? 'MATCH WINNER' : 'DEFEATED'}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#00FF41]/10 pb-1">
                <span>EXP Synapsed:</span>
                <span className="neon-text-purple font-bold">+{endSummary.win ? 40 : 15} EXP</span>
              </div>
              <div className="flex justify-between border-b border-[#00FF41]/10 pb-1">
                <span>Cyber Credits:</span>
                <span className="neon-text-green font-bold">+{endSummary.win ? 50 : 15} NEX</span>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={gameMode === 'ai' ? handleStartAiGame : onExit}
                id="btn-match-replay"
                className="px-6 py-3 neon-border-cyan bg-[#00F0FF]/15 text-[#00F0FF] hover:bg-[#00F0FF]/25 font-mono text-xs uppercase font-bold tracking-widest cursor-pointer rounded transition-all"
              >
                {gameMode === 'ai' ? 'Replay Match' : 'Return lobby'}
              </button>
              <button
                onClick={onExit}
                id="btn-match-exit"
                className="px-6 py-3 bg-black hover:bg-black/80 border border-red-500/30 text-red-400 font-mono text-xs uppercase font-bold tracking-widest cursor-pointer rounded transition-all"
              >
                Exit Main
              </button>
            </div>

            <div className="absolute bottom-6 neon-text-green font-mono text-[10px] uppercase tracking-wider font-bold" id="game-over-footer-credits">
              credits by Zidandev
            </div>
          </div>
        )}
      </div>

      {/* GLOWING NEON CYBERPUNK SETTINGS OVERLAY DIALOG */}
      {settingsModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" id="settings-modal-overlay">
          <div className="w-full max-w-sm bg-black border border-[#00ff66]/45 shadow-[0_0_30px_rgba(0,255,102,0.15)] rounded p-6 font-mono text-white">
            <div className="flex items-center justify-between mb-6 border-b border-[#00ff66]/20 pb-4">
              <h3 className="font-sans font-bold text-lg uppercase tracking-wider text-[#00ff66] flex items-center gap-2">
                <Settings className="text-[#00ff66] animate-pulse" size={18} /> {t.settings}
              </h3>
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="text-white/60 hover:text-white border border-white/20 hover:border-white/60 px-2 py-0.5 text-xs rounded uppercase font-bold"
              >
                Close
              </button>
            </div>

            {/* Language Selection Selection */}
            <div className="mb-5 text-left">
              <label className="block text-[10px] uppercase text-[#00ff66] mb-1.5 font-bold tracking-wider">{t.language}</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full bg-black border border-[#00ff66]/30 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00ff66] cursor-pointer rounded uppercase font-bold"
              >
                <option value="en">English (US)</option>
                <option value="id">Bahasa Indonesia</option>
              </select>
            </div>

            {/* Audio Section Section */}
            <div className="mb-5 space-y-4 text-left">
              <h4 className="text-[10px] uppercase text-white/40 font-bold border-b border-white/5 pb-1 tracking-wider">{t.audioSettings}</h4>
              
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold">Audio Muted</span>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, muted: !prev.muted }))}
                  className={`px-3 py-1 font-bold uppercase text-[10px] rounded border transition-all ${
                    settings.muted
                      ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : 'bg-[#00ff66]/20 text-[#00ff66] border-[#00ff66]/40'
                  }`}
                >
                  {settings.muted ? 'ON' : 'OFF'}
                </button>
              </div>

              <div>
                <div className="flex justify-between text-[10px] uppercase mb-1 font-bold">
                  <span>{t.bgmVolume}</span>
                  <span>{Math.round(settings.bgmVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.bgmVolume}
                  onChange={(e) => setSettings(prev => ({ ...prev, bgmVolume: parseFloat(e.target.value) }))}
                  className="w-full accent-[#00ff66] cursor-pointer bg-slate-900 h-1 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] uppercase mb-1 font-bold">
                  <span>{t.sfxVolume}</span>
                  <span>{Math.round(settings.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => setSettings(prev => ({ ...prev, sfxVolume: parseFloat(e.target.value) }))}
                  className="w-full accent-[#00ff66] cursor-pointer bg-slate-900 h-1 rounded-lg"
                />
              </div>
            </div>

            {/* Graphics Section Section */}
            <div className="mb-6 text-left">
              <label className="block text-[10px] uppercase text-[#00ff66] mb-1.5 font-bold tracking-wider">{t.graphicsQuality}</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setSettings(prev => ({ ...prev, graphicsQuality: q }))}
                    className={`py-1.5 text-[9px] uppercase font-bold border transition-all rounded ${
                      settings.graphicsQuality === q
                        ? 'bg-[#00ff66]/30 text-[#00ff66] border-[#00ff66] shadow-[0_0_10px_rgba(0,255,102,0.2)]'
                        : 'bg-black border-white/20 text-white/60 hover:border-white/40'
                    }`}
                  >
                    {q === 'low' ? 'LOW' : q === 'medium' ? 'MED' : 'HIGH'}
                  </button>
                ))}
              </div>
              <p className="text-white/40 text-[9px] mt-2 leading-relaxed uppercase">
                {settings.graphicsQuality === 'low' && t.low}
                {settings.graphicsQuality === 'medium' && t.med}
                {settings.graphicsQuality === 'high' && t.high}
              </p>
            </div>

            {/* Save Button */}
            <button
              onClick={() => setSettingsModalOpen(false)}
              className="w-full py-2 bg-[#00ff66] hover:bg-[#00ff66]/85 text-black font-sans font-extrabold uppercase text-xs cursor-pointer rounded transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Check size={14} /> {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
