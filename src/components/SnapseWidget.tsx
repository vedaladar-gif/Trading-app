'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styles from './SnapseWidget.module.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

function tickerFromWindow(): string {
    if (typeof window === 'undefined') return '';
    try {
        return (new URLSearchParams(window.location.search).get('ticker') || '').toUpperCase();
    } catch {
        return '';
    }
}

export default function SnapseWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content:
                "Hi! I'm **Snapse**, your Vestera investing coach. Ask about markets, concepts, your **paper portfolio**, or a stock you're learning about — I'll keep it educational and clear. What would you like to explore?",
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    const isTrading = pathname.startsWith('/trade');
    const mode = isTrading ? 'TRADING' : 'TUTOR';

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendMessageWithText = async (raw: string) => {
        const trimmed = raw.trim();
        if (!trimmed || loading) return;

        let snapshot: Message[] = [];
        setMessages(prev => {
            snapshot = [...prev, { role: 'user', content: trimmed }];
            return snapshot;
        });
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/snapse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({
                    messages: snapshot,
                    mode,
                    route: pathname,
                    stockSymbol: tickerFromWindow(),
                }),
            });

            let data: { reply?: string; error?: string } = {};
            try {
                data = await res.json();
            } catch {
                data = {};
            }

            if (res.status === 401) {
                setMessages(prev => [
                    ...prev,
                    {
                        role: 'assistant',
                        content:
                            'Please **sign in** to use Snapse. If you were logged in, your session may have expired — try refreshing the page.',
                    },
                ]);
            } else if (typeof data.reply === 'string' && data.reply.trim()) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply!.trim() }]);
            } else {
                const detail =
                    typeof data.error === 'string' && data.error.trim()
                        ? data.error.trim()
                        : `Something went wrong (${res.status}).`;
                setMessages(prev => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: `Sorry — ${detail} You can try again in a moment.`,
                    },
                ]);
            }
        } catch {
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: '**Network error.** Check your connection and try again.',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const formatContent = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>');
    };

    const quickPrompts = isTrading
        ? ['What is diversification?', 'Bull vs bear case for a stock', 'Explain P/E ratio simply']
        : ['What is dollar-cost averaging?', 'Quiz me on ETFs', 'What makes a stock risky?'];

    return (
        <div className={styles.widget}>
            <button
                className={`${styles.toggleBtn} ${open ? styles.active : ''}`}
                onClick={() => setOpen(!open)}
                title="Open Snapse AI"
                type="button"
            >
                {open ? '✕' : '💬'}
            </button>

            <div className={`${styles.panel} ${open ? styles.panelActive : ''}`}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                background: 'linear-gradient(135deg, #4f6ef7, #9b5de5)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                            }}
                        >
                            S
                        </div>
                        <div>
                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    color: 'white',
                                }}
                            >
                                Snapse
                            </h3>
                            <p style={{ margin: 0, fontSize: '11px', color: '#4f6ef7' }}>
                                {isTrading ? 'Investing coach' : 'Learning tutor'}
                            </p>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={() => setOpen(false)} type="button">
                        ✕
                    </button>
                </div>

                <div className={styles.messages}>
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageAssistant}`}
                        >
                            <div
                                className={styles.bubble}
                                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                            />
                        </div>
                    ))}
                    {loading && (
                        <div className={`${styles.message} ${styles.messageAssistant}`}>
                            <div className={styles.bubble}>
                                <div className={styles.typingDots}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {messages.length <= 1 && (
                    <div
                        style={{
                            padding: '8px 12px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '6px',
                            borderTop: '1px solid var(--vt-border2)',
                        }}
                    >
                        {quickPrompts.map(p => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => void sendMessageWithText(p)}
                                disabled={loading}
                                style={{
                                    padding: '5px 10px',
                                    background: 'rgba(79,110,247,0.1)',
                                    border: '1px solid rgba(79,110,247,0.2)',
                                    borderRadius: '100px',
                                    color: '#7d9bff',
                                    fontSize: '11px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontFamily: 'Inter, sans-serif',
                                    opacity: loading ? 0.6 : 1,
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}

                <div className={styles.inputArea}>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                void sendMessageWithText(input);
                            }
                        }}
                        placeholder="Ask about investing… (Shift+Enter for new line)"
                        className={styles.input}
                        rows={2}
                        disabled={loading}
                        aria-label="Message Snapse"
                    />
                    <button
                        className={styles.sendBtn}
                        type="button"
                        onClick={() => void sendMessageWithText(input)}
                        disabled={loading || !input.trim()}
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
}
