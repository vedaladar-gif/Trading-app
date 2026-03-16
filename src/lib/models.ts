import { getDb } from './db';
import bcrypt from 'bcryptjs';

// ==========================================
// Types
// ==========================================

export interface User {
    id: number;
    username: string;
    cash: number;
    created_at: string | null;
}

export interface Trade {
    id: number;
    user_id: number;
    stock: string;
    shares: number;
    price: number;
    action: string;
    created_at: string;
}

export interface Holding {
    stock: string;
    shares: number;
    current_price?: number;
    value?: number;
}

export interface ChatMessage {
    id: number;
    user_id: number;
    role: string;
    content: string;
    mode: string;
    route: string | null;
    created_at: string;
}

// ==========================================
// User Functions
// ==========================================

export function getUserById(userId: number): User | null {
    const db = getDb();
    const row = db.prepare('SELECT id, username, cash, created_at FROM users WHERE id = ?').get(userId) as User | undefined;
    return row || null;
}

export function getUserByUsername(username: string): User | null {
    const db = getDb();
    const row = db.prepare('SELECT id, username, cash, created_at FROM users WHERE username = ?').get(username) as User | undefined;
    return row || null;
}

export function createUser(username: string, password: string, startingCash: number): User | null {
    const db = getDb();
    const hash = bcrypt.hashSync(password, 10);
    try {
        const result = db.prepare(
            'INSERT INTO users (username, password, cash, created_at) VALUES (?, ?, ?, ?)'
        ).run(username, hash, startingCash, new Date().toISOString());
        return getUserById(result.lastInsertRowid as number);
    } catch {
        return null; // Username already taken (UNIQUE constraint)
    }
}

export function checkPassword(username: string, password: string): boolean {
    const db = getDb();
    const row = db.prepare('SELECT password FROM users WHERE username = ?').get(username) as { password: string } | undefined;
    if (!row) return false;
    return bcrypt.compareSync(password, row.password);
}

export function updateUserCash(userId: number, newCash: number): void {
    const db = getDb();
    db.prepare('UPDATE users SET cash = ? WHERE id = ?').run(newCash, userId);
}

export function deleteUserAccount(userId: number): boolean {
    const db = getDb();
    try {
        const deleteAll = db.transaction(() => {
            db.prepare('DELETE FROM chat_messages WHERE user_id = ?').run(userId);
            db.prepare('DELETE FROM portfolio WHERE user_id = ?').run(userId);
            db.prepare('DELETE FROM users WHERE id = ?').run(userId);
        });
        deleteAll();
        return true;
    } catch (e) {
        console.error('Error deleting account:', e);
        return false;
    }
}

// ==========================================
// Trade / Portfolio Functions
// ==========================================

export function addTrade(userId: number, stock: string, shares: number, price: number, action: string): void {
    const db = getDb();
    db.prepare(
        'INSERT INTO portfolio (user_id, stock, shares, price, action, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(userId, stock, shares, price, action, new Date().toISOString());
}

export function getUserTrades(userId: number): Trade[] {
    const db = getDb();
    return db.prepare('SELECT * FROM portfolio WHERE user_id = ? ORDER BY created_at DESC').all(userId) as Trade[];
}

export function getHoldings(userId: number): Holding[] {
    const db = getDb();
    return db.prepare(`
    SELECT stock, SUM(CASE WHEN action='BUY' THEN shares ELSE -shares END) as shares
    FROM portfolio WHERE user_id = ? GROUP BY stock HAVING shares > 0
  `).all(userId) as Holding[];
}

export function getUserCash(userId: number): number {
    const db = getDb();
    const row = db.prepare('SELECT cash FROM users WHERE id = ?').get(userId) as { cash: number } | undefined;
    return row?.cash ?? 0.0;
}

// ==========================================
// Chat Functions
// ==========================================

export function addChatMessage(userId: number, role: string, content: string, mode: string, route?: string): void {
    const db = getDb();
    db.prepare(
        'INSERT INTO chat_messages (user_id, role, content, mode, route, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(userId, role, content, mode, route || null, new Date().toISOString());
}

export function getChatHistory(userId: number, mode: string, limit = 20): { role: string; content: string; created_at: string }[] {
    const db = getDb();
    const rows = db.prepare(
        'SELECT role, content, created_at FROM chat_messages WHERE user_id = ? AND mode = ? ORDER BY created_at DESC LIMIT ?'
    ).all(userId, mode, limit) as { role: string; content: string; created_at: string }[];
    return rows.reverse();
}
