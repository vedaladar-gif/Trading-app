'use client';

import type { ReactNode } from 'react';
import { LessonTabs, type LessonViewerTab } from './LessonTabs';
import { ConceptsTab } from './ConceptsTab';
import { VideoTab } from './VideoTab';
import styles from './lessonTabs.module.css';

interface LessonContentWrapperProps {
    activeTab: LessonViewerTab;
    onTabChange: (tab: LessonViewerTab) => void;
    /** Course level color for subtle active-tab accent */
    accentColor: string;
    children: ReactNode;
}

/**
 * Tabbed shell for the lesson viewer: Concepts (written content) vs Video (placeholder).
 * Tab state is owned by the parent so it can reset when `activeUnit` changes.
 */
export function LessonContentWrapper({
    activeTab,
    onTabChange,
    accentColor,
    children,
}: LessonContentWrapperProps) {
    return (
        <div className={styles.wrapper}>
            <LessonTabs value={activeTab} onChange={onTabChange} accentColor={accentColor} />
            <div className={styles.panelArea}>
                {activeTab === 'concepts' ? (
                    <ConceptsTab>{children}</ConceptsTab>
                ) : (
                    <VideoTab />
                )}
            </div>
        </div>
    );
}

export type { LessonViewerTab };
