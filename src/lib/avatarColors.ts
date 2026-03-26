export const AVATAR_GRADIENTS: Record<string, string> = {
    blue:   'linear-gradient(135deg, #4f6ef7, #6d8bff)',
    purple: 'linear-gradient(135deg, #9b5de5, #c084fc)',
    green:  'linear-gradient(135deg, #22c55e, #4ade80)',
    orange: 'linear-gradient(135deg, #f97316, #fb923c)',
    pink:   'linear-gradient(135deg, #ec4899, #f472b6)',
    teal:   'linear-gradient(135deg, #14b8a6, #2dd4bf)',
    red:    'linear-gradient(135deg, #ef4444, #f87171)',
    yellow: 'linear-gradient(135deg, #eab308, #facc15)',
};

export const AVATAR_COLOR_KEYS = Object.keys(AVATAR_GRADIENTS);

export function getAvatarGradient(color: string): string {
    return AVATAR_GRADIENTS[color] ?? AVATAR_GRADIENTS.blue;
}

/** Returns 1–2 uppercase initials from a username or display name. */
export function getInitials(username: string, displayName?: string | null): string {
    const raw = displayName?.trim() || username?.trim() || '?';
    // Strip email domain for legacy email-as-username
    const name = raw.includes('@') ? raw.split('@')[0] : raw;
    const parts = name.split(/[_.\s-]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
}

/** Returns true when the username is an email (legacy, needs real username). */
export function isEmailUsername(username: string | null | undefined): boolean {
    return !username || username.includes('@');
}

export const USERNAME_REGEX = /^[a-zA-Z0-9_.]{3,20}$/;
