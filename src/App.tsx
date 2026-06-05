import React, { useEffect, useState } from 'react';
import { User, UserRole, ShopItem, PlayerStats, MatchHistory } from './types';
import MatrixBackground from './components/MatrixBackground';
import AirHockeyGame from './components/AirHockeyGame';
import InGameShop from './components/InGameShop';
import AdminDashboard from './components/AdminDashboard';
import ProfileView from './components/ProfileView';
import LandingView from './components/LandingView';
import { Play, Users, ShoppingBag, UserCircle2, Terminal, Shield, Coins, Sparkles, LogOut, Code, Gamepad2, ShieldAlert, Menu, X, Settings } from 'lucide-react';

export default function App() {
  // Navigation states: 'menu', 'game_ai', 'game_multiplayer', 'shop', 'admin', 'profile'
  const [currentView, setCurrentView] = useState<'menu' | 'game_ai' | 'game_multiplayer' | 'shop' | 'admin' | 'profile'>('menu');
  
  // Responsive sidebar and global settings state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [globalSettingsModalOpen, setGlobalSettingsModalOpen] = useState(false);
  
  const [sysSettings, setSysSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('nexkey_game_settings');
      return saved ? JSON.parse(saved) : {
        language: 'en',
        muted: false,
        bgmVolume: 0.5,
        sfxVolume: 0.7,
        graphicsQuality: 'high'
      };
    } catch {
      return {
        language: 'en',
        muted: false,
        bgmVolume: 0.5,
        sfxVolume: 0.7,
        graphicsQuality: 'high'
      };
    }
  });

  const updateSysSettings = (newSettings: any) => {
    const updated = { ...sysSettings, ...newSettings };
    setSysSettings(updated);
    localStorage.setItem('nexkey_game_settings', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };
  
  // Auth state
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [availableProfiles, setAvailableProfiles] = useState<User[]>([]);
  const [inventory, setInventory] = useState<string[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);

  // Register state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Sync Websocket URL dynamically relative to APP_URL
  const getSocketUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  };

  // Sync user status and details from database
  const refreshUserSession = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      if (data.success) {
        setActiveUser(data.user);
        setPlayerStats(data.stats);
        setInventory(data.inventory);
        setMatchHistory(data.history);
      }
    } catch (err) {
      console.error('Error synchronizing user details inside frame:', err);
    }
  };

  // Fetch profiles collection
  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/auth/profiles');
      const data = await res.json();
      if (data.success) {
        setAvailableProfiles(data.users);
      }
    } catch (err) {
      console.error('Error loading default matrices profiles:', err);
    }
  };

  // Fetch shop catalog items
  const fetchShopItems = async () => {
    try {
      const res = await fetch('/api/shop/items');
      const data = await res.json();
      if (data.success) {
        setShopItems(data.items);
      }
    } catch (err) {
      console.error('Field shop item syncing failed:', err);
    }
  };

  useEffect(() => {
    fetchProfiles();
    fetchShopItems();
  }, []);

  const handleSelectUser = (user: User) => {
    setActiveUser(user);
    refreshUserSession(user.id);
  };

  // Handle registration submissions
  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regUsername.trim()) {
      setRegError('Username required to compile profile.');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regUsername, email: regEmail })
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setRegUsername('');
        setRegEmail('');
        setActiveUser(data.user);
        refreshUserSession(data.user.id);
        fetchProfiles();
      } else {
        setRegError(data.error || 'Server rejected profile.');
      }
    } catch (err) {
      setRegError('Failed registration sync.');
    }
  };

  const handleRegisterInline = async (username: string, email: string) => {
    setRegError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email })
      });
      const data = await res.json();
      if (data.success) {
        setActiveUser(data.user);
        refreshUserSession(data.user.id);
        fetchProfiles();
        return true;
      } else {
        setRegError(data.error || 'Server rejected profile.');
        return false;
      }
    } catch (err) {
      setRegError('Failed registration sync.');
      return false;
    }
  };

  // Action: Buy skin
  const handlePurchaseItem = async (itemId: string) => {
    if (!activeUser) return;
    const res = await fetch('/api/shop/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: activeUser.id, itemId })
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to complete skin transaction');
    }
    setActiveUser(data.user);
    setInventory(data.inventory);
  };

  // Action: Equip skin
  const handleEquipItem = async (itemId: string) => {
    if (!activeUser) return;
    const res = await fetch('/api/shop/equip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: activeUser.id, itemId })
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to map equipment attributes');
    }
    setActiveUser(data.user);
  };

  // Action: Match completed
  const handleMatchCompleted = async (win: boolean, scoreSelf: number, scoreOpponent: number) => {
    if (!activeUser) return;

    // Award payouts based on win status
    const expReward = win ? 40 : 15;
    const currencyReward = win ? 50 : 15;

    try {
      await fetch('/api/match/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeUser.id,
          opponentName: currentView === 'game_ai' ? 'AI (Predictive)' : 'Net Players',
          mode: currentView === 'game_ai' ? 'ai' : 'multiplayer',
          playerRank: win ? 'win' : 'loss',
          scoreSelf,
          scoreOpponent,
          expEarned: expReward,
          currencyEarned: currencyReward
        })
      });

      // Reload player values
      refreshUserSession(activeUser.id);
    } catch (err) {
      console.error('Failed to commit match histories:', err);
    }
  };

  const currentLevelPercent = activeUser 
    ? Math.round((activeUser.exp / activeUser.maxExp) * 100) 
    : 0;

  return (
    <main className="min-h-screen bg-[#050505] text-[#00FF41] flex flex-col justify-between overflow-x-hidden relative font-mono" id="nexkey-prime-app">
      {/* Decorative Rain Atmosphere */}
      <MatrixBackground />

      {/* SIDEBAR NAVIGATION - ACTIVE ONLY WHEN USER LOGGED IN AND NOT BANNED */}
      {activeUser && !activeUser.isBanned && (
        <>
          {/* Backdrop Overlay to Close Mobile Slide-in Sidebar */}
          {isMobileSidebarOpen && (
            <div 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
            />
          )}

          {/* 1. DESKTOP PERMANENT PINNED SIDEBAR */}
          <aside className="hidden lg:flex flex-col w-72 h-screen fixed top-0 left-0 border-r border-[#00FF41]/20 bg-black/90 backdrop-blur-md p-6 z-40 justify-between select-none shadow-[0_0_15px_rgba(0,255,65,0.05)]" id="desktop-sidebar">
            <div className="flex flex-col gap-6">
              {/* Game Title with Neon Pulse */}
              <div 
                onClick={() => setCurrentView('menu')}
                className="text-3xl font-black tracking-tighter cursor-pointer text-center select-none"
              >
                <span className="neon-text-cyan animate-pulse">NEXKEY</span><span className="text-white opacity-50">.OS</span>
              </div>

              {/* Profile Card */}
              <div className="bg-black/60 border border-[#00FF41]/25 p-4 rounded-lg flex flex-col gap-3 shadow-[0_0_10px_rgba(0,255,65,0.02)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00FF41]/10 border border-[#00FF41]/40 flex items-center justify-center text-[#00FF41] font-bold text-sm">
                    {activeUser.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] text-white/40 uppercase tracking-widest leading-none mb-1">Grid Operator</span>
                    <span className="font-bold text-sm text-white truncate text-[#00F0FF]">{activeUser.username}</span>
                  </div>
                </div>

                {/* Level status */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-white/40 uppercase font-semibold">LEVEL {activeUser.level}</span>
                    <span className="text-[#BF00FF] font-bold">{currentLevelPercent}% EXP</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-950 border border-white/[0.04] rounded-full overflow-hidden mt-1 relative">
                    <div 
                      className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#BF00FF] to-[#00F0FF] shadow-[0_0_8px_#BF00FF] rounded-full transition-all duration-500" 
                      style={{ width: `${currentLevelPercent}%` }}
                    />
                  </div>
                </div>

                {/* Account Balances */}
                <div className="flex justify-between items-center border-t border-white/[0.04] pt-2 pb-1 text-xs">
                  <span className="text-[10px] text-white/40 uppercase">METRIC CREDITS</span>
                  <span className="font-bold text-[#00FF41] flex items-center gap-1">
                    <Coins size={12} className="text-[#00FF41]" /> {activeUser.currency} NEX
                  </span>
                </div>

                {/* Quick Profile Swapping */}
                <div className="flex flex-col gap-1 border-t border-white/[0.04] pt-2">
                  <label className="text-[9px] text-[#00FF41]/50 uppercase tracking-wider block">ID Synapse Swap</label>
                  <select
                    value={activeUser.id}
                    onChange={(e) => {
                      const target = availableProfiles.find(u => u.id === e.target.value);
                      if (target) handleSelectUser(target);
                    }}
                    className="w-full bg-[#0a0a0c] border border-[#00FF41]/20 hover:border-[#00FF41]/40 text-[#00FF41] font-mono text-[11px] px-2 py-1.5 rounded focus:outline-none focus:border-[#00F0FF] cursor-pointer transition-all"
                  >
                    {availableProfiles.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#0f0f12] text-[#00FF41]">
                        {p.username} ({p.role === UserRole.ADMIN ? 'Admin' : 'Player'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Navigation Stack */}
              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => setCurrentView('menu')}
                  className={`w-full py-2.5 px-3 rounded-lg flex items-center gap-3 transition-all duration-200 text-left cursor-pointer text-xs font-bold uppercase tracking-wider ${
                    currentView === 'menu' || currentView === 'game_ai' || currentView === 'game_multiplayer'
                      ? 'bg-[#00FF41]/10 text-white border border-[#00FF41]/50 shadow-[0_0_12px_rgba(0,255,65,0.1)]'
                      : 'text-[#00FF41]/75 hover:text-[#00FF41] hover:bg-white/[0.02] border border-transparent'
                  }`}
                >
                  <Play size={15} />
                  <span>Play Hockey</span>
                </button>

                <button
                  onClick={() => setCurrentView('shop')}
                  className={`w-full py-2.5 px-3 rounded-lg flex items-center gap-3 transition-all duration-200 text-left cursor-pointer text-xs font-bold uppercase tracking-wider ${
                    currentView === 'shop'
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/50 shadow-[0_0_12px_rgba(234,179,8,0.1)]'
                      : 'text-[#00FF41]/75 hover:text-yellow-400 hover:bg-white/[0.02] border border-transparent'
                  }`}
                >
                  <ShoppingBag size={15} />
                  <span>Exchange Shop</span>
                </button>

                <button
                  onClick={() => setCurrentView('profile')}
                  className={`w-full py-2.5 px-3 rounded-lg flex items-center gap-3 transition-all duration-200 text-left cursor-pointer text-xs font-bold uppercase tracking-wider ${
                    currentView === 'profile'
                      ? 'bg-[#BF00FF]/10 text-[#BF00FF] border border-[#BF00FF]/50 shadow-[0_0_12px_rgba(191,0,255,0.1)]'
                      : 'text-[#00FF41]/75 hover:text-[#BF00FF] hover:bg-white/[0.02] border border-transparent'
                  }`}
                >
                  <UserCircle2 size={15} />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => setGlobalSettingsModalOpen(true)}
                  className={`w-full py-2.5 px-3 rounded-lg flex items-center gap-3 transition-all duration-200 text-left cursor-pointer text-xs font-bold uppercase tracking-wider text-[#00FF41]/75 hover:text-white hover:bg-white/[0.02] border border-transparent`}
                >
                  <Settings size={15} />
                  <span>OS Settings</span>
                </button>

                {activeUser.role === UserRole.ADMIN && (
                  <button
                    onClick={() => setCurrentView('admin')}
                    className={`w-full py-2.5 px-3 rounded-lg flex items-center gap-3 transition-all duration-300 text-left cursor-pointer text-xs font-bold uppercase tracking-wider ${
                      currentView === 'admin'
                        ? 'bg-red-500/15 text-red-500 border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                        : 'text-red-400/80 hover:text-red-400 hover:bg-red-950/20 border border-transparent'
                    }`}
                  >
                    <Terminal size={15} />
                    <span>Admin Control</span>
                  </button>
                )}
              </nav>
            </div>

            {/* Logout Sync Option and dev credit */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  setActiveUser(null);
                  setCurrentView('menu');
                }}
                className="w-full py-2 px-3 border border-red-500/30 hover:border-red-500 bg-red-950/10 hover:bg-red-500/20 text-red-400 uppercase font-mono text-[10px] font-bold rounded cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut size={12} />
                <span>Disconnect Node</span>
              </button>

              <div className="text-center">
                <div className="neon-text-green font-bold text-[9px] tracking-widest uppercase">
                  credits by Zidandev
                </div>
                <div className="text-[7px] text-white/30 uppercase mt-0.5 tracking-wider">
                  Terminal Synapse v1.4.2
                </div>
              </div>
            </div>
          </aside>

          {/* 2. MOBILE COLLAPSIBLE SLIDE-IN SIDEBAR */}
          <aside 
            className={`lg:hidden fixed inset-y-0 left-0 w-72 h-screen z-50 border-r border-[#00FF41]/20 bg-black/95 backdrop-blur-lg p-6 flex flex-col justify-between select-none transition-transform duration-300 transform ${
              isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            id="mobile-sidebar"
          >
            <div className="flex flex-col gap-6">
              {/* Close Button & Brand Header info */}
              <div className="flex items-center justify-between">
                <div className="text-2xl font-black tracking-tighter">
                  <span className="neon-text-cyan">NEXKEY</span><span className="text-white opacity-40">.OS</span>
                </div>
                <button 
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 bg-black border border-white/10 hover:border-white/30 rounded text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Profile Card */}
              <div className="bg-black/80 border border-[#00FF41]/25 p-4 rounded-lg flex flex-col gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00FF41]/10 border border-[#00FF41]/40 flex items-center justify-center text-[#00FF41] font-bold text-sm">
                    {activeUser.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] text-white/40 uppercase tracking-widest leading-none mb-1">Mobile Synapse</span>
                    <span className="font-bold text-sm text-white truncate text-[#00F0FF]">{activeUser.username}</span>
                  </div>
                </div>

                {/* Level Status */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-white/40 uppercase font-semibold">LEVEL {activeUser.level}</span>
                    <span className="text-[#BF00FF] font-bold">{currentLevelPercent}% EXP</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-950 border border-white/[0.04] rounded-full overflow-hidden mt-1 relative">
                    <div 
                      className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#BF00FF] to-[#00F0FF] shadow-[0_0_8px_#BF00FF] rounded-full transition-all duration-500" 
                      style={{ width: `${currentLevelPercent}%` }}
                    />
                  </div>
                </div>

                {/* Wallet Balance Info */}
                <div className="flex justify-between items-center border-t border-white/[0.04] pt-2 pb-1 text-xs">
                  <span className="text-[10px] text-white/40 uppercase">METRIC CREDITS</span>
                  <span className="font-bold text-[#00FF41] flex items-center gap-1">
                    <Coins size={12} /> {activeUser.currency} NEX
                  </span>
                </div>

                {/* Switcher Dropdown */}
                <div className="flex flex-col gap-1 border-t border-white/[0.04] pt-2">
                  <label className="text-[9px] text-[#00FF41]/50 uppercase tracking-wider block">Synapse Swap Node</label>
                  <select
                    value={activeUser.id}
                    onChange={(e) => {
                      const target = availableProfiles.find(u => u.id === e.target.value);
                      if (target) {
                        handleSelectUser(target);
                        setIsMobileSidebarOpen(false);
                      }
                    }}
                    className="w-full bg-[#0a0a0c] border border-[#00FF41]/25 text-[#00FF41] font-mono text-[11px] px-2 py-1.5 rounded focus:outline-none focus:border-[#00F0FF] cursor-pointer"
                  >
                    {availableProfiles.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#0f0f12] text-[#00FF41]">
                        {p.username} ({p.role === UserRole.ADMIN ? 'Admin' : 'Player'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Navigation list selection */}
              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => { setCurrentView('menu'); setIsMobileSidebarOpen(false); }}
                  className={`w-full py-2.5 px-3 rounded-lg flex items-center gap-3 transition-all text-left cursor-pointer text-xs font-bold uppercase tracking-wider ${
                    currentView === 'menu' || currentView === 'game_ai' || currentView === 'game_multiplayer'
                      ? 'bg-[#00FF41]/15 text-white border border-[#00FF41]/50 shadow-[0_0_12px_rgba(0,255,65,0.1)]'
                      : 'text-[#00FF41]/75 hover:text-white hover:bg-white/[0.02] border border-transparent'
                  }`}
                >
                  <Play size={15} />
                  <span>Play Hockey</span>
                </button>

                <button
                  onClick={() => { setCurrentView('shop'); setIsMobileSidebarOpen(false); }}
                  className={`w-full py-2.5 px-3 rounded-lg flex items-center gap-3 transition-all text-left cursor-pointer text-xs font-bold uppercase tracking-wider ${
                    currentView === 'shop'
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/50 shadow-[0_0_12px_rgba(234,179,8,0.1)]'
                      : 'text-[#00FF41]/75 hover:text-yellow-400 hover:bg-white/[0.02] border border-transparent'
                  }`}
                >
                  <ShoppingBag size={15} />
                  <span>Exchange Shop</span>
                </button>

                <button
                  onClick={() => { setCurrentView('profile'); setIsMobileSidebarOpen(false); }}
                  className={`w-full py-2.5 px-3 rounded-lg flex items-center gap-3 transition-all text-left cursor-pointer text-xs font-bold uppercase tracking-wider ${
                    currentView === 'profile'
                      ? 'bg-[#BF00FF]/15 text-[#BF00FF] border border-[#BF00FF]/50 shadow-[0_0_12px_rgba(191,0,255,0.1)]'
                      : 'text-[#00FF41]/75 hover:text-[#BF00FF] hover:bg-white/[0.02] border border-transparent'
                  }`}
                >
                  <UserCircle2 size={15} />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => { setGlobalSettingsModalOpen(true); setIsMobileSidebarOpen(false); }}
                  className={`w-full py-2.5 px-3 rounded-lg flex items-center gap-3 transition-all text-left cursor-pointer text-xs font-bold uppercase tracking-wider text-[#00FF41]/75 hover:text-white hover:bg-white/[0.02] border border-transparent`}
                >
                  <Settings size={15} />
                  <span>OS Settings</span>
                </button>

                {activeUser.role === UserRole.ADMIN && (
                  <button
                    onClick={() => { setCurrentView('admin'); setIsMobileSidebarOpen(false); }}
                    className={`w-full py-2.5 px-3 rounded-lg flex items-center gap-3 transition-all text-left cursor-pointer text-xs font-bold uppercase tracking-wider ${
                      currentView === 'admin'
                        ? 'bg-red-500/15 text-red-500 border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                        : 'text-red-400 hover:text-red-400 hover:bg-red-950/20 border border-transparent'
                    }`}
                  >
                    <Terminal size={15} />
                    <span>Admin Control</span>
                  </button>
                )}
              </nav>
            </div>

            {/* Logout and dev credits footer inside collapsible menu */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  setActiveUser(null);
                  setCurrentView('menu');
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full py-2 px-3 border border-red-500/30 hover:border-red-500 bg-red-950/10 hover:bg-red-500/20 text-red-400 uppercase font-mono text-[10px] font-bold rounded cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut size={12} />
                <span>Disconnect Node</span>
              </button>

              <div className="text-center">
                <div className="neon-text-green font-bold text-[9px] tracking-widest uppercase">
                  credits by Zidandev
                </div>
                <div className="text-[7px] text-white/30 uppercase mt-0.5 tracking-wider">
                  Mobile Synapse v1.4.2
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* VIEWPORT LAYOUT WRAPPER */}
      {!activeUser ? (
        <>
          {/* Landing Screen Horizontal Header Selector */}
          <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-[#00FF41]/20 bg-black/90 glass-panel z-50 shrink-0" id="hud-header">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-black tracking-tighter neon-text-cyan select-none">
                NEXKEY<span className="text-white opacity-50">.OS</span>
              </div>
              <div className="h-6 w-px bg-[#00FF41]/30 hidden sm:block"></div>
              <div className="hidden sm:flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#00FF41]/60">System Status</span>
                <span className="text-xs neon-text-green font-bold">MULTI-SYNC: ACTIVE</span>
              </div>
            </div>
          </header>

          <section className="flex-1 flex items-center justify-center py-6 px-4 md:px-8 z-10" id="landing-screen-view">
            <LandingView
              profiles={availableProfiles}
              onLogin={handleSelectUser}
              onRegister={handleRegisterInline}
              regError={regError}
              setRegError={setRegError}
            />
          </section>

          <footer className="w-full h-12 bg-black border-t border-[#00FF41]/10 flex items-center justify-between px-8 text-[10px] tracking-[0.2em] uppercase text-[#00FF41]/60 font-mono z-40" id="global-footer">
            <div>Session: XH-992-004</div>
            <div className="neon-text-green font-bold">credits by Zidandev</div>
            <div className="hidden sm:block">Ver 1.4.2-STABLE</div>
          </footer>
        </>
      ) : activeUser.isBanned ? (
        <>
          <section className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20 z-10" id="blocked-ban-dossier">
            <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-500/40 text-red-500 flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.25)] mb-6 animate-bounce">
              <ShieldAlert size={36} />
            </div>
            <span className="font-mono text-xs text-red-500 uppercase tracking-widest block mb-1">Matrix Exclusion Protocol</span>
            <h1 className="font-sans font-black text-3xl uppercase text-white tracking-tight">Access Gate Overwritten</h1>
            <p className="font-mono text-xs text-zinc-400 max-w-md mt-3 leading-relaxed">
              Your user node (<span className="text-red-500 font-bold">{activeUser.username}</span>) has been quarantined under Admin sanctions. Banned statuses protect the central server grids integrity. Use the HUD profile switcher to switch accounts.
            </p>
            <div className="mt-8 font-mono text-[10px] text-[#00FF41]/50 uppercase tracking-wider">
              credits by Zidandev
            </div>
          </section>

          <footer className="w-full h-12 bg-black border-t border-[#00FF41]/10 flex items-center justify-between px-8 text-[10px] tracking-[0.2em] uppercase text-[#00FF41]/60 font-mono z-40" id="global-footer">
            <div>Session: XH-992-004</div>
            <div className="neon-text-green font-bold">credits by Zidandev</div>
            <div className="hidden sm:block">Ver 1.4.2-STABLE</div>
          </footer>
        </>
      ) : (
        /* ADAPTIVE MAIN WRAPPER (pushed on desktop to accommodate the sidebar width) */
        <div className="lg:pl-72 flex-1 w-full flex flex-col justify-between min-h-screen relative" id="main-content-layout">
          {/* Floating Mobile Page Toggle menu */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-black/90 border border-[#00FF41]/30 hover:border-[#00FF41] rounded-lg text-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.15)] cursor-pointer"
            title="Open Control Terminal"
          >
            <Menu size={18} />
          </button>

          {/* Active Views Area */}
          <div className="flex-1 w-full max-w-7xl mx-auto flex items-center justify-center py-10 px-4 md:px-8 z-10" id="core-view-space">
            {currentView === 'menu' && (
              <div className="w-full flex flex-col items-center animate-fade-in" id="main-landing-bento-grid">
                {/* Promo banner cards detailing credits */}
                <div className="text-center max-w-xl mb-12">
                  <span className="font-mono text-xs text-[#00FF41] uppercase tracking-widest font-bold block mb-1 neon-text-green">
                    Nexus Neon Space Arena
                  </span>
                  <h1 className="font-sans font-black text-4xl sm:text-5xl text-white tracking-tighter uppercase drop-shadow neon-text-cyan">
                    NEXKEY HOCKEY
                  </h1>
                  <p className="font-mono text-xs text-[#00FF41]/70 leading-relaxed mt-3">
                    Immersive glowing air hockey battles fueled by high-performance matrices. Compete against Bot processors or test your synapses in real-time synced multiplayer action.
                  </p>
                  <div className="font-mono text-[10px] uppercase text-[#00FF41]/50 tracking-widest block mt-4 bg-black/40 border border-[#00FF41]/20 py-1.5 px-4 rounded-full inline-block">
                    credits by Zidandev
                  </div>
                </div>

                {/* Bento Grid layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl" id="bento-navigation-mesh">
                  {/* 1. Play vs AI */}
                  <button
                    onClick={() => setCurrentView('game_ai')}
                    id="btn-view-ai"
                    className="glass-panel text-[#00FF41]/80 hover:text-white p-6 rounded-xl text-left flex flex-col justify-between h-56 transition-all duration-300 hover:scale-103 shadow-lg group cursor-pointer hover:border-[#00F0FF]/60 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                  >
                    <div className="w-12 h-12 rounded bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.1)] group-hover:border-[#00F0FF] group-hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                      <Play fill="currentColor" size={20} />
                    </div>
                    <div>
                      <h2 className="font-sans font-extrabold text-xl text-white uppercase tracking-tight group-hover:neon-text-cyan transition-all">
                        VS AI Machine
                      </h2>
                      <p className="font-mono text-xs text-[#00FF41]/60 mt-2 leading-relaxed">
                        Fight autonomous predictive algorithms across 3 speed classes.
                      </p>
                    </div>
                  </button>

                  {/* 2. Multiplayer Match */}
                  <button
                    onClick={() => setCurrentView('game_multiplayer')}
                    id="btn-view-multiplayer"
                    className="glass-panel text-[#00FF41]/80 hover:text-white p-6 rounded-xl text-left flex flex-col justify-between h-56 transition-all duration-300 hover:scale-103 shadow-lg group cursor-pointer hover:border-[#00FF41]/60 hover:shadow-[0_0_20px_rgba(0,255,65,0.15)]"
                  >
                    <div className="w-12 h-12 rounded bg-[#00FF41]/15 border border-[#00FF41]/40 flex items-center justify-center text-[#00FF41] shadow-[0_0_10px_rgba(0,255,65,0.1)] group-hover:border-[#00FF41] group-hover:shadow-[0_0_15px_rgba(0,255,65,0.3)]">
                      <Users size={20} />
                    </div>
                    <div>
                      <h2 className="font-sans font-extrabold text-xl text-white uppercase tracking-tight group-hover:neon-text-green transition-all">
                        Multi-User Grid
                      </h2>
                      <p className="font-mono text-xs text-[#00FF41]/60 mt-2 leading-relaxed">
                        Connect to active rooms for high-frequency coordinate state syncs.
                      </p>
                    </div>
                  </button>

                  {/* 3. Cosmetics Shop */}
                  <button
                    onClick={() => setCurrentView('shop')}
                    id="btn-view-shop"
                    className="glass-panel text-[#00FF41]/80 hover:text-white p-6 rounded-xl text-left flex flex-col justify-between h-56 transition-all duration-300 hover:scale-103 shadow-lg group cursor-pointer hover:border-yellow-500/60 hover:shadow-[0_0_20px_rgba(234,179,8,0.15)]"
                  >
                    <div className="w-12 h-12 rounded bg-yellow-950/30 border border-yellow-500/40 flex items-center justify-center text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.1)] group-hover:border-yellow-400 group-hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <h2 className="font-sans font-extrabold text-xl text-white uppercase tracking-tight group-hover:text-yellow-400 transition-all">
                        Exchange Shop
                      </h2>
                      <p className="font-mono text-xs text-[#00FF41]/60 mt-2 leading-relaxed">
                        Unlock glowing custom transducer transducers or neon playfields.
                      </p>
                    </div>
                  </button>

                  {/* 4. Player Profile Stats */}
                  <button
                    onClick={() => setCurrentView('profile')}
                    id="btn-view-profile"
                    className="glass-panel text-[#00FF41]/80 hover:text-white p-6 rounded-xl text-left flex flex-col justify-between h-56 transition-all duration-300 hover:scale-103 shadow-lg group cursor-pointer hover:border-[#BF00FF]/60 hover:shadow-[0_0_20px_rgba(191,0,255,0.15)]"
                  >
                    <div className="w-12 h-12 rounded bg-[#BF00FF]/15 border border-[#BF00FF]/40 flex items-center justify-center text-[#BF00FF] shadow-[0_0_10px_rgba(191,0,255,0.1)] group-hover:border-[#BF00FF] group-hover:shadow-[0_0_15px_rgba(191,0,255,0.3)]">
                      <UserCircle2 size={20} />
                    </div>
                    <div>
                      <h2 className="font-sans font-extrabold text-xl text-white uppercase tracking-tight group-hover:neon-text-purple transition-all">
                        Combat dossier
                      </h2>
                      <p className="font-mono text-xs text-[#00FF41]/60 mt-2 leading-relaxed">
                        Audit win accuracies, level records, and recent match histories.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Secure Admin Console trigger option if user role matches */}
                {activeUser && activeUser.role === UserRole.ADMIN && (
                  <div className="mt-10 flex flex-col items-center" id="admin-trigger-card">
                    <button
                      onClick={() => setCurrentView('admin')}
                      id="btn-trigger-admin-view"
                      className="flex items-center gap-2 px-6 py-3 bg-red-950/40 border border-red-500/30 hover:border-red-500 text-red-400 font-mono text-xs uppercase font-bold rounded-lg shadow-lg hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] cursor-pointer transition-all hover:scale-103"
                    >
                      <Terminal size={14} className="animate-pulse" /> Access Admin Command Console
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Actual Active Games Canvas Interface routing */}
            {(currentView === 'game_ai' || currentView === 'game_multiplayer') && activeUser && (
              <AirHockeyGame
                user={activeUser}
                shopItems={shopItems}
                onGameCompleted={handleMatchCompleted}
                onExit={() => setCurrentView('menu')}
                gameMode={currentView === 'game_ai' ? 'ai' : 'multiplayer'}
                socketUrl={getSocketUrl()}
              />
            )}

            {/* Dynamic shop views */}
            {currentView === 'shop' && activeUser && (
              <InGameShop
                user={activeUser}
                shopItems={shopItems}
                inventory={inventory}
                onPurchaseItem={handlePurchaseItem}
                onEquipItem={handleEquipItem}
                onClose={() => setCurrentView('menu')}
              />
            )}

            {/* Admin panel dashboards views */}
            {currentView === 'admin' && activeUser && activeUser.role === UserRole.ADMIN && (
              <AdminDashboard
                onBack={() => setCurrentView('menu')}
              />
            )}

            {/* Player profile data dossiers */}
            {currentView === 'profile' && activeUser && playerStats && (
              <ProfileView
                user={activeUser}
                stats={playerStats}
                history={matchHistory}
                onBack={() => setCurrentView('menu')}
                onProfileUpdated={(updatedUser) => {
                  setActiveUser(updatedUser);
                  setAvailableProfiles(prev => prev.map(p => p.id === updatedUser.id ? updatedUser : p));
                }}
              />
            )}
          </div>

          {/* Secure embedded systems footer details */}
          <footer className="w-full h-12 bg-black border-t border-[#00FF41]/10 flex items-center justify-between px-8 text-[10px] tracking-[0.2em] uppercase text-[#00FF41]/60 font-mono z-10 shrink-0" id="global-footer">
            <div>Session: XH-992-004</div>
            <div className="neon-text-green font-bold">credits by Zidandev</div>
            <div className="hidden sm:block">Ver 1.4.2-STABLE</div>
          </footer>
        </div>
      )}

      {/* GLOBAL SYSTEM SETTINGS DIALOG */}
      {globalSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" id="global-settings-modal">
          <div className="bg-zinc-950 border border-[#00FF41]/30 rounded-lg max-w-md w-full p-6 relative font-mono shadow-2xl shadow-[#00FF41]/10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#00FF41]/20 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Settings className="text-[#00FF41] animate-pulse" size={18} />
                <span className="font-bold uppercase tracking-widest text-[#00FF41]">Global Settings Grid</span>
              </div>
              <button 
                onClick={() => setGlobalSettingsModalOpen(false)}
                className="text-white/40 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Inputs body */}
            <div className="space-y-4">
              {/* Language Selector */}
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1.5">
                  Sub-Processor Interface Language:
                </label>
                <select
                  value={sysSettings.language}
                  onChange={(e) => updateSysSettings({ language: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 text-[#00FF41] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#00FF41] cursor-pointer"
                >
                  <option value="en" className="bg-zinc-950 text-[#00FF41]">English (OS-Default)</option>
                  <option value="id" className="bg-zinc-950 text-[#00FF41]">Bahasa Indonesia (Interface-Sub)</option>
                </select>
              </div>

              {/* Audio Channels Toggle */}
              <div className="flex items-center justify-between border-t border-zinc-900 pt-3">
                <span className="text-[11px] uppercase tracking-wider text-white">Oscillator Audio Circuit</span>
                <button
                  type="button"
                  onClick={() => updateSysSettings({ muted: !sysSettings.muted })}
                  className={`px-3 py-1 text-xs font-bold uppercase rounded cursor-pointer transition-colors ${
                    sysSettings.muted
                      ? 'bg-red-950 text-red-400 border border-red-550/40'
                      : 'bg-green-950 text-green-400 border border-green-550/40'
                  }`}
                >
                  {sysSettings.muted ? 'MUTED' : 'ACTIVE'}
                </button>
              </div>

              {/* Volume sliders */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-zinc-500 uppercase">Ambient Synths BGM:</span>
                    <span>{Math.round(sysSettings.bgmVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={sysSettings.bgmVolume}
                    onChange={(e) => updateSysSettings({ bgmVolume: parseFloat(e.target.value) })}
                    className="w-full accent-[#00FF41] bg-zinc-900 rounded-lg appearance-none h-1 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-zinc-500 uppercase">Elastic Collision SFX:</span>
                    <span>{Math.round(sysSettings.sfxVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={sysSettings.sfxVolume}
                    onChange={(e) => updateSysSettings({ sfxVolume: parseFloat(e.target.value) })}
                    className="w-full accent-[#00FF41] bg-zinc-900 rounded-lg appearance-none h-1 cursor-pointer"
                  />
                </div>
              </div>

              {/* Graphic Processing Engine */}
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1.5">
                  Quantum Rendering Quality:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => updateSysSettings({ graphicsQuality: q })}
                      className={`py-1.5 text-[10px] font-sans font-extrabold uppercase rounded border cursor-pointer transition-all ${
                        sysSettings.graphicsQuality === q
                          ? 'bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41] shadow-[0_0_8px_rgba(0,255,65,0.2)]'
                          : 'bg-zinc-900 text-[#00FF41]/40 border-zinc-900 hover:bg-zinc-800'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end gap-3 border-t border-zinc-900 pt-4">
              <button
                onClick={() => setGlobalSettingsModalOpen(false)}
                className="px-5 py-2.5 bg-black/80 hover:bg-[#00FF41]/15 hover:text-white text-[#00FF41] border border-[#00FF41]/30 hover:border-[#00FF41] font-mono text-xs uppercase font-bold rounded cursor-pointer transition-all w-full text-center"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATION / PROFILE GENERATOR MODAL DIALOG */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" id="register-modal-overlay">
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg max-w-md w-full p-6 relative font-mono shadow-2xl" id="register-hud">
            <span className="text-[9px] text-cyan-400 uppercase font-bold block mb-1">
              SYS_PROTOTYPE_INITIALIZER
            </span>
            <h2 className="font-sans font-bold text-2xl uppercase tracking-tighter text-white mb-2">
              Generate Player Node
            </h2>
            <p className="text-zinc-400 text-xs mb-6 leading-relaxed">
              Inject a new custom player identity matrix into our relational database. You can select this profile dynamically using the HUD dropdown anytime.
            </p>

            {regError && (
              <div className="p-3 bg-red-950/20 border border-red-905/30 text-red-400 text-xs rounded mb-4" id="reg-error-msg">
                {regError}
              </div>
            )}

            <form onSubmit={handleRegisterUser} className="space-y-4" id="registry-entries-form">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1.5">
                  Player Username:
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))} // alphanumeric only
                  placeholder="e.g. CyberNinja"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500 text-white px-3 py-2.5 rounded text-sm focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1.5">
                  Secure Grid Email (Optional):
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="ninja@nexkey.dev"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500 text-white px-3 py-2.5 rounded text-sm focus:outline-none transition-colors"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  id="btn-register-submit"
                  className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-sans font-bold uppercase text-xs tracking-wider rounded cursor-pointer transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  Compile Matrix
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  id="btn-register-cancel"
                  className="px-4 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white uppercase text-xs rounded cursor-pointer transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

// Helpers
function activeLevelDescription(exp: number, maxExp: number): string {
  return `${exp}/${maxExp} EXP (${Math.round((exp/maxExp)*100)}%)`;
}
