import React, { useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import { ArrowLeft, Terminal, Shield, Award, Coins, Trash2, ShieldAlert, UserX, Search, Edit2, Play, Users, FolderCheck } from 'lucide-react';

interface AdminDashboardProps {
  onBack: () => void;
}

interface ServerStats {
  usersCount: number;
  adminCount: number;
  playerCount: number;
  bannedCount: number;
  totalMatchesPlayed: number;
  totalCredits: number;
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [players, setPlayers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editPlayerId, setEditPlayerId] = useState<string | null>(null);

  // States for player edit properties
  const [editLevel, setEditLevel] = useState(1);
  const [editCurrency, setEditCurrency] = useState(100);

  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Fetch metrics data
  const fetchData = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const statsRes = await fetch('/api/admin/stats');
      const statsJson = await statsRes.json();
      if (statsJson.success) {
        setStats(statsJson.stats);
      }

      // Fetch player lists with current search term
      const playersRes = await fetch(`/api/admin/players?search=${encodeURIComponent(searchQuery)}`);
      const playersJson = await playersRes.json();
      if (playersJson.success) {
        setPlayers(playersJson.players);
      }
    } catch (err) {
      console.error('Failed to sync admin logs: ', err);
      setStatusMessage('Error synchronizing database tables.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery]);

  // Handle Ban / Unban
  const handleToggleBan = async (player: User) => {
    try {
      const res = await fetch(`/api/admin/players/${player.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: !player.isBanned })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Successfully ${player.isBanned ? 'unbanned' : 'banned'} user: ${player.username}`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Operation failed inside matrix.');
    }
  };

  // Handle Delete
  const handleDeletePlayer = async (playerId: string, username: string) => {
    if (!confirm(`Are you absolutely sure you want to delete Player ${username}? This is destructive and non-reversible.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/players/${playerId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Permanently purged user ${username} from records.`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Purge operation failed.');
    }
  };

  // Handle update attributes
  const handleSaveEdit = async () => {
    if (!editPlayerId) return;

    try {
      const res = await fetch(`/api/admin/players/${editPlayerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: editLevel,
          currency: editCurrency
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Modified parameters of player successfully.`);
        setEditPlayerId(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Modification failed inside system tables.');
    }
  };

  // Populate Edit parameters
  const startEditPlayer = (player: User) => {
    setEditPlayerId(player.id);
    setEditLevel(player.level);
    setEditCurrency(player.currency);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-3" id="admin-panel-viewport">
      {/* Header top banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-[#00FF41]/20 pb-5" id="admin-banner">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            id="btn-admin-back"
            className="p-2 bg-black border border-[#00FF41]/30 text-[#00FF41] hover:border-[#00FF41] hover:text-white rounded cursor-pointer transition-all mr-2"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div>
            <span className="font-mono text-xs text-red-500 uppercase tracking-widest block flex items-center gap-1">
              <Shield size={12} /> SECURE SYSTEM SECTORS
            </span>
            <h1 className="font-sans font-bold text-3xl text-white tracking-tighter uppercase flex items-center gap-2">
              <Terminal size={28} className="text-red-500 animate-pulse" /> Admin Command Grid
            </h1>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 font-mono text-xs rounded mb-6 text-center shadow-md animate-fade-in" id="admin-alert">
          {statusMessage}
        </div>
      )}

      {/* Grid Server statistics indices */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" id="admin-metrics-row">
          <div className="glass-panel p-4 rounded-lg flex items-center gap-3 bg-black/60 border-[#00FF41]/20">
            <Users className="neon-text-cyan" size={24} />
            <div className="font-mono">
              <span className="text-[9px] text-white/40 uppercase block">Active Lobbies</span>
              <span className="text-lg font-bold text-white">{stats.usersCount} <span className="text-xs text-white/30 font-normal">grids</span></span>
            </div>
          </div>
          <div className="glass-panel p-4 rounded-lg flex items-center gap-3 bg-black/60 border-[#00FF41]/20">
            <Award className="neon-text-green" size={24} />
            <div className="font-mono">
              <span className="text-[9px] text-white/40 uppercase block">Matches Played</span>
              <span className="text-lg font-bold text-white">{stats.totalMatchesPlayed} <span className="text-xs text-white/30 font-normal">nodes</span></span>
            </div>
          </div>
          <div className="glass-panel p-4 rounded-lg flex items-center gap-3 bg-black/60 border-[#00FF41]/20">
            <Coins className="text-yellow-550" size={24} />
            <div className="font-mono">
              <span className="text-[9px] text-white/40 uppercase block">Credit Flow</span>
              <span className="text-lg font-bold text-yellow-500">{stats.totalCredits} <span className="text-[9px] text-white/30 font-normal font-sans">NEX</span></span>
            </div>
          </div>
          <div className="glass-panel p-4 rounded-lg flex items-center gap-3 bg-black/60 border-[#00FF41]/20">
            <ShieldAlert className="text-red-500" size={24} />
            <div className="font-mono">
              <span className="text-[9px] text-white/40 uppercase block">Banned Matrices</span>
              <span className="text-lg font-bold text-red-500">{stats.bannedCount} <span className="text-xs text-white/30 font-normal">quarantined</span></span>
            </div>
          </div>
        </div>
      )}

      {/* Main Players lists commands */}
      <div className="glass-panel rounded-lg p-5 bg-black/80 border-[#00FF41]/20" id="admin-player-control-table">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-5" id="admin-search-filtering">
          <h2 className="font-sans font-bold text-lg text-white uppercase tracking-tight">Active Player Registry</h2>

          <div className="relative max-w-xs w-full" id="admin-search-wrapper">
            <Search className="absolute left-3 top-2.5 text-[#00FF41]/55" size={16} />
            <input
              type="text"
              placeholder="Search user record matrices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/80 border border-[#00FF41]/30 focus:border-[#00F0FF] text-[#00FF41] font-mono text-xs pl-9 pr-4 py-2.5 rounded-md focus:outline-none transition-all shadow-[inset_0_0_4px_rgba(0,255,65,0.1)]"
            />
          </div>
        </div>

        {/* Players lists wrapper */}
        {loading ? (
          <div className="text-center py-10" id="admin-loader">
            <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin mx-auto mb-2" />
            <span className="font-mono text-xs text-zinc-500 uppercase">Indexing db user collections...</span>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 font-mono text-xs uppercase" id="admin-empty">
            No player datasets matches query.
          </div>
        ) : (
          <div className="overflow-x-auto" id="admin-table-scroll">
            <table className="w-full text-left font-mono text-xs" id="admin-records-table">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 uppercase">
                  <th className="pb-3 font-semibold">User Identifiers</th>
                  <th className="pb-3 font-semibold">Level Details</th>
                  <th className="pb-3 font-semibold">CC Balance</th>
                  <th className="pb-3 font-semibold">Stats (W/L)</th>
                  <th className="pb-3 font-semibold">Status/Role</th>
                  <th className="pb-3 text-right pb-3 font-semibold">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {players.map((player) => {
                  const isEditing = editPlayerId === player.id;
                  
                  return (
                    <tr key={player.id} className="hover:bg-zinc-900/25 transition-all">
                      {/* Name / Email */}
                      <td className="py-4">
                        <span className="font-sans font-bold text-white block text-sm">{player.username}</span>
                        <span className="text-[10px] text-zinc-500 block">{player.email}</span>
                      </td>

                      {/* Level detailed edits */}
                      <td className="py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={editLevel}
                            onChange={(e) => setEditLevel(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 bg-zinc-900 border border-zinc-800 text-white p-1 text-center rounded focus:outline-none"
                          />
                        ) : (
                          <span className="font-bold text-cyan-400">LVL {player.level}</span>
                        )}
                      </td>

                      {/* Currency edits */}
                      <td className="py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={editCurrency}
                            onChange={(e) => setEditCurrency(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-20 bg-zinc-900 border border-zinc-800 text-white p-1 text-center rounded focus:outline-none"
                          />
                        ) : (
                          <span className="font-bold text-yellow-500">{player.currency} CC</span>
                        )}
                      </td>

                      {/* Win Rates summaries */}
                      <td className="py-4 text-zinc-400">
                        {player.id === 'user_admin' ? (
                          <span>6W / 2L <span className="text-zinc-600">(75%)</span></span>
                        ) : (
                          <span>1W / 2L <span className="text-zinc-600">(33%)</span></span>
                        )}
                      </td>

                      {/* Profile role / ban attributes */}
                      <td className="py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                            player.role === UserRole.ADMIN 
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                              : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                          }`}>
                            {player.role}
                          </span>

                          {player.isBanned && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/15 text-rose-500 border border-rose-500/20 uppercase font-bold animate-pulse">
                              BAN ACTIVE
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Operations controls */}
                      <td className="py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={handleSaveEdit}
                                className="px-2.5 py-1.5 bg-green-500 text-black rounded text-[10px] font-sans font-bold hover:bg-green-400 cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditPlayerId(null)}
                                className="px-2.5 py-1.5 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded text-[10px] font-sans hover:text-white cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditPlayer(player)}
                                className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded cursor-pointer transition-colors"
                                title="Edit Stats & CC"
                              >
                                <Edit2 size={13} />
                              </button>
                              {player.id !== 'user_admin' && (
                                <>
                                  <button
                                    onClick={() => handleToggleBan(player)}
                                    className={`p-1.5 rounded border cursor-pointer transition-colors ${
                                      player.isBanned
                                        ? 'bg-green-950/20 border-green-900/20 text-green-400 hover:bg-green-500/20 animate-pulse'
                                        : 'bg-zinc-900 border-zinc-800 text-amber-500 hover:text-amber-400 hover:bg-amber-950/10'
                                    }`}
                                    title={player.isBanned ? 'Lift Ban' : 'Ban player'}
                                  >
                                    <UserX size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePlayer(player.id, player.username)}
                                    className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-500 rounded cursor-pointer transition-colors"
                                    title="Purge Player Account"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-center mt-12 text-zinc-700 font-mono text-[10px] uppercase tracking-wider" id="admin-credits flex justify-center text-center">
        credits by Zidandev
      </div>
    </div>
  );
}
