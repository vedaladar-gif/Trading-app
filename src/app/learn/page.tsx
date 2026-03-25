'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LEVELS, type LessonUnit } from '@/lib/learningContent';
import styles from './learn.module.css';
import VLogo from '@/components/VLogo';

interface Progress {
    [key: string]: { completed: boolean; quizScore?: number; quizPassed?: boolean };
}

export default function LearningDashboard() {
    const [activeLevel, setActiveLevel] = useState(LEVELS[0].id);
    const [activeUnit, setActiveUnit] = useState<LessonUnit | null>(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
    const [quizResult, setQuizResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);
    const [progress, setProgress] = useState<Progress>({});
    const router = useRouter();

    // Load progress from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('vestera_learn_progress');
        if (saved) setProgress(JSON.parse(saved));
    }, []);

    const saveProgress = useCallback((p: Progress) => {
        setProgress(p);
        localStorage.setItem('vestera_learn_progress', JSON.stringify(p));
    }, []);

    const level = LEVELS.find(l => l.id === activeLevel)!;

    const completedCount = level.units.filter(u => progress[`${activeLevel}-${u.id}`]?.completed).length;
    const quizzesPassed = level.units.filter(u => progress[`${activeLevel}-${u.id}`]?.quizPassed).length;

    const openUnit = (unit: LessonUnit) => {
        setActiveUnit(unit);
        setShowQuiz(false);
        setQuizResult(null);
        setQuizAnswers({});
        // Mark as completed
        const key = `${activeLevel}-${unit.id}`;
        const newProgress = { ...progress, [key]: { ...progress[key], completed: true } };
        saveProgress(newProgress);
    };

    const startQuiz = () => {
        setShowQuiz(true);
        setQuizResult(null);
        setQuizAnswers({});
    };

    const submitQuiz = () => {
        if (!activeUnit) return;
        let correct = 0;
        activeUnit.quiz.forEach((q, i) => {
            if (quizAnswers[i] === q.answer) correct++;
        });
        const total = activeUnit.quiz.length;
        const passed = correct === total;
        setQuizResult({ score: correct, total, passed });

        if (passed) {
            const key = `${activeLevel}-${activeUnit.id}`;
            const newProgress = { ...progress, [key]: { ...progress[key], completed: true, quizScore: correct, quizPassed: true } };
            saveProgress(newProgress);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
    };

    const formatContent = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <div className={styles.learnWrap}>
            {/* Nav */}
            <nav className={styles.learnNav}>
                <Link href="/" className={styles.brand}>
                    <VLogo size={30} />
                    Vestera
                </Link>
                <div className={styles.navLinks}>
                    <Link href="/trade">Trade</Link>
                    <Link href="/stats">Stats</Link>
                    <Link href="/learn">Learn</Link>
                    <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
                </div>
            </nav>

            <div className={styles.content}>
                {/* Level Tabs */}
                <div className={styles.levelTabs}>
                    {LEVELS.map(l => (
                        <button
                            key={l.id}
                            className={`${styles.levelTab} ${activeLevel === l.id ? styles.activeTab : ''}`}
                            onClick={() => { setActiveLevel(l.id); setActiveUnit(null); setShowQuiz(false); }}
                            style={activeLevel === l.id ? { borderColor: l.color } : {}}
                        >
                            {l.name}
                        </button>
                    ))}
                </div>

                {/* Progress bar */}
                <div className={styles.progressCard}>
                    <div className={styles.progressInfo}>
                        <span>{completedCount}/{level.units.length} units completed</span>
                        <span>{quizzesPassed}/{level.units.length} quizzes passed</span>
                    </div>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${(completedCount / level.units.length) * 100}%`, background: level.color }} />
                    </div>
                </div>

                {/* Unit viewer or quiz modal */}
                {activeUnit ? (
                    <div className={styles.unitViewer}>
                        <button className={styles.backBtn} onClick={() => { setActiveUnit(null); setShowQuiz(false); }}>← Back to Units</button>

                        {!showQuiz ? (
                            <>
                                <h2>{activeUnit.title}</h2>
                                <div className={styles.unitContent} dangerouslySetInnerHTML={{ __html: formatContent(activeUnit.content) }} />
                                {activeUnit.quiz.length > 0 && (
                                    <button className={styles.quizCta} onClick={startQuiz}>
                                        Take the Quiz
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className={styles.quizSection}>
                                <h2>Quiz: {activeUnit.title}</h2>
                                {activeUnit.quiz.map((q, qi) => (
                                    <div key={qi} className={styles.quizQuestion}>
                                        <p className={styles.questionText}>{qi + 1}. {q.question}</p>
                                        <div className={styles.options}>
                                            {q.options.map((opt, oi) => (
                                                <label key={oi} className={`${styles.option} ${quizAnswers[qi] === oi ? styles.optionSelected : ''}`}>
                                                    <input
                                                        type="radio"
                                                        name={`q${qi}`}
                                                        checked={quizAnswers[qi] === oi}
                                                        onChange={() => setQuizAnswers(prev => ({ ...prev, [qi]: oi }))}
                                                    />
                                                    {opt}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <button className={styles.submitQuizBtn} onClick={submitQuiz} disabled={Object.keys(quizAnswers).length < activeUnit.quiz.length}>
                                    Submit Answers
                                </button>
                                {quizResult && (
                                    <div className={`${styles.quizResultCard} ${quizResult.passed ? styles.quizPassed : styles.quizFailed}`}>
                                        <h3>{quizResult.passed ? 'Passed!' : 'Try Again'}</h3>
                                        <p>Score: {quizResult.score}/{quizResult.total}</p>
                                        {!quizResult.passed && <button className={styles.retryBtn} onClick={startQuiz}>Retry Quiz</button>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={styles.unitGrid}>
                        {level.units.map(unit => {
                            const key = `${activeLevel}-${unit.id}`;
                            const p = progress[key];
                            return (
                                <div key={unit.id} className={styles.unitCard} onClick={() => openUnit(unit)}>
                                    <div className={styles.unitHeader}>
                                        <span className={styles.unitNumber}>Unit {unit.id}</span>
                                        <div className={styles.unitBadges}>
                                            {p?.completed && <span className={styles.badgeDone}>Done</span>}
                                            {p?.quizPassed && <span className={styles.badgeQuiz}>Passed</span>}
                                        </div>
                                    </div>
                                    <h4>{unit.title}</h4>
                                    <p className={styles.unitPreview}>{unit.content.substring(0, 80)}...</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
