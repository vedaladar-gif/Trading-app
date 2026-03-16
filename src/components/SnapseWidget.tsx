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
        { role: 'assistant', content: "👋 Hi! I'm **Snapse**, your AI investing companion. Ask me anything about trading, investing concepts, or market analysis!" }
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
            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
        }
        setLoading(false);
    };

    const formatContent = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <div className={styles.widget}>
            <button className={`${styles.toggleBtn} ${open ? styles.active : ''}`} onClick={() => setOpen(!open)} title="Open Snapse AI Assistant">
                💬
            </button>

            <div className={`${styles.panel} ${open ? styles.panelActive : ''}`}>
                <div className={styles.header}>
                    <div>
                        <h3>Snapse</h3>
                        <p className={styles.modeBadge}>{isTrading ? '📊 Trading' : '📚 Tutor'}</p>
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
