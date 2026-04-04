'use client';

import styles from './learn.module.css';

export type LessonViewTab = 'concepts' | 'video';

interface LessonHeaderProps {
    title: string;
    /** When false, no quiz button is shown (lessons without a quiz). */
    quizAvailable: boolean;
    onTakeQuiz: () => void;
}

/** Title + Take Quiz (above tabs; visible on Concepts and Video). */
export function LessonHeader({ title, quizAvailable, onTakeQuiz }: LessonHeaderProps) {
    return (
        <div className={styles.lessonHeader}>
            <h2 className={styles.lessonHeaderTitle}>{title}</h2>
            {quizAvailable && (
                <button type="button" className={styles.lessonQuizBtn} onClick={onTakeQuiz}>
                    Take the Quiz →
                </button>
            )}
        </div>
    );
}

interface LessonTabsProps {
    active: LessonViewTab;
    onChange: (tab: LessonViewTab) => void;
    accentColor: string;
}

/** Tab switcher: Concepts (default) · Video */
export function LessonTabs({ active, onChange, accentColor }: LessonTabsProps) {
    return (
        <div className={styles.lessonTabBar} role="tablist" aria-label="Lesson content">
            <button
                type="button"
                role="tab"
                id="lesson-tab-concepts"
                aria-selected={active === 'concepts'}
                aria-controls="lesson-panel-concepts"
                className={`${styles.lessonTabBtn} ${active === 'concepts' ? styles.lessonTabBtnActive : ''}`}
                style={
                    active === 'concepts'
                        ? { borderColor: accentColor, color: accentColor, background: `${accentColor}12` }
                        : undefined
                }
                onClick={() => onChange('concepts')}
            >
                Concepts
            </button>
            <button
                type="button"
                role="tab"
                id="lesson-tab-video"
                aria-selected={active === 'video'}
                aria-controls="lesson-panel-video"
                className={`${styles.lessonTabBtn} ${active === 'video' ? styles.lessonTabBtnActive : ''}`}
                style={
                    active === 'video'
                        ? { borderColor: accentColor, color: accentColor, background: `${accentColor}12` }
                        : undefined
                }
                onClick={() => onChange('video')}
            >
                Video
            </button>
        </div>
    );
}

interface ConceptsTabProps {
    children: React.ReactNode;
}

/** Written lesson body (quiz CTA lives in LessonHeader). */
export function ConceptsTab({ children }: ConceptsTabProps) {
    return (
        <div
            id="lesson-panel-concepts"
            role="tabpanel"
            aria-labelledby="lesson-tab-concepts"
            className={styles.lessonTabPanel}
        >
            {children}
        </div>
    );
}

interface VideoTabProps {
    lessonTitle: string;
}

/** Placeholder until real video embeds exist */
export function VideoTab({ lessonTitle }: VideoTabProps) {
    return (
        <div
            id="lesson-panel-video"
            role="tabpanel"
            aria-labelledby="lesson-tab-video"
            className={styles.lessonTabPanel}
        >
            <div className={styles.videoPlaceholder}>
                <div className={styles.videoPlaceholderFrame} aria-hidden>
                    <span className={styles.videoPlaceholderIcon}>▶</span>
                </div>
                <h3 className={styles.videoPlaceholderTitle}>Lesson Video</h3>
                <p className={styles.videoPlaceholderLesson}>{lessonTitle}</p>
                <p className={styles.videoPlaceholderHint}>
                    Video coming soon — this lesson will include a video walkthrough in the future.
                </p>
            </div>
        </div>
    );
}

/** Stable wrapper around tab panels (min-height avoids layout jump) */
export function LessonContentWrapper({ children }: { children: React.ReactNode }) {
    return <div className={styles.lessonContentWrapper}>{children}</div>;
}
