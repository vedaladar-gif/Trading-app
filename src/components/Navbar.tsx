'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import VLogo from './VLogo';

export default function Navbar() {
    const [authenticated, setAuthenticated] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Pages that have their own nav (trading dashboard, learning)
    const selfNavPages = ['/trade', '/learn'];
    const hasSelfNav = selfNavPages.some(p => pathname === p || pathname.startsWith(p + '/'));

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => setAuthenticated(data.authenticated))
            .catch(() => setAuthenticated(false));
    }, [pathname]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setAuthenticated(false);
        router.push('/');
    };

    if (hasSelfNav) return null;

    return (
        <nav className="navbar">
            <Link href="/" className="nav-brand">
                <VLogo size={30} />
                Vestera
            </Link>
            <div className="nav-links">
                {authenticated ? (
                    <>
                        <Link href="/trade">Trade</Link>
                        <Link href="/stats">Stats</Link>
                        <Link href="/learn">Learn</Link>
                        <button
                            onClick={handleLogout}
                            className="logout-link"
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: '#fca5a5', fontSize: '14px', fontWeight: 500,
                                padding: '8px 14px', fontFamily: 'inherit',
                            }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login">Login</Link>
                        <Link href="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
