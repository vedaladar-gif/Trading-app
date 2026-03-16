import { supabase } from './supabaseClient';

// ==========================================
// Types
// ==========================================

export interface User {
    id: string; // Supabase auth user id (UUID)
    username: string;
    cash: number;
    created_at: string | null;
}

export interface Trade {
    id: number;
    user_id: string;
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
    user_id: string;
    role: string;
    content: string;
    mode: string;
    route: string | null;
    created_at: string;
}

// ==========================================
// User / Profile Functions
// ==========================================

export async function getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, cash, created_at')
        .eq('id', userId)
        .maybeSingle();
    if (error) {
        console.error('getUserById error:', error);
        return null;
    }
    return (data as User | null) ?? null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, cash, created_at')
        .eq('username', username)
        .maybeSingle();
    if (error) {
        console.error('getUserByUsername error:', error);
        return null;
    }
    return (data as User | null) ?? null;
}

export async function createProfile(userId: string, username: string, startingCash: number): Promise<User | null> {
    const { data, error } = await supabase
        .from('profiles')
        .insert({
            id: userId,
            username,
            cash: startingCash,
        })
        .select('id, username, cash, created_at')
        .maybeSingle();

    if (error) {
        console.error('createProfile error:', error);
        return null;
    }

    return data as User | null;
}

export async function updateUserCash(userId: string, newCash: number): Promise<void> {
    const { error } = await supabase
        .from('profiles')
        .update({ cash: newCash })
        .eq('id', userId);
    if (error) {
        console.error('updateUserCash error:', error);
    }
}

export async function deleteUserAccount(userId: string): Promise<boolean> {
    // Deleting from auth.users will cascade to profiles (and related tables) via FK
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
        console.error('deleteUserAccount error:', error);
        return false;
    }
    return true;
}

// ==========================================
// Trade / Portfolio Functions
// ==========================================

export async function addTrade(userId: string, stock: string, shares: number, price: number, action: string): Promise<void> {
    const { error } = await supabase.from('portfolio').insert({
        user_id: userId,
        stock,
        shares,
        price,
        action,
    });
    if (error) {
        console.error('addTrade error:', error);
    }
}

export async function getUserTrades(userId: string): Promise<Trade[]> {
    const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) {
        console.error('getUserTrades error:', error);
        return [];
    }
    return (data as Trade[]) ?? [];
}

export async function getHoldings(userId: string): Promise<Holding[]> {
    const { data, error } = await supabase
        .from('portfolio')
        .select('stock, shares, action')
        .eq('user_id', userId);

    if (error) {
        console.error('getHoldings error:', error);
        return [];
    }

    const map = new Map<string, number>();
    for (const row of data as { stock: string; shares: number; action: string }[]) {
        const sign = row.action === 'BUY' ? 1 : -1;
        map.set(row.stock, (map.get(row.stock) ?? 0) + sign * row.shares);
    }

    return Array.from(map.entries())
        .filter(([, shares]) => shares > 0)
        .map(([stock, shares]) => ({ stock, shares }));
}

export async function getUserCash(userId: string): Promise<number> {
    const { data, error } = await supabase
        .from('profiles')
        .select('cash')
        .eq('id', userId)
        .maybeSingle<{ cash: number }>();
    if (error || !data) return 0.0;
    return data.cash ?? 0.0;
}

// ==========================================
// Chat Functions
// ==========================================

export async function addChatMessage(userId: number, role: string, content: string, mode: string, route?: string): Promise<void> {
    const { error } = await supabase.from('chat_messages').insert({
        user_id: userId,
        role,
        content,
        mode,
        route: route || null,
    });
    if (error) {
        console.error('addChatMessage error:', error);
    }
}

export async function getChatHistory(
    userId: number,
    mode: string,
    limit = 20
): Promise<{ role: string; content: string; created_at: string }[]> {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('role, content, created_at')
        .eq('user_id', userId)
        .eq('mode', mode)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error || !data) {
        if (error) console.error('getChatHistory error:', error);
        return [];
    }

    return (data as { role: string; content: string; created_at: string }[]).reverse();
}
