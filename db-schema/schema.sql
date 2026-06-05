-- ==========================================
-- SQL Relational Database Schema for "Nexkey"
-- Theme: Nexus Neon Space / Matrix
-- Target DBMS: MySQL / PostgreSQL
-- Credits by Zidandev
-- ==========================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) DEFAULT 'player' CHECK (role IN ('admin', 'player')),
    level INT DEFAULT 1,
    exp INT DEFAULT 0,
    max_exp INT DEFAULT 100,
    currency INT DEFAULT 100,
    active_paddle_skin VARCHAR(50) DEFAULT 'paddle_cyan',
    active_board_skin VARCHAR(50) DEFAULT 'board_neon',
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Create Shop Items Table
CREATE TABLE IF NOT EXISTS shop_items (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('paddle', 'board')),
    cost INT DEFAULT 0,
    style_value VARCHAR(100) NOT NULL,
    description TEXT,
    unlocked_by_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create User Inventory Table
CREATE TABLE IF NOT EXISTS user_inventories (
    user_id VARCHAR(50) NOT NULL,
    item_id VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, item_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES shop_items(id) ON DELETE CASCADE
);

-- 4. Create Player Statistics Table
CREATE TABLE IF NOT EXISTS player_statistics (
    user_id VARCHAR(50) PRIMARY KEY,
    total_matches INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    total_losses INT DEFAULT 0,
    win_rate INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Create Match History Table
CREATE TABLE IF NOT EXISTS match_histories (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    opponent_name VARCHAR(100) NOT NULL,
    mode VARCHAR(20) NOT NULL CHECK (mode IN ('ai', 'multiplayer')),
    player_rank VARCHAR(10) NOT NULL CHECK (player_rank IN ('win', 'loss')),
    score_self INT DEFAULT 0,
    score_opponent INT DEFAULT 0,
    exp_earned INT DEFAULT 0,
    currency_earned INT DEFAULT 0,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Create Games Table (For Caching Real-time Coordinates/State as requested)
CREATE TABLE IF NOT EXISTS live_games (
    game_id VARCHAR(50) PRIMARY KEY,
    player1_id VARCHAR(50) NULL,
    player2_id VARCHAR(50) NULL,
    puck_x DOUBLE PRECISION NOT NULL,
    puck_y DOUBLE PRECISION NOT NULL,
    puck_vx DOUBLE PRECISION NOT NULL,
    puck_vy DOUBLE PRECISION NOT NULL,
    player1_x DOUBLE PRECISION NOT NULL,
    player1_y DOUBLE PRECISION NOT NULL,
    player2_x DOUBLE PRECISION NOT NULL,
    player2_y DOUBLE PRECISION NOT NULL,
    score1 INT DEFAULT 0,
    score2 INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
    winner_id VARCHAR(50) NULL,
    board_skin VARCHAR(50) DEFAULT 'board_neon',
    last_updated_at BIGINT NOT NULL
);

-- Indexes for performance & high-speed sub-millisecond querying
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_inventories_user_id ON user_inventories(user_id);
CREATE INDEX idx_match_histories_user_id ON match_histories(user_id);
CREATE INDEX idx_live_games_status ON live_games(status);
