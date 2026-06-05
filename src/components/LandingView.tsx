import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Gamepad2, Users, Shield, Coins, Sparkles, Terminal, LogIn, Cpu, UserPlus, AlertCircle, Sparkle } from 'lucide-react';

interface LandingViewProps {
  profiles: User[];
  onLogin: (user: User) => void;
  onRegister: (username: string, email: string) => Promise<boolean>; // original legacy signature
  regError: string | null;
  setRegError: (err: string | null) => void;
}

export default function LandingView({ profiles, onLogin, onRegister, regError, setRegError }: LandingViewProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // State for email and password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  // State for username step
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [savingUsername, setSavingUsername] = useState(false);

  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filter profiles that have a valid username for the Preset list
  const validProfiles = profiles.filter(p => p.username && p.username.trim() !== '');

  // Step 1: Login Submit Form (E-Sports Custom Email & Password)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!email.trim() || !password.trim()) {
      setLoginError('Decrypt credentials cannot be compiled blank.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });
      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        const user = data.user;
        if (!user.username || user.username.trim() === '') {
          // Empty username -> Force Step 2 Onboarding
          setTempUser(user);
        } else {
          // Has username -> Direct Login
          onLogin(user);
        }
      } else {
        setLoginError(data.error || 'Identity Decryption failed.');
      }
    } catch (err) {
      setSubmitting(false);
      setLoginError('Failed synchronizing authentication node.');
    }
  };

  // Step 1: Register Submit Form (Email & Password ONLY)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!email.trim() || !regPassword.trim()) {
      setRegError('Auth profiles require an email and secure passcode.');
      return;
    }

    if (regPassword.length < 5) {
      setRegError('Access passcode must be at least 5 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: regPassword.trim() })
      });
      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        // Registration successful! Force Set Username Onboarding (Step 2)
        setTempUser(data.user);
      } else {
        setRegError(data.error || 'Profile compilation failed.');
      }
    } catch (err) {
      setSubmitting(false);
      setRegError('Failed establishing network register gate.');
    }
  };

  // Step 1: Quick-login with preset users
  const handleQuickLogin = (user: User) => {
    if (!user.username || user.username.trim() === '') {
      setTempUser(user);
    } else {
      onLogin(user);
    }
  };

  // Step 2: Set Username Form Submit
  const handleSetUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError(null);
    if (!tempUser) return;

    const trimmedName = newUsername.trim();
    if (!trimmedName) {
      setUsernameError('Username coordinate cannot be compiled empty.');
      return;
    }

    if (!/^[a-zA-Z0-9]{3,15}$/.test(trimmedName)) {
      setUsernameError('Alphanumeric characters only, between 3 and 15 lengths.');
      return;
    }

    setSavingUsername(true);
    try {
      const res = await fetch('/api/auth/set-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: tempUser.id, username: trimmedName })
      });
      const data = await res.json();
      setSavingUsername(false);

      if (data.success) {
        // Complete Step 2 -> Transition to play matrix
        onLogin(data.user);
      } else {
        setUsernameError(data.error || 'Conflict registering username node.');
      }
    } catch (err) {
      setSavingUsername(false);
      setUsernameError('Error communicating with grid database.');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in" id="cyber-landing-viewport">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Game Title & specifications info deck */}
        <div className="lg:col-span-7 text-left space-y-6" id="landing-details-col">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 text-[10px] tracking-[0.25em] font-extrabold uppercase bg-cyan-950/40 text-cyan-400 border border-cyan-400/30 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse">
              NEXUS ELECTRON WAVE ARENA V2
            </span>
            <h1 className="font-sans font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tighter uppercase leading-none">
              NEXKEY<span className="neon-text-green font-mono">.OS</span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-[#BF00FF] font-sans">
                E-SPORTS HOCKEY
              </span>
            </h1>
            <p className="font-mono text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed mt-4">
              Enter the immersive light playfield. Track post-game coordinates, analyze action maps, and experience adaptive bots calibrated under strict threshold capping.
            </p>
          </div>

          {/* System spec bento nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2" id="specs-bento-cells">
            <div className="p-4 bg-black/60 border border-[#00FF41]/15 rounded-lg space-y-1.5 hover:border-[#00FF41]/30 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-2 text-[#00FF41]">
                <Cpu size={16} className="neon-text-green" />
                <span className="font-sans font-extrabold text-xs uppercase tracking-tight text-white">Advanced Telemetry</span>
              </div>
              <p className="font-mono text-[10px] text-zinc-500 leading-relaxed">
                Tracks user spatial positions frame-by-frame to design accurate coordinate maps and hit dynamics on match grids.
              </p>
            </div>

            <div className="p-4 bg-black/60 border border-cyan-400/15 rounded-lg space-y-1.5 hover:border-cyan-400/30 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-2 text-cyan-400">
                <Users size={16} className="neon-text-cyan" />
                <span className="font-sans font-extrabold text-xs uppercase tracking-tight text-white">Three-Step Onboarding</span>
              </div>
              <p className="font-mono text-[10px] text-zinc-500 leading-relaxed">
                Connect seamlessly: Input email and passcode, set an alphanumeric name, and step right into server grids.
              </p>
            </div>

            <div className="p-4 bg-black/60 border border-yellow-500/15 rounded-lg space-y-1.5 hover:border-yellow-500/30 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-2 text-yellow-500">
                <Coins size={16} />
                <span className="font-sans font-extrabold text-xs uppercase tracking-tight text-white">E-Sports Radar Analytics</span>
              </div>
              <p className="font-mono text-[10px] text-zinc-500 leading-relaxed">
                Calculates post-match metric ratings for player Aggressiveness, Speed, Defensiveness, and strike Accuracy.
              </p>
            </div>

            <div className="p-4 bg-black/60 border border-purple-500/15 rounded-lg space-y-1.5 hover:border-purple-500/30 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-2 text-purple-400">
                <Sparkles size={16} />
                <span className="font-sans font-extrabold text-xs uppercase tracking-tight text-white">Capped AI Speed</span>
              </div>
              <p className="font-mono text-[10px] text-zinc-500 leading-relaxed">
                Redefined bot dynamics preventing coordinate teleport matches across Easy, Normal, and Hard skill levels.
              </p>
            </div>
          </div>

          {/* Seeded administrative credential alert badge */}
          <div className="p-4 bg-red-950/20 border border-red-500/20 text-red-400 rounded-lg text-xs space-y-2 shadow-[0_4px_12px_rgba(0,0,0,0.4)]" id="seeded-admin-alert-badge">
            <div className="flex items-center gap-2 font-bold font-sans uppercase tracking-tight">
              <Terminal size={14} className="animate-pulse" /> Grid Presets and Admin Credentials
            </div>
            <p className="font-mono text-[11px] text-zinc-400 leading-relaxed">
              Authenticate easily via pre-seeded keys below, or sign up a brand new user profile:
              <br />
              <span className="text-white">Admin Secure Decrypt:</span> <code className="bg-black/60 px-1.5 py-0.5 rounded text-cyan-400">admin@nexkey.com</code> 
              <span className="mx-2">·</span> 
              <span className="text-white">Passcode:</span> <code className="bg-black/60 px-1.5 py-0.5 rounded text-[#00FF41]">password123</code>
            </p>
          </div>
        </div>

        {/* Right Column: Dynamic Glowing SIGN IN / SIGN UP Multi-Step Interface */}
        <div className="lg:col-span-5" id="landing-auth-card-wrapper">
          <div className="bg-black/90 border border-[#00FF41]/30 rounded-xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,255,101,0.06)] relative overflow-hidden backdrop-blur-md">
            
            {/* Split Top glowing visual accents */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-500 via-emerald-400 to-[#BF00FF]"></div>
            
            {!tempUser ? (
              // STEP 1: LOGIN OR REGISTER
              <>
                {/* Tabs for Login vs Register */}
                <div className="grid grid-cols-2 gap-2 mb-6" id="auth-tab-buttons">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setLoginError(null);
                      setRegError(null);
                    }}
                    className={`py-2 px-3 text-xs uppercase font-extrabold font-mono rounded cursor-pointer transition-all border ${
                      activeTab === 'login'
                        ? 'bg-cyan-500/10 text-cyan-300 border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                        : 'bg-transparent text-zinc-500 border-transparent hover:text-white'
                    }`}
                  >
                    <LogIn size={12} className="inline mr-1.5 animate-pulse" /> CORE DECRYPT
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setLoginError(null);
                      setRegError(null);
                    }}
                    className={`py-2 px-3 text-xs uppercase font-extrabold font-mono rounded cursor-pointer transition-all border ${
                      activeTab === 'register'
                        ? 'bg-[#BF00FF]/10 text-purple-300 border-[#BF00FF]/40 shadow-[0_0_10px_rgba(191,0,255,0.15)]'
                        : 'bg-transparent text-zinc-500 border-transparent hover:text-white'
                    }`}
                  >
                    <UserPlus size={12} className="inline mr-1.5" /> CREATE SYNAPSE
                  </button>
                </div>

                {activeTab === 'login' ? (
                  // LOGIN TAB WITH PASSWORDS OR PRESET LISTS
                  <div className="space-y-5" id="preset-login-space">
                    <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                      <div>
                        <label className="block text-[10px] uppercase text-cyan-400 mb-1.5 font-extrabold tracking-wider">
                          SYNAPSE EMAIL ADDRESS
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. administrator@nexkey.com"
                          className="w-full bg-black border border-zinc-900 focus:border-cyan-400 rounded px-3.5 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-cyan-400/30 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase text-cyan-400 mb-1.5 font-extrabold tracking-wider">
                          DECRYPTION KEY PASSCODE
                        </label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter passcode to decrypt"
                          className="w-full bg-black border border-zinc-900 focus:border-cyan-400 rounded px-3.5 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-cyan-400/30 transition-all"
                        />
                      </div>

                      {loginError && (
                        <div className="p-3 bg-red-950/20 border border-red-500/40 text-red-400 text-xs rounded flex items-center gap-2">
                          <AlertCircle size={14} />
                          <span>{loginError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-sans font-bold uppercase text-xs tracking-wider rounded cursor-pointer transition-all active:scale-98 shadow-[0_0_20px_rgba(6,182,212,0.2)] disabled:opacity-40 select-none mt-4"
                      >
                        {submitting ? 'COMPILING CRYPT KEY...' : 'INITIALIZE SECURE_SESSION'}
                      </button>
                    </form>

                    {/* Pre-seeded session switch shortcuts */}
                    {validProfiles.length > 0 && (
                      <div className="pt-4 border-t border-zinc-950/60 text-left">
                        <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-extrabold mb-2 text-center">
                          OR SWAP INSTANTLY VIA RE-SEEDED GRIDS
                        </span>
                        <div className="grid grid-cols-2 gap-2 max-h-[110px] overflow-y-auto pr-1">
                          {validProfiles.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => handleQuickLogin(p)}
                              className="p-2 rounded bg-zinc-950/80 border border-zinc-900 hover:border-cyan-400 cursor-pointer transition-all text-left flex items-center gap-2"
                            >
                              <div className="w-5 h-5 rounded-full overflow-hidden border border-zinc-800 bg-black flex-shrink-0">
                                <img
                                  src={p.avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${p.username}`}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                  alt=""
                                />
                              </div>
                              <div className="truncate">
                                <div className="text-[10px] font-bold text-white uppercase leading-none truncate">{p.username}</div>
                                <span className="text-[7px] text-zinc-500 font-mono">LVL {p.level}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // REGISTER TAB (EMAIL AND PASSWORD ONLY)
                  <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left" id="preset-register-form">
                    <div>
                      <span className="block text-[8px] bg-purple-950/30 text-purple-400 border border-purple-500/20 px-2 py-1 rounded mb-2 text-center font-bold tracking-wider uppercase font-mono">
                        STEP 1 OF 2: SECURE PROFILE BOUNDS
                      </span>
                      <label className="block text-[10px] uppercase text-purple-400 mb-1.5 font-extrabold tracking-wider">
                        EMAIL ADDR
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. pilot@nexkey.dev"
                        className="w-full bg-black border border-zinc-900 focus:border-[#BF00FF] rounded px-3.5 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-purple-400/30 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase text-purple-400 mb-1.5 font-extrabold tracking-wider">
                        ACCESS SECURE PASSCODE
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 5 alphanumeric keys"
                        className="w-full bg-black border border-zinc-900 focus:border-[#BF00FF] rounded px-3.5 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-purple-400/30 transition-all"
                      />
                    </div>

                    {regError && (
                      <div className="p-3 bg-red-950/20 border border-red-500/40 text-red-400 text-xs rounded flex items-center gap-2">
                        <AlertCircle size={14} />
                        <span>{regError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-[#BF00FF] hover:bg-[#bd00ff] text-black font-sans font-bold uppercase text-xs tracking-wider rounded cursor-pointer transition-all active:scale-98 shadow-[0_0_15px_rgba(191,0,255,0.2)] disabled:opacity-40 select-none mt-4"
                    >
                      {submitting ? 'COMPILING IDENT SYSTEM...' : 'ESTABLISH SECURE GATE'}
                    </button>
                  </form>
                )}
              </>
            ) : (
              // STEP 2: SET USERNAME (FORCED TO FILL BLANK)
              <form onSubmit={handleSetUsernameSubmit} className="space-y-4 text-left" id="username-onboard-form">
                <div>
                  <span className="block text-[8px] bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 px-2 py-1.5 rounded mb-4 text-center font-bold tracking-wider uppercase font-mono">
                    STEP 2 OF 2: REGISTER SYSTEM USERNAME
                  </span>
                  <p className="font-mono text-[10px] text-zinc-400 leading-relaxed mb-4">
                    Before joining the active match lobbies, choose an official alphanumeric pilot designation coordinate. 
                    This identity is synchronized to your esports charts history.
                  </p>
                  
                  <label className="block text-[10px] uppercase text-[#00FF41] mb-1.5 font-extrabold tracking-wider">
                    GRID PILOT USERNAME
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    placeholder="Enter 3-15 alphanumeric designation"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                    className="w-full bg-black border border-zinc-900 focus:border-[#00FF41] rounded px-3.5 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-400/30 transition-all font-mono"
                  />
                </div>

                {usernameError && (
                  <div className="p-3 bg-red-950/20 border border-red-500/40 text-red-400 text-xs rounded flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{usernameError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingUsername}
                  className="w-full py-3 bg-[#00FF41] hover:bg-[#2eff6a] text-black font-sans font-bold uppercase text-xs tracking-wider rounded cursor-pointer transition-all active:scale-98 shadow-[0_0_15px_rgba(0,255,65,0.25)] disabled:opacity-40 select-none mt-4"
                >
                  {savingUsername ? 'SYNCHRONIZING DESIG...' : 'LOCK IDENTIFICATION MATRIX'}
                </button>

                <button
                  type="button"
                  onClick={() => setTempUser(null)}
                  className="w-full py-2.5 bg-zinc-950/80 hover:bg-zinc-900 text-zinc-400 border border-zinc-900 rounded font-mono text-[10px] uppercase tracking-wider cursor-pointer mt-2 text-center"
                >
                  Return to Step 1
                </button>
              </form>
            )}

            <div className="mt-8 pt-4 border-t border-zinc-900/40 text-center text-[10px] uppercase text-zinc-600">
              Session Secures automatically on local device.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
