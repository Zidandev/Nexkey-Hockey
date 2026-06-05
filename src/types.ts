export enum UserRole {
  ADMIN = 'admin',
  PLAYER = 'player'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  level: number;
  exp: number;
  maxExp: number;
  currency: number;
  activePaddleSkin: string; // ID of shop item
  activeBoardSkin: string;  // ID of shop item
  isBanned: boolean;
  createdAt: string;
  bio?: string;
  avatarUrl?: string;
}

export interface PlayerStats {
  userId: string;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  winRate: number; // percentage, e.g. 75
}

export interface MatchHistory {
  id: string;
  userId: string;
  opponentName: string;
  mode: 'ai' | 'multiplayer';
  playerRank: 'win' | 'loss';
  scoreSelf: number;
  scoreOpponent: number;
  expEarned: number;
  currencyEarned: number;
  playedAt: string;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'paddle' | 'board';
  cost: number;
  styleValue: string; // The CSS color/gradient or image-like description
  description: string;
  unlockedByDefault?: boolean;
}

export interface UserInventory {
  userId: string;
  itemId: string; // references ShopItem id
}

export interface GameCoordinates {
  x: number;
  y: number;
}

export interface LiveGameState {
  gameId: string;
  roomName?: string;
  password?: string;
  isPrivate?: boolean;
  player1: {
    id: string;
    username: string;
    level: number;
    pos: GameCoordinates;
    score: number;
    color: string;
    ready: boolean;
    activePaddleSkin?: string;
    activeBoardSkin?: string;
  } | null;
  player2: {
    id: string;
    username: string;
    level: number;
    pos: GameCoordinates;
    score: number;
    color: string;
    ready: boolean;
    activePaddleSkin?: string;
    activeBoardSkin?: string;
  } | null;
  puck: {
    pos: GameCoordinates;
    vel: GameCoordinates;
  };
  status: 'waiting' | 'lobby' | 'playing' | 'active' | 'finished';
  winnerId?: string;
  boardSkin: string; // Board skin style
  lastUpdated: number;
}

export interface LobbyRoom {
  id: string;
  roomName: string;
  password?: string;
  player1_id: string;
  player2_id: string | null;
  player1_ready: boolean;
  player2_ready: boolean;
  status: 'waiting' | 'full' | 'playing' | 'finished';
  isPrivate: boolean;
  boardSkin: string;
  createdAt: string;
}
