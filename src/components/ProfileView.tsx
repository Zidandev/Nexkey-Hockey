import React, { useState } from 'react';
import { User, PlayerStats, MatchHistory } from '../types';
import { ArrowLeft, UserCircle2, Swords, Percent, Award, Landmark, TrendingUp, Edit2, CheckCircle, AlertTriangle, Save, RefreshCw } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  stats: PlayerStats;
  history: MatchHistory[];
  onBack: () => void;
  onProfileUpdated: (updatedUser: User) => void;
}

const AVATAR_PRESETS = [
  { name: 'Core Cyan', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=120&auto=format&fit=crop&q=80' },
  { name: 'Glitch Hacker', url: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=120&auto=format&fit=crop&q=80' },
  { name: 'Cyber Samurai', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=120&auto=format&fit=crop&q=80' },
  { name: 'Synth Retro', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=120&auto=format&fit=crop&q=80' },
  { name: 'Android Matrix', url: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=120&auto=format&fit=crop&q=80' },
];

export default function ProfileView({ user, stats, history, onBack, onProfileUpdated }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(user.username);
  const [editBio, setEditBio] = useState(user.bio || '');
  const [editAvatar, setEditAvatar] = useState(user.avatarUrl || AVATAR_PRESETS[0].url);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Format dates helper
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recent';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername.trim()) {
      setStatusMessage({ type: 'error', text: 'Username cannot be blank.' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const response = await fetch(`/api/users/${user.id}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editUsername.trim(),
          bio: editBio.trim(),
          avatarUrl: editAvatar
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to persist edit profile payload');
      }

      const updatedUser: User = await response.json();
      onProfileUpdated(updatedUser);
      setStatusMessage({ type: 'success', text: 'Cyberspace identity sync completed successfully!' });
      setTimeout(() => {
        setIsEditing(false);
        setStatusMessage(null);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Error occurred while saving.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-3" id="profile-detailed-panel">
      {/* Upper banner section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-[#00FF41]/20 pb-5" id="profile-banner">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            id="btn-profile-back"
            className="p-2 bg-black border border-[#00FF41]/30 text-[#00FF41] hover:border-[#00FF41] hover:text-white rounded cursor-pointer transition-all mr-2"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div>
            <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest block font-bold">Nexkey Terminal</span>
            <h1 className="font-sans font-bold text-3xl text-white tracking-tighter uppercase flex items-center gap-2">
              <UserCircle2 size={28} className="neon-text-cyan" /> Player Profile
            </h1>
          </div>
        </div>

        {/* Edit Button or Status indicators */}
        <div>
          {!isEditing ? (
            <button
              onClick={() => {
                setEditUsername(user.username);
                setEditBio(user.bio || '');
                setEditAvatar(user.avatarUrl || AVATAR_PRESETS[0].url);
                setIsEditing(true);
                setStatusMessage(null);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black border border-cyan-400/40 text-cyan-400 font-mono text-xs uppercase font-extrabold hover:border-cyan-400 hover:text-white rounded transition-all cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.1)]"
            >
              <Edit2 size={12} /> Edit Synapse Identity
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-black border border-white/20 text-white/60 font-mono text-xs uppercase font-bold hover:border-white/60 hover:text-white rounded transition-all cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Profile Detail Content */}
      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="glass-panel rounded-lg p-6 mb-8 text-left max-w-2xl mx-auto border border-cyan-400/30 font-mono text-white animate-fade-in">
          <h2 className="font-sans font-bold text-lg text-cyan-400 uppercase tracking-tight mb-4 border-b border-cyan-400/10 pb-2">
            Identity Modulation Interface
          </h2>

          {statusMessage && (
            <div className={`p-3 rounded text-xs mb-4 flex items-center gap-2 ${
              statusMessage.type === 'success' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Core Username */}
            <div>
              <label className="block text-[10px] uppercase text-cyan-400 mb-1.5 font-bold tracking-wider">Node Name (Username)</label>
              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                maxLength={20}
                required
                className="w-full bg-black border border-cyan-400/30 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 rounded"
              />
            </div>

            {/* Custom Bio */}
            <div>
              <label className="block text-[10px] uppercase text-cyan-400 mb-1.5 font-bold tracking-wider">Synaptic Directive / Bio</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                maxLength={100}
                rows={2}
                placeholder="Write a short cybernetic directive or details..."
                className="w-full bg-black border border-cyan-400/30 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 rounded resize-none"
              />
            </div>

            {/* Select Avatar presets */}
            <div>
              <label className="block text-[10px] uppercase text-cyan-400 mb-1.5 font-bold tracking-wider">Select Holographic Avatar Node</label>
              <div className="grid grid-cols-5 gap-3 mt-1.5">
                {AVATAR_PRESETS.map((p) => {
                  const selected = editAvatar === p.url;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setEditAvatar(p.url)}
                      className={`relative aspect-square rounded-full overflow-hidden border transition-all duration-300 cursor-pointer ${
                        selected 
                          ? 'border-cyan-400 p-0.5 scale-105 shadow-[0_0_12px_rgba(6,182,212,0.4)]' 
                          : 'border-[#00FF41]/20 hover:border-cyan-400/50'
                      }`}
                    >
                      <img
                        src={p.url}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full"
                      />
                      {selected && (
                        <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                          <CheckCircle size={16} className="text-cyan-300 shadow-md font-extrabold" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-cyan-400/10 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-sans font-bold uppercase text-xs cursor-pointer rounded transition-all shadow-lg select-none disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
              {isSaving ? 'Compiling Sync...' : 'Synchronize Identity'}
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Identity Card Profile */}
          <div className="glass-panel rounded-lg p-5 flex flex-col sm:flex-row items-center gap-6 mb-8 border border-[#00ff66]/10 text-left" id="profile-identity-card">
            <div className="w-24 h-24 rounded-full border-2 border-cyan-400/40 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.2)] overflow-hidden flex-shrink-0 animate-fade-in bg-black">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center font-bold text-3xl neon-text-cyan select-none uppercase font-mono">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-grow font-mono">
              <span className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-wider block">Authorized Agent</span>
              <h2 className="font-sans font-extrabold text-2xl text-white tracking-tight uppercase leading-none mt-1">{user.username}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-2 mb-3">
                <span className="text-[10px] text-white/50 bg-[#00FF41]/5 px-2 py-0.5 border border-[#00FF41]/10 rounded font-semibold uppercase">{user.role} Matrix Sync</span>
                <span className="text-[10px] text-[#00FF41] font-bold">LVL {user.level} Node</span>
              </div>
              <p className="text-white/60 text-xs leading-relaxed max-w-xl italic">
                {user.bio || '"No directive stated. Configure a custom synapse identity directive above."'}
              </p>
            </div>
          </div>

          {/* Grid displays for Level meters and Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" id="profile-grid">
            {/* Level and Level up Progress bar */}
            <div className="glass-panel rounded-lg p-5 flex flex-col justify-between md:col-span-2 text-left">
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-sans font-bold text-lg text-white uppercase tracking-tight flex items-center gap-1.5">
                    <TrendingUp size={16} className="neon-text-cyan" /> Progression Node
                  </span>
                  <span className="font-mono text-xs neon-text-green font-bold">LVL {user.level}</span>
                </div>
                
                <p className="font-mono text-white/60 text-xs mt-1 mb-4">
                  Finish matches (VS AI or Multiplayer) to gain EXP. Once reached 100%, you level up!
                </p>
              </div>

              <div id="progression-progress-card">
                <div className="flex justify-between font-mono text-[10px] text-white/40 mb-2">
                  <span>EXP MATRIX STATUS</span>
                  <span>{user.exp} / {user.maxExp} EXP ({Math.round((user.exp / user.maxExp)*100)}%)</span>
                </div>
                
                {/* Progress bar line */}
                <div className="w-full bg-black h-3.5 rounded-full overflow-hidden border border-[#00FF41]/20 p-0.5">
                  <div
                    className="bg-gradient-to-r from-[#00FF41] to-[#BF00FF] h-full rounded-full shadow-[0_0_10px_rgba(0,255,65,0.5)] transition-all duration-500"
                    style={{ width: `${Math.min(100, (user.exp / user.maxExp)*100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Highlight Stats summaries circular list */}
            <div className="glass-panel rounded-lg p-5 flex flex-col justify-between text-left">
              <h2 className="font-sans font-bold text-base text-white/50 uppercase tracking-tight mb-4 flex items-center gap-1.5 border-b border-[#00FF41]/10 pb-2 font-mono">
                <Percent size={14} className="neon-text-cyan" /> Battle Ratios
              </h2>

              <div className="space-y-4 font-mono text-xs" id="ratios-breakdown">
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Win rate accuracy</span>
                  <span className="text-lg font-bold neon-text-cyan">{stats.winRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Matches complete</span>
                  <span className="text-sm font-semibold text-white">{stats.totalMatches}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Wins secured</span>
                  <span className="text-sm font-semibold neon-text-green">{stats.totalWins}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Losses suffered</span>
                  <span className="text-sm font-semibold text-red-500">{stats.totalLosses}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Match History logs list */}
          <div className="glass-panel rounded-lg p-5 text-left" id="profile-history-card">
            <h2 className="font-sans font-bold text-lg text-white uppercase tracking-tight flex items-center gap-1.5 mb-4 border-b border-[#00FF41]/10 pb-3">
              <Swords size={18} className="neon-text-green" /> Logged Match Histories
            </h2>

            {history.length === 0 ? (
              <div className="text-center py-10 text-white/40 font-mono text-xs uppercase" id="profile-history-empty">
                No match recordings yet. Go play an AI or Multiplayer match!
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1" id="history-scroller">
                {history.map((record) => {
                  const won = record.playerRank === 'win';
                  const isAi = record.mode === 'ai';
                  
                  return (
                    <div
                      key={record.id}
                      className={`border rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
                        won
                          ? 'bg-[#00FF41]/5 border-[#00FF41]/30'
                          : 'bg-black/40 border-[#00FF41]/10'
                      }`}
                    >
                      {/* Left block info */}
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold border ${
                          won
                            ? 'bg-black border-[#00FF41]/45 text-[#00FF41] shadow-[0_0_10px_rgba(0,255,65,0.25)]'
                            : 'bg-black border-[#00FF41]/10 text-white/30'
                        }`}>
                          {won ? 'W' : 'L'}
                        </div>

                        <div className="font-mono">
                          <span className="font-sans font-bold text-white text-sm block">
                            vs {record.opponentName}
                          </span>
                          <span className="text-[10px] text-white/40 uppercase tracking-wide block mt-1">
                            {isAi ? 'VS AI COMPILER' : 'GRID MULTIPLAYER'} · {formatDate(record.playedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Right scores / payouts info */}
                      <div className="flex items-center gap-6 font-mono text-xs" id="history-payouts-row">
                        {/* Score */}
                        <div className="text-right">
                          <span className="text-[9px] text-white/40 uppercase block">SCORES</span>
                          <span className="text-sm font-bold text-white leading-none">
                            {record.scoreSelf} : {record.scoreOpponent}
                          </span>
                        </div>

                        {/* Rewards */}
                        <div className="text-right">
                          <span className="text-[9px] text-white/40 uppercase block">REWARDS</span>
                          <span className="neon-text-purple font-bold block">+{record.expEarned} EXP</span>
                          <span className="neon-text-green font-bold block">+{record.currencyEarned} NEX</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      <div className="text-center mt-12 text-[#00FF41]/30 font-mono text-[10px] uppercase tracking-wider flex justify-center text-center">
        credits by Zidandev
      </div>
    </div>
  );
}
