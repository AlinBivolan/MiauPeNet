import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "./Lessons.module.scss";

export default function Lessons() {
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/lessons/roadmap", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRoadmap(res.data || []);
    } catch (err) {
      console.error("Lessons roadmap error:", err);
      setError(
        err?.response?.data?.message || "Nu s-a putut încărca roadmap-ul."
      );
    } finally {
      setLoading(false);
    }
  };

  const firstLockedChapter = useMemo(() => {
    return roadmap.find((chapter) => !chapter.isUnlocked) || null;
  }, [roadmap]);

  const unlockedChapters = useMemo(() => {
    return roadmap.filter((chapter) => chapter.isUnlocked);
  }, [roadmap]);

  if (loading) {
    return <div className={styles.stateMessage}>Se încarcă...</div>;
  }

  if (error) {
    return <div className={styles.stateMessage}>Eroare: {error}</div>;
  }

  if (!roadmap.length) {
    return <div className={styles.stateMessage}>Nu există lecții momentan.</div>;
  }

  return (
    <div className={styles.lessonsPage}>
      <div className={styles.lessonsScroll}>
        {unlockedChapters.map((chapter, chapterIndex) => (
          <div key={chapter._id} className={styles.chapterBlock}>
            <div className={styles.chapterBadge}>
              <div className={styles.chapterTitle}>
                {chapter.name?.toUpperCase() || `CAPITOLUL ${chapterIndex + 1}`}
              </div>
              <div className={styles.chapterSubtitle}>
                {chapter.subtitle || "Capitol disponibil"}
              </div>
            </div>

            <div className={styles.starsPath}>
              {chapter.lessons?.map((lesson, idx) => {
                const status = lesson.progress?.status || "not_started";
                const isCompleted = status === "completed";
                const isInProgress = status === "in_progress";

                const starClasses = [
                  styles.starItem,
                  lesson.isUnlocked ? styles.starUnlocked : styles.starLocked,
                  isCompleted ? styles.starCompleted : "",
                  isInProgress ? styles.starCurrent : "",
                  idx % 2 === 0 ? styles.leftStar : styles.rightStar,
                ].join(" ");

                const starInner = (
                  <>
                    <span className={styles.starGlow}></span>
                    <span className={styles.starIcon}>★</span>
                    <span className={styles.lessonLabel}>
                      {lesson.title || `Lecția ${idx + 1}`}
                    </span>
                  </>
                );

                return lesson.isUnlocked ? (
                  <Link
                    key={lesson._id}
                    to={`/app/lesson/${chapter._id}/${lesson.index}`}
                    className={starClasses}
                    title={lesson.title}
                  >
                    {starInner}
                  </Link>
                ) : (
                  <div
                    key={lesson._id}
                    className={starClasses}
                    title={lesson.title}
                  >
                    {starInner}
                    <span className={styles.lockBadge}>🔒</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {firstLockedChapter && (
          <div className={styles.nextCard}>
            <div className={styles.nextTitle}>URMEAZĂ...</div>
            <div className={styles.lockIcon}>🔒</div>
            <div className={styles.nextChapterName}>
              {firstLockedChapter.name?.toUpperCase() || "CAPITOLUL URMĂTOR"}
            </div>
            <div className={styles.nextChapterSubtitle}>
              {firstLockedChapter.subtitle || "Capitol blocat momentan"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}