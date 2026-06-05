import express from 'express';
import path from 'path';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db/database';
import { User, UserRole, LiveGameState, GameCoordinates } from './src/types';

interface CustomWebSocket extends WebSocket {
  gameId?: string;
  userId?: string;
  isAlive?: boolean;
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(express.json());

  // ==========================================
  // HTTP API ENDPOINTS
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get all profile templates for quick switching / signing in
  app.get('/api/auth/profiles', (req, res) => {
    try {
      const users = db.getUsers();
      res.json({ success: true, users });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // User details, inventory, and stats
  app.get('/api/users/:id', (req, res) => {
    try {
      const { id } = req.params;
      const user = db.getUserById(id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const stats = db.getStatsByUserId(id);
      const inventory = db.getInventoryByUserId(id);
      const history = db.getMatchHistoryByUserId(id);

      res.json({
        success: true,
        user,
        stats,
        inventory,
        history
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Edit user profile (Display Name, Bio, Avatar)
  app.post('/api/users/:id/profile', (req, res) => {
    try {
      const { id } = req.params;
      const { username, bio, avatarUrl } = req.body;
      
      const user = db.getUserById(id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User match not found' });
      }

      if (!username || !username.trim()) {
        return res.status(400).json({ success: false, error: 'Username cannot be blank' });
      }

      // Check username conflicts (excluding their own self)
      const existing = db.getUserByUsername(username.trim());
      if (existing && existing.id !== id) {
        return res.status(400).json({ success: false, error: 'Username is already configured on another profile' });
      }

      const updated = db.updateUser(id, {
        username: username.trim(),
        bio: bio !== undefined ? bio.trim() : user.bio,
        avatarUrl: avatarUrl !== undefined ? avatarUrl.trim() : user.avatarUrl
      });

      if (!updated) {
        return res.status(500).json({ success: false, error: 'Failed compiling user updates' });
      }

      res.json({
        success: true,
        user: updated,
        stats: db.getStatsByUserId(id),
        inventory: db.getInventoryByUserId(id),
        history: db.getMatchHistoryByUserId(id)
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Register new player (V1 legacy fallback)
  app.post('/api/auth/register', (req, res) => {
    try {
      const { username, email } = req.body;
      if (!username) {
        return res.status(400).json({ success: false, error: 'Username is required' });
      }

      const existing = db.getUserByUsername(username);
      if (existing) {
        return res.json({ success: true, user: existing, message: 'Welcome back!' });
      }

      const newUser = db.createUser(username, email);
      res.status(201).json({ success: true, user: newUser, message: 'Account created!' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // E-Sports Core simple registration: email & password (Step 1)
  app.post('/api/auth/register-simple', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password Access codes are required.' });
      }

      // Check duplicate email
      const existing = db.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ success: false, error: 'Email address already mapped to an active synapse.' });
      }

      // Create new user (leaving username blank initially to enforce onboarding step 2)
      const user = db.createUser('', email);
      
      res.status(201).json({
        success: true,
        user,
        message: 'Synapse account initiated. Enforcing username verification.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // E-Sports Core simple login (Step 1)
  app.post('/api/auth/login-simple', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required.' });
      }

      const user = db.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Unrecognized user email synapse address.' });
      }

      // Check credentials: since it's a sandbox/preview game, we accept password123 for default admin
      if (email === 'admin@nexkey.com' && password !== 'password123') {
        return res.status(401).json({ success: false, error: 'Invalid decryption key hexcode. Try: password123' });
      }

      res.json({
        success: true,
        user,
        message: 'Decryption verified.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Onboarding username set (Step 2)
  app.post('/api/auth/set-username', (req, res) => {
    try {
      const { userId, username } = req.body;
      if (!userId || !username || !username.trim()) {
        return res.status(400).json({ success: false, error: 'Username compiling cannot be blank.' });
      }

      const cleanUsername = username.trim();

      // Ensure username contains only letters & numbers
      if (!/^[a-zA-Z0-9]{3,15}$/.test(cleanUsername)) {
        return res.status(400).json({ success: false, error: 'Username must be alphanumeric, between 3 and 15 characters.' });
      }

      // Check conflict
      const userWithSameName = db.getUserByUsername(cleanUsername);
      if (userWithSameName && userWithSameName.id !== userId) {
        return res.status(400).json({ success: false, error: 'Username coordinate registered elsewhere on the grid.' });
      }

      const user = db.getUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Node context match not found.' });
      }

      // Update
      const updated = db.updateUser(userId, {
        username: cleanUsername,
        avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${cleanUsername}`
      });

      res.json({
        success: true,
        user: updated,
        message: 'Username successfully registered to current synapse!'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get Shop Items
  app.get('/api/shop/items', (req, res) => {
    try {
      const items = db.getShopItems();
      res.json({ success: true, items });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Purchase Shop Item
  app.post('/api/shop/purchase', (req, res) => {
    try {
      const { userId, itemId } = req.body;
      if (!userId || !itemId) {
        return res.status(400).json({ success: false, error: 'Missing userId or itemId' });
      }

      const result = db.buyShopItem(userId, itemId);
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        user: db.getUserById(userId),
        inventory: db.getInventoryByUserId(userId)
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Equip Skin (Paddle or Board)
  app.post('/api/shop/equip', (req, res) => {
    try {
      const { userId, itemId } = req.body;
      if (!userId || !itemId) {
        return res.status(400).json({ success: false, error: 'Missing userId or itemId' });
      }

      const result = db.equipSkin(userId, itemId);
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        user: db.getUserById(userId)
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Save game record (match completed)
  app.post('/api/match/add', (req, res) => {
    try {
      const { userId, opponentName, mode, playerRank, scoreSelf, scoreOpponent, expEarned, currencyEarned } = req.body;
      if (!userId) {
        return res.status(400).json({ success: false, error: 'Missing userId' });
      }

      const history = db.addMatchRecord(userId, {
        opponentName,
        mode,
        playerRank,
        scoreSelf,
        scoreOpponent,
        expEarned,
        currencyEarned
      });

      res.json({
        success: true,
        user: db.getUserById(userId),
        stats: db.getStatsByUserId(userId),
        historyRecord: history
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin Dashboard - Get All Players (Admin Mode)
  app.get('/api/admin/players', (req, res) => {
    try {
      const { search } = req.query;
      let players = db.getUsers();

      if (search) {
        const query = (search as string).toLowerCase();
        players = players.filter(p => p.username.toLowerCase().includes(query) || p.email.toLowerCase().includes(query));
      }

      const playersWithStats = players.map(p => {
        return {
          ...p,
          stats: db.getStatsByUserId(p.id)
        };
      });

      res.json({ success: true, players: playersWithStats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin Dashboard - Modify user details or toggle ban status
  app.post('/api/admin/players/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { currency, level, isBanned, role } = req.body;

      const updates: Partial<User> = {};
      if (currency !== undefined) updates.currency = Number(currency);
      if (level !== undefined) updates.level = Number(level);
      if (isBanned !== undefined) updates.isBanned = Boolean(isBanned);
      if (role !== undefined) updates.role = role;

      const user = db.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.json({ success: true, user, stats: db.getStatsByUserId(id) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin Dashboard - Delete Player
  app.delete('/api/admin/players/:id', (req, res) => {
    try {
      const { id } = req.params;
      const success = db.deleteUser(id);
      if (!success) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.json({ success: true, message: 'User deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin Dashboard - Server Statistics
  app.get('/api/admin/stats', (req, res) => {
    try {
      const stats = db.getServerStats();
      res.json({ success: true, stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // MULTIPLAYER ROOMS APP ENDPOINTS
  // ==========================================

  // Get active rooms
  app.get('/api/multiplayer/rooms', (req, res) => {
    try {
      const rooms = db.getRooms().filter(r => r.status === 'waiting' || r.status === 'full');
      const roomsWithUsernames = rooms.map(room => {
        const p1 = db.getUserById(room.player1_id);
        const p2 = room.player2_id ? db.getUserById(room.player2_id) : null;
        return {
          ...room,
          player1_username: p1?.username || 'Unknown',
          player1_level: p1?.level || 1,
          player2_username: p2?.username || null,
          player2_level: p2?.level || null,
        };
      });
      res.json({ success: true, rooms: roomsWithUsernames });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create active joinable room
  app.post('/api/multiplayer/rooms/create', (req, res) => {
    try {
      const { roomName, password, userId, isPrivate, boardSkin } = req.body;
      if (!userId || !roomName) {
        return res.status(400).json({ success: false, error: 'User Node & Room name are required' });
      }

      // Check if room name exists
      const existing = db.getRooms().find(r => r.roomName.toLowerCase() === roomName.toLowerCase() && r.status !== 'finished');
      if (existing) {
        return res.status(400).json({ success: false, error: 'Nama room sudah terpakai!' });
      }

      const room = db.createRoom(roomName, userId, password, isPrivate, boardSkin);
      res.status(201).json({ success: true, room });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Join a room (validates password & capacity limits)
  app.post('/api/multiplayer/rooms/join', (req, res) => {
    try {
      const { roomName, password, userId } = req.body;
      if (!userId || !roomName) {
        return res.status(400).json({ success: false, error: 'User Node & Room name are required' });
      }

      const room = db.getRooms().find(r => r.roomName.toLowerCase() === roomName.toLowerCase() && r.status !== 'finished');
      if (!room) {
        return res.status(404).json({ success: false, error: 'Room tidak ditemukan!' });
      }

      if (room.status === 'playing' || room.status === 'finished' || (room.player2_id && room.player1_id !== userId && room.player2_id !== userId)) {
        return res.status(400).json({ success: false, error: 'Ruangan sudah penuh atau sedang bermain!' });
      }

      // If user is already player1, don't validate password again
      if (room.player1_id !== userId) {
        if (room.isPrivate && room.password && room.password !== password) {
          return res.status(400).json({ success: false, error: 'Password salah!' });
        }
        
        // Update player 2
        db.updateRoom(room.id, {
          player2_id: userId,
          status: 'full'
        });
      }

      res.json({ success: true, room: db.getRoomById(room.id) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Random Match Quick Queueing
  app.post('/api/multiplayer/rooms/queue', (req, res) => {
    try {
      const { userId, boardSkin } = req.body;
      if (!userId) {
        return res.status(400).json({ success: false, error: 'User Node is required' });
      }

      // 1. Check if there exists an open, public room that is waiting
      const openRoom = db.getRooms().find(r => !r.isPrivate && r.status === 'waiting' && r.player1_id !== userId);
      if (openRoom) {
        db.updateRoom(openRoom.id, {
          player2_id: userId,
          status: 'full'
        });
        return res.json({ success: true, room: db.getRoomById(openRoom.id), role: 'p2' });
      }

      // 2. If no available rooms: create a public random match room
      const randomName = 'QuickMatch_' + Math.random().toString(36).substring(2, 6).toUpperCase();
      const newRoom = db.createRoom(randomName, userId, undefined, false, boardSkin || 'board_neon');
      res.json({ success: true, room: newRoom, role: 'p1' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // WEBSOCKET MULTIPLAYER SYNCHRONIZATION

  // ==========================================

  const wss = new WebSocketServer({ noServer: true });
  
  // High performance in-memory active games
  const activeGames: Map<string, LiveGameState> = new Map();
  // Map connected websockets to users
  const connectedSockets: Map<string, CustomWebSocket> = new Map();

  server.on('upgrade', (request, socket, head) => {
    const pathname = request.url;
    if (pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Initialize new game setup on standard parameters
  function initGame(gameId: string, player1Id: string, boardSkin: string): LiveGameState {
    const user = db.getUserById(player1Id);
    return {
      gameId,
      player1: {
        id: player1Id,
        username: user?.username || 'Player 1',
        level: user?.level || 1,
        pos: { x: 375, y: 850 }, // standard bottom center
        score: 0,
        color: '#00ffff',
        ready: false
      },
      player2: null,
      puck: {
        pos: { x: 375, y: 500 }, // clean center
        vel: { x: 0, y: 0 }
      },
      status: 'lobby',
      boardSkin: boardSkin || 'board_neon',
      lastUpdated: Date.now()
    };
  }

  // Initialize game state directly from relational room state
  function initGameFromRoom(roomId: string): LiveGameState {
    const room = db.getRoomById(roomId);
    if (!room) {
      throw new Error("Room not found in relational database schema.");
    }
    const u1 = db.getUserById(room.player1_id);
    const u2 = room.player2_id ? db.getUserById(room.player2_id) : null;
    return {
      gameId: room.id,
      roomName: room.roomName,
      isPrivate: room.isPrivate,
      player1: {
        id: room.player1_id,
        username: u1?.username || 'Host',
        level: u1?.level || 1,
        pos: { x: 375, y: 850 },
        score: 0,
        color: '#00ffff',
        ready: room.player1_ready,
        activePaddleSkin: u1?.activePaddleSkin || 'paddle_cyan',
        activeBoardSkin: u1?.activeBoardSkin || 'board_neon'
      },
      player2: room.player2_id ? {
        id: room.player2_id,
        username: u2?.username || 'Opponent',
        level: u2?.level || 1,
        pos: { x: 375, y: 150 },
        score: 0,
        color: '#39ff14',
        ready: room.player2_ready,
        activePaddleSkin: u2?.activePaddleSkin || 'paddle_cyan',
        activeBoardSkin: u2?.activeBoardSkin || 'board_neon'
      } : null,
      puck: {
        pos: { x: 375, y: 500 },
        vel: { x: 0, y: 0 }
      },
      status: room.status === 'playing' ? 'playing' : 'lobby',
      boardSkin: room.boardSkin || 'board_neon',
      lastUpdated: Date.now()
    };
  }

  // Authoritative server-side high refresh rate puck physics loop
  function startGamePhysicsLoop(gameId: string) {
    const tickRateMs = 16; // ~60fps calculations
    let interval = setInterval(() => {
      const g = activeGames.get(gameId);
      if (!g || (g.status !== 'active' && g.status !== 'playing')) {
        clearInterval(interval);
        return;
      }

      let puck = g.puck;
      
      // Update coordinates
      puck.pos.x += puck.vel.x;
      puck.pos.y += puck.vel.y;

      // Decay velocity slightly (friction)
      puck.vel.x *= 0.99;
      puck.vel.y *= 0.99;

      // Arena constraints: width = 750, height = 1000
      const puckRadius = 18;
      const margin = 0;

      // Bounce off lateral left / right walls
      if (puck.pos.x - puckRadius <= margin) {
        puck.pos.x = margin + puckRadius;
        puck.vel.x = -puck.vel.x * 0.9; // bounce elasticity
      } else if (puck.pos.x + puckRadius >= 750 - margin) {
        puck.pos.x = 750 - margin - puckRadius;
        puck.vel.x = -puck.vel.x * 0.9;
      }

      // Check goals or top/bottom walls (goal opening is between X: 250 and X: 500)
      const goalMinX = 250;
      const goalMaxX = 500;

      // Top wall / Player 2 Goal
      if (puck.pos.y - puckRadius <= margin) {
        if (puck.pos.x >= goalMinX && puck.pos.x <= goalMaxX) {
          // Goal Player 1 scored!
          if (g.player1) g.player1.score += 1;
          resetPuck(g);
          broadcastGameUpdate(gameId);
          checkGameOver(gameId);
          return;
        } else {
          puck.pos.y = margin + puckRadius;
          puck.vel.y = -puck.vel.y * 0.9;
        }
      }

      // Bottom wall / Player 1 Goal
      if (puck.pos.y + puckRadius >= 1000 - margin) {
        if (puck.pos.x >= goalMinX && puck.pos.x <= goalMaxX) {
          // Goal Player 2 scored!
          if (g.player2) g.player2.score += 1;
          resetPuck(g);
          broadcastGameUpdate(gameId);
          checkGameOver(gameId);
          return;
        } else {
          puck.pos.y = 1000 - margin - puckRadius;
          puck.vel.y = -puck.vel.y * 0.9;
        }
      }

      // Handle paddle collisions
      const paddleRadius = 30;
      
      // P1 Paddle Collision
      if (g.player1) {
        const dx = puck.pos.x - g.player1.pos.x;
        const dy = puck.pos.y - g.player1.pos.y;
        const dist = Math.hypot(dx, dy);
        const minDist = puckRadius + paddleRadius;

        if (dist < minDist) {
          // Push puck out of paddle
          const angle = Math.atan2(dy, dx);
          puck.pos.x = g.player1.pos.x + Math.cos(angle) * minDist;
          puck.pos.y = g.player1.pos.y + Math.sin(angle) * minDist;

          // Transfer paddle velocity
          const impulse = 6;
          puck.vel.x = Math.cos(angle) * impulse + (Math.random() - 0.5) * 1.5;
          puck.vel.y = Math.sin(angle) * impulse + (Math.random() - 0.5) * 1.5;
        }
      }

      // P2 Paddle Collision
      if (g.player2) {
        const dx = puck.pos.x - g.player2.pos.x;
        const dy = puck.pos.y - g.player2.pos.y;
        const dist = Math.hypot(dx, dy);
        const minDist = puckRadius + paddleRadius;

        if (dist < minDist) {
          const angle = Math.atan2(dy, dx);
          puck.pos.x = g.player2.pos.x + Math.cos(angle) * minDist;
          puck.pos.y = g.player2.pos.y + Math.sin(angle) * minDist;

          const impulse = 6;
          puck.vel.x = Math.cos(angle) * impulse + (Math.random() - 0.5) * 1.5;
          puck.vel.y = Math.sin(angle) * impulse + (Math.random() - 0.5) * 1.5;
        }
      }

      g.lastUpdated = Date.now();
      broadcastGameUpdate(gameId);
    }, tickRateMs);
  }

  function resetPuck(game: LiveGameState) {
    game.puck.pos = { x: 375, y: 500 };
    // Launch slow starting vector
    game.puck.vel = {
      x: (Math.random() > 0.5 ? 2.5 : -2.5) + (Math.random() - 0.5),
      y: (Math.random() > 0.5 ? 4.5 : -4.5) + (Math.random() - 0.5)
    };
  }

  function broadcastGameUpdate(gameId: string) {
    const g = activeGames.get(gameId);
    if (!g) return;

    const payload = JSON.stringify({
      type: 'game_state',
      game: g
    });

    // Send to all occupants
    wss.clients.forEach((client: CustomWebSocket) => {
      if (client.gameId === gameId && client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  function broadcastLobbyUpdate(gameId: string) {
    const g = activeGames.get(gameId);
    if (!g) return;

    const payload = JSON.stringify({
      type: 'lobby_update',
      game: g
    });

    wss.clients.forEach((client: CustomWebSocket) => {
      if (client.gameId === gameId && client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  function checkGameOver(gameId: string) {
    const g = activeGames.get(gameId);
    if (!g) return;

    const winningScore = 5;
    if ((g.player1 && g.player1.score >= winningScore) || (g.player2 && g.player2.score >= winningScore)) {
      g.status = 'finished';
      db.updateRoom(gameId, { status: 'finished' });
      
      const winnerId = (g.player1 && g.player1.score >= winningScore) ? g.player1.id : g.player2!.id;
      g.winnerId = winnerId;

      // Broadcast game over event
      const payload = JSON.stringify({
        type: 'game_over',
        game: g,
        winnerId
      });

      // Update their records in database with reward
      const loserId = winnerId === g.player1?.id ? g.player2?.id : g.player1?.id;
      
      if (winnerId) {
        db.addMatchRecord(winnerId, {
          opponentName: (winnerId === g.player1?.id ? g.player2?.username : g.player1?.username) || 'Player',
          mode: 'multiplayer',
          playerRank: 'win',
          scoreSelf: winningScore,
          scoreOpponent: (winnerId === g.player1?.id ? g.player2?.score : g.player1?.score) || 0,
          expEarned: 40,
          currencyEarned: 50
        });
      }

      if (loserId) {
        db.addMatchRecord(loserId, {
          opponentName: (loserId === g.player1?.id ? g.player2?.username : g.player1?.username) || 'Player',
          mode: 'multiplayer',
          playerRank: 'loss',
          scoreSelf: (loserId === g.player1?.id ? g.player1?.score : g.player2?.score) || 0,
          scoreOpponent: winningScore,
          expEarned: 15,
          currencyEarned: 15
        });
      }

      wss.clients.forEach((client: CustomWebSocket) => {
        if (client.gameId === gameId && client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });

      // Clean up game state cache
      activeGames.delete(gameId);
    }
  }

  wss.on('connection', (ws: CustomWebSocket) => {
    ws.isAlive = true;
    
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        switch (data.type) {
          // Joining a specific room by its database ID
          case 'join_game': {
            const { userId, roomId } = data;
            if (!roomId) return;

            ws.userId = userId;
            ws.gameId = roomId;

            connectedSockets.set(userId, ws);

            let liveGame = activeGames.get(roomId);
            if (!liveGame) {
              liveGame = initGameFromRoom(roomId);
              activeGames.set(roomId, liveGame);
            } else {
              // Ensure player2 object is synced in memory
              const room = db.getRoomById(roomId);
              if (room && room.player2_id && !liveGame.player2) {
                const u2 = db.getUserById(room.player2_id);
                liveGame.player2 = {
                  id: room.player2_id,
                  username: u2?.username || 'Opponent',
                  level: u2?.level || 1,
                  pos: { x: 375, y: 150 },
                  score: 0,
                  color: '#39ff14',
                  ready: room.player2_ready,
                  activePaddleSkin: u2?.activePaddleSkin || 'paddle_cyan',
                  activeBoardSkin: u2?.activeBoardSkin || 'board_neon'
                };
              }
            }

            // Acknowledge connect role back to caller
            const myRole = userId === liveGame.player1?.id ? 'p1' : 'p2';
            ws.send(JSON.stringify({
              type: 'lobby_update',
              game: liveGame,
              role: myRole
            }));

            // Sync other sockets
            broadcastLobbyUpdate(roomId);
            break;
          }

          // Ready flag toggling
          case 'toggle_ready': {
            const { gameId, userId, ready } = data;
            const liveGame = activeGames.get(gameId);
            if (!liveGame) return;

            if (liveGame.player1 && liveGame.player1.id === userId) {
              liveGame.player1.ready = ready;
              db.updateRoom(gameId, { player1_ready: ready });
            } else if (liveGame.player2 && liveGame.player2.id === userId) {
              liveGame.player2.ready = ready;
              db.updateRoom(gameId, { player2_ready: ready });
            }

            liveGame.lastUpdated = Date.now();

            // Settle ready condition check
            if (liveGame.player1 && liveGame.player2 && liveGame.player1.ready && liveGame.player2.ready) {
              liveGame.status = 'playing';
              db.updateRoom(gameId, { status: 'playing' });
              resetPuck(liveGame);

              // Broadcast standard match start
              wss.clients.forEach((client: CustomWebSocket) => {
                if (client.gameId === gameId && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'match_started',
                    game: liveGame,
                    role: client.userId === liveGame.player1?.id ? 'p1' : 'p2'
                  }));
                }
              });

              startGamePhysicsLoop(gameId);
            } else {
              broadcastLobbyUpdate(gameId);
            }
            break;
          }

          // Active paddle dynamic coordinate sync
          case 'move_paddle': {
            const { gameId, role, x, y } = data;
            const liveGame = activeGames.get(gameId);
            if (!liveGame || (liveGame.status !== 'active' && liveGame.status !== 'playing')) return;

            if (role === 'p1' && liveGame.player1) {
              // Restrict player 1 paddle coordinates to lower arena hemifield (y: 500 to 1000)
              liveGame.player1.pos.x = Math.max(30, Math.min(720, x));
              liveGame.player1.pos.y = Math.max(505, Math.min(970, y));
            } else if (role === 'p2' && liveGame.player2) {
              // Restrict player 2 paddle coordinates to upper arena hemifield (y: 0 to 495)
              liveGame.player2.pos.x = Math.max(30, Math.min(720, x));
              liveGame.player2.pos.y = Math.max(30, Math.min(495, y));
            }

            liveGame.lastUpdated = Date.now();
            broadcastGameUpdate(gameId);
            break;
          }

          case 'leave_game': {
            handleClientDisconnect(ws);
            break;
          }
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      handleClientDisconnect(ws);
    });
  });

  function handleClientDisconnect(ws: CustomWebSocket) {
    if (!ws.gameId || !ws.userId) return;

    const gameId = ws.gameId;
    const userId = ws.userId;
    const g = activeGames.get(gameId);
    
    if (g) {
      if (g.status === 'lobby' || g.status === 'waiting') {
        if (userId === g.player1?.id) {
          // Creator left. dismantle is required!
          db.updateRoom(gameId, { status: 'finished' });
          
          wss.clients.forEach((client: CustomWebSocket) => {
            if (client.gameId === gameId && client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'lobby_host_left',
                message: 'Host left the lobby. The room is now dismantled.'
              }));
            }
          });
          activeGames.delete(gameId);
        } else if (g.player2 && userId === g.player2.id) {
          // Guest left. reset room status to waiting
          g.player2 = null;
          g.lastUpdated = Date.now();

          db.updateRoom(gameId, {
            player2_id: null,
            player2_ready: false,
            status: 'waiting'
          });

          // Inform Host
          broadcastLobbyUpdate(gameId);
        }
      } else if (g.status === 'playing' || g.status === 'active') {
        g.status = 'finished';
        db.updateRoom(gameId, { status: 'finished' });
        
        const remainingUser = userId === g.player1?.id ? g.player2 : g.player1;

        if (remainingUser) {
          // Disconnection win
          db.addMatchRecord(remainingUser.id, {
            opponentName: 'Desynced Opponent',
            mode: 'multiplayer',
            playerRank: 'win',
            scoreSelf: 5,
            scoreOpponent: 0,
            expEarned: 30,
            currencyEarned: 35
          });

          wss.clients.forEach((client: CustomWebSocket) => {
            if (client.gameId === gameId && client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'opponent_disconnected',
                game: g,
                winnerId: remainingUser.id
              }));
            }
          });
        }
        
        activeGames.delete(gameId);
      }
    }

    connectedSockets.delete(userId);
  }

  // Ping interval for active websocket connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws: CustomWebSocket) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  // ==========================================
  // VITE DEV / PRODUCTION DIRECT ROUTING
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexkey Hybrid Server loaded and routing on http://0.0.0.0:${PORT}`);
  });
}

startServer();
