'use client';

import styles from './lessonTabs.module.css';

export type LessonViewerTab = 'concepts' | 'video';

interface LessonTabsProps {
    value: LessonViewerTab;
    onChange: (tab: LessonViewerTab) => void;
    /** Level accent for active tab underline/hint (optional visual tie-in) */
    accentColor?: string;
}

export function LessonTabs({ value, onChange, accentColor }: LessonTabsProps) {
    return (
        <div className={styles.tabBar} role="tablist" aria-label="Lesson content">
            <button
                type="button"
                role="tab"
                id="lesson-tab-concepts"
                aria-selected={value === 'concepts'}
                aria-controls="lesson-panel-concepts"
                className={`${styles.tab} ${value === 'concepts' ? styles.tabActive : ''}`}
                style={
                    value === 'concepts' && accentColor
                        ? { borderColor: accentColor + '44', boxShadow: `0 0 0 1px ${accentColor}22 inset` }
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
                aria-selected={value === 'video'}
                aria-controls="lesson-panel-video"
                className={`${styles.tab} ${value === 'video' ? styles.tabActive : ''}`}
                style={
                    value === 'video' && accentColor
                        ? { borderColor: accentColor + '44', boxShadow: `0 0 0 1px ${accentColor}22 inset` }
                        : undefined
                }
                onClick={() => onChange('video')}
            >
                Video
            </button>
        </div>
    );
}
