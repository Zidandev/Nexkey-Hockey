import fs from 'fs';
import path from 'path';
import { User, UserRole, ShopItem, UserInventory, PlayerStats, MatchHistory, LobbyRoom } from '../../src/types';

const DB_DIR = path.join(process.cwd(), 'data');

// Standard databases
interface DBState {
  users: User[];
  shopItems: ShopItem[];
  inventory: UserInventory[];
  stats: PlayerStats[];
  matchHistory: MatchHistory[];
  rooms: LobbyRoom[];
}

class RelationalDatabase {
  private state!: DBState;
  private dbPath = path.join(DB_DIR, 'db.json');

  constructor() {
    this.ensureDirectory();
    this.load();
    this.seedDefaults();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private load() {
    if (fs.existsSync(this.dbPath)) {
      try {
        const fileContent = fs.readFileSync(this.dbPath, 'utf8');
        this.state = JSON.parse(fileContent);
        if (!this.state.rooms) {
          this.state.rooms = [];
        }
      } catch (err) {
        console.error('Failed to load database, recreating...', err);
        this.resetState();
      }
    } else {
      this.resetState();
    }
  }

  private resetState() {
    this.state = {
      users: [],
      shopItems: [],
      inventory: [],
      stats: [],
      matchHistory: [],
      rooms: []
    };
    this.save();
  }

  private save() {
    try {
      this.ensureDirectory();
      fs.writeFileSync(this.dbPath, JSON.stringify(this.state, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save database to disk:', err);
    }
  }

  private seedDefaults() {
    let changed = false;

    // Seed default shop items if empty
    if (this.state.shopItems.length === 0) {
      const defaultItems: ShopItem[] = [
        { id: 'paddle_cyan', name: 'Cyan Flare Paddle', category: 'paddle', cost: 0, styleValue: '#00ffff', description: 'Default glowing cyan paddle.', unlockedByDefault: true },
        { id: 'paddle_green', name: 'Green Matrix Paddle', category: 'paddle', cost: 150, styleValue: '#39ff14', description: 'Glowing retro matrix neon green paddle.' },
        { id: 'paddle_purple', name: 'Purple Nebula Paddle', category: 'paddle', cost: 300, styleValue: '#bd00ff', description: 'Deep purple cosmic energy emission paddle.' },
        { id: 'paddle_crimson', name: 'Crimson Fire Paddle', category: 'paddle', cost: 500, styleValue: '#ff003c', description: 'Fierce cybernetic plasma red paddle.' },
        
        { id: 'board_neon', name: 'Neon Grid Arena', category: 'board', cost: 0, styleValue: 'grid', description: 'Default cybergrid neon playfield.', unlockedByDefault: true },
        { id: 'board_matrix', name: 'Cyber Matrix Arena', category: 'board', cost: 250, styleValue: 'matrix', description: 'Chrono-digital rain backdrop with a toxic grid.' },
        { id: 'board_vapor', name: 'Vaporwave Dusk Arena', category: 'board', cost: 400, styleValue: 'vaporwave', description: 'Retro synthwave aesthetic with a magenta grid.' },
        { id: 'board_solar', name: 'Solar Flare Arena', category: 'board', cost: 600, styleValue: 'solar', description: 'Thermal solar flare overlay on obsidian grid.' }
      ];
      this.state.shopItems = defaultItems;
      changed = true;
    }

    // Seed default admin and players if empty
    if (this.state.users.length === 0) {
      // 1. Admin
      const adminId = 'user_admin';
      const admin: User = {
        id: adminId,
        username: 'Admin',
        email: 'admin@nexkey.com',
        role: UserRole.ADMIN,
        level: 5,
        exp: 250,
        maxExp: 1000,
        currency: 1200,
        activePaddleSkin: 'paddle_cyan',
        activeBoardSkin: 'board_neon',
        isBanned: false,
        createdAt: new Date().toISOString(),
        bio: 'Central Grid Administrator. Compiling the Nexkey system matrices.',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Admin'
      };
      this.state.users.push(admin);

      // Seed stats for admin
      this.state.stats.push({
        userId: adminId,
        totalMatches: 8,
        totalWins: 6,
        totalLosses: 2,
        winRate: 75
      });

      // Add default owned inventory items
      this.state.inventory.push({ userId: adminId, itemId: 'paddle_cyan' });
      this.state.inventory.push({ userId: adminId, itemId: 'board_neon' });

      // 2. Player
      const playerId = 'user_player';
      const player: User = {
        id: playerId,
        username: 'NeonRider',
        email: 'rider@nexkey.dev',
        role: UserRole.PLAYER,
        level: 1,
        exp: 20,
        maxExp: 100,
        currency: 80,
        activePaddleSkin: 'paddle_cyan',
        activeBoardSkin: 'board_neon',
        isBanned: false,
        createdAt: new Date().toISOString(),
        bio: 'High-frequency drift competitor. Speed of light reflexes.',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=NeonRider'
      };
      this.state.users.push(player);

      this.state.stats.push({
        userId: playerId,
        totalMatches: 3,
        totalWins: 1,
        totalLosses: 2,
        winRate: 33
      });

      this.state.inventory.push({ userId: playerId, itemId: 'paddle_cyan' });
      this.state.inventory.push({ userId: playerId, itemId: 'board_neon' });

      // Add match history items for flavor
      this.state.matchHistory.push({
        id: 'match_1',
        userId: playerId,
        opponentName: 'AI (Light)',
        mode: 'ai',
        playerRank: 'loss',
        scoreSelf: 3,
        scoreOpponent: 5,
        expEarned: 10,
        currencyEarned: 10,
        playedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }, {
        id: 'match_2',
        userId: playerId,
        opponentName: 'AI (Light)',
        mode: 'ai',
        playerRank: 'win',
        scoreSelf: 5,
        scoreOpponent: 2,
        expEarned: 25,
        currencyEarned: 30,
        playedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }, {
        id: 'match_3',
        userId: playerId,
        opponentName: 'AI (Medium)',
        mode: 'ai',
        playerRank: 'loss',
        scoreSelf: 1,
        scoreOpponent: 5,
        expEarned: 10,
        currencyEarned: 10,
        playedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      });

      changed = true;
    }

    if (changed) {
      this.save();
    }
  }

  // --- QUERY ORM FUNCTIONS ---

  getUsers(): User[] {
    return this.state.users;
  }

  getUserById(id: string): User | undefined {
    return this.state.users.find(u => u.id === id);
  }

  getUserByUsername(username: string): User | undefined {
    if (!username) return undefined;
    return this.state.users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase());
  }

  getUserByEmail(email: string): User | undefined {
    if (!email) return undefined;
    return this.state.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(username: string, email: string, role = UserRole.PLAYER): User {
    const defaultUser: User = {
      id: 'user_' + Math.random().toString(36).substring(2, 9),
      username: username || '',
      email: email || (username ? `${username.toLowerCase()}@nexkey.dev` : ''),
      role,
      level: 1,
      exp: 0,
      maxExp: 100,
      currency: 100, // starting gift
      activePaddleSkin: 'paddle_cyan',
      activeBoardSkin: 'board_neon',
      isBanned: false,
      createdAt: new Date().toISOString()
    };
    this.state.users.push(defaultUser);

    // Initial Inventory (free default items)
    this.state.inventory.push({ userId: defaultUser.id, itemId: 'paddle_cyan' });
    this.state.inventory.push({ userId: defaultUser.id, itemId: 'board_neon' });

    // Initial stats
    this.state.stats.push({
      userId: defaultUser.id,
      totalMatches: 0,
      totalWins: 0,
      totalLosses: 0,
      winRate: 0
    });

    this.save();
    return defaultUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const user = this.getUserById(id);
    if (!user) return null;

    Object.assign(user, updates);
    this.save();
    return user;
  }

  deleteUser(id: string): boolean {
    const index = this.state.users.findIndex(u => u.id === id);
    if (index === -1) return false;

    this.state.users.splice(index, 1);
    this.state.stats = this.state.stats.filter(s => s.userId !== id);
    this.state.inventory = this.state.inventory.filter(i => i.userId !== id);
    this.state.matchHistory = this.state.matchHistory.filter(m => m.userId !== id);
    
    this.save();
    return true;
  }

  getStatsByUserId(userId: string): PlayerStats {
    let stat = this.state.stats.find(s => s.userId === userId);
    if (!stat) {
      stat = {
        userId,
        totalMatches: 0,
        totalWins: 0,
        totalLosses: 0,
        winRate: 0
      };
      this.state.stats.push(stat);
      this.save();
    }
    return stat;
  }

  getMatchHistoryByUserId(userId: string): MatchHistory[] {
    return this.state.matchHistory
      .filter(m => m.userId === userId)
      .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
  }

  addMatchRecord(userId: string, record: Omit<MatchHistory, 'id' | 'userId' | 'playedAt'>): MatchHistory {
    const history: MatchHistory = {
      ...record,
      id: 'match_' + Math.random().toString(36).substring(2, 9),
      userId,
      playedAt: new Date().toISOString()
    };
    
    this.state.matchHistory.push(history);

    // Update Player Stats
    const stats = this.getStatsByUserId(userId);
    stats.totalMatches += 1;
    if (record.playerRank === 'win') {
      stats.totalWins += 1;
    } else {
      stats.totalLosses += 1;
    }
    stats.winRate = Math.round((stats.totalWins / stats.totalMatches) * 100);

    // Update Player Level / EXP and currency on User directly
    const user = this.getUserById(userId);
    if (user) {
      user.currency += record.currencyEarned;
      user.exp += record.expEarned;

      // Handle level up
      while (user.exp >= user.maxExp) {
        user.exp -= user.maxExp;
        user.level += 1;
        user.maxExp = Math.round(user.maxExp * 1.5); // Exponential leveling difficulty
      }
    }

    this.save();
    return history;
  }

  getShopItems(): ShopItem[] {
    return this.state.shopItems;
  }

  getInventoryByUserId(userId: string): string[] {
    return this.state.inventory
      .filter(inv => inv.userId === userId)
      .map(inv => inv.itemId);
  }

  buyShopItem(userId: string, itemId: string): { success: boolean; error?: string } {
    const user = this.getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };

    const item = this.state.shopItems.find(i => i.id === itemId);
    if (!item) return { success: false, error: 'Item not found' };

    const owned = this.getInventoryByUserId(userId);
    if (owned.includes(itemId)) {
      return { success: false, error: 'Item already purchased' };
    }

    if (user.currency < item.cost) {
      return { success: false, error: 'Insufficient credits' };
    }

    // Purchase transaction
    user.currency -= item.cost;
    this.state.inventory.push({ userId, itemId });
    this.save();

    return { success: true };
  }

  equipSkin(userId: string, itemId: string): { success: boolean; error?: string } {
    const user = this.getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };

    const item = this.state.shopItems.find(i => i.id === itemId);
    if (!item) return { success: false, error: 'Item not found' };

    const owned = this.getInventoryByUserId(userId);
    if (!owned.includes(itemId)) {
      return { success: false, error: 'You do not own this skin' };
    }

    if (item.category === 'paddle') {
      user.activePaddleSkin = itemId;
    } else if (item.category === 'board') {
      user.activeBoardSkin = itemId;
    }

    this.save();
    return { success: true };
  }

  getServerStats() {
    const usersCount = this.state.users.length;
    const adminCount = this.state.users.filter(u => u.role === UserRole.ADMIN).length;
    const playerCount = usersCount - adminCount;
    const bannedCount = this.state.users.filter(u => u.isBanned).length;
    const totalMatchesPlayed = this.state.matchHistory.length;
    
    // Total credits in server economy
    const totalCredits = this.state.users.reduce((sum, u) => sum + u.currency, 0);

    return {
      usersCount,
      adminCount,
      playerCount,
      bannedCount,
      totalMatchesPlayed,
      totalCredits
    };
  }

  // --- ROOM MANAGEMENT SCHEMAS ---

  getRooms(): LobbyRoom[] {
    return this.state.rooms || [];
  }

  getRoomById(id: string): LobbyRoom | undefined {
    return this.getRooms().find(r => r.id === id);
  }

  getRoomByName(roomName: string): LobbyRoom | undefined {
    return this.getRooms().find(r => r.roomName.toLowerCase() === r.roomName.toLowerCase() && r.status !== 'finished');
  }

  createRoom(roomName: string, player1_id: string, password?: string, isPrivate = false, boardSkin = 'board_neon'): LobbyRoom {
    const newRoom: LobbyRoom = {
      id: 'room_' + Math.random().toString(36).substring(2, 9),
      roomName,
      password: password || undefined,
      player1_id,
      player2_id: null,
      player1_ready: false,
      player2_ready: false,
      status: 'waiting',
      isPrivate,
      boardSkin,
      createdAt: new Date().toISOString()
    };
    if (!this.state.rooms) {
      this.state.rooms = [];
    }
    this.state.rooms.push(newRoom);
    this.save();
    return newRoom;
  }

  updateRoom(id: string, updates: Partial<LobbyRoom>): LobbyRoom | null {
    const room = this.getRoomById(id);
    if (!room) return null;
    Object.assign(room, updates);
    this.save();
    return room;
  }

  deleteRoom(id: string): boolean {
    if (!this.state.rooms) return false;
    const index = this.state.rooms.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.state.rooms.splice(index, 1);
    this.save();
    return true;
  }
}

export const db = new RelationalDatabase();
