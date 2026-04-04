'use client';

import styles from './lessonTabs.module.css';

/** Placeholder until lesson videos are wired up. */
export function VideoTab() {
    return (
        <div
            id="lesson-panel-video"
            role="tabpanel"
            aria-labelledby="lesson-tab-video"
            className={styles.videoPanel}
        >
            <h3 className={styles.videoTitle}>Lesson Video</h3>
            <div className={styles.videoFrame}>
                <div className={styles.videoFrameInner}>
                    <div className={styles.videoPlayGlyph} aria-hidden>▶</div>
                    <p className={styles.videoPlaceholderTitle}>Video coming soon</p>
                    <p className={styles.videoPlaceholderSub}>
                        This lesson will include a video walkthrough in the future.
                    </p>
                </div>
            </div>
        </div>
    );
}
