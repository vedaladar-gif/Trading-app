'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styles from './SnapseWidget.module.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function SnapseWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hi! I'm **Snapse**, your AI investing assistant. I can see your portfolio and help you analyze stocks, understand concepts, or answer any investing questions. What would you like to know?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    const isTrading = pathname.startsWith('/trade');
    const mode = isTrading ? 'TRADING' : 'TUTOR';

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch('/api/snapse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, mode, route: pathname }),
            });
            const data = await res.json();
            if (res.status === 401) {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Please **sign in** to use Snapse. Your session may have expired.' }]);
            } else if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, something went wrong. (${data.error ?? 'unknown error'})` }]);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
        }
        setLoading(false);
    };

    const formatContent = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>');
    };

    const quickPrompts = isTrading
        ? ['Analyze my portfolio', 'What should I buy?', 'Explain P/E ratio']
        : ['Explain this simply', 'Give me an example', 'Quiz me'];

    return (
        <div className={styles.widget}>
            <button
                className={`${styles.toggleBtn} ${open ? styles.active : ''}`}
                onClick={() => setOpen(!open)}
                title="Open Snapse AI"
            >
                {open ? '✕' : '💬'}
            </button>

            <div className={`${styles.panel} ${open ? styles.panelActive : ''}`}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '32px', height: '32px',
                            background: 'linear-gradient(135deg, #4f6ef7, #9b5de5)',
                            borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px',
                        }}>S</div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff' }}>Snapse</h3>
                            <p style={{ margin: 0, fontSize: '11px', color: '#4f6ef7' }}>
                                {isTrading ? 'Portfolio AI' : 'Learning Tutor'}
                            </p>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
                </div>

                <div className={styles.messages}>
                    {messages.map((msg, i) => (
                        <div key={i} className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageAssistant}`}>
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
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick prompts */}
                {messages.length <= 1 && (
                    <div style={{
                        padding: '8px 12px',
                        display: 'flex', flexWrap: 'wrap', gap: '6px',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                    }}>
                        {quickPrompts.map(p => (
                            <button
                                key={p}
                                onClick={() => { setInput(p); }}
                                style={{
                                    padding: '5px 10px',
                                    background: 'rgba(79,110,247,0.1)',
                                    border: '1px solid rgba(79,110,247,0.2)',
                                    borderRadius: '100px',
                                    color: '#7d9bff',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    fontFamily: 'Inter, sans-serif',
                                }}
                            >{p}</button>
                        ))}
                    </div>
                )}

                <div className={styles.inputArea}>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask me anything..."
                        className={styles.input}
                    />
                    <button className={styles.sendBtn} onClick={sendMessage} disabled={loading || !input.trim()}>
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
}