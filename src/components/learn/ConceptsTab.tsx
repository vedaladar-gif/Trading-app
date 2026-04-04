'use client';

import type { ReactNode } from 'react';
import styles from './lessonTabs.module.css';

interface ConceptsTabProps {
    children: ReactNode;
}

/** Wraps written lesson content + quiz CTA (Concepts tab panel). */
export function ConceptsTab({ children }: ConceptsTabProps) {
    return (
        <div
            id="lesson-panel-concepts"
            role="tabpanel"
            aria-labelledby="lesson-tab-concepts"
            className={styles.conceptsPanel}
        >
            {children}
        </div>
    );
}
