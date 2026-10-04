import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteAdminLesson,
  getAdminLessons,
} from "../../api/adminLessonApi";
import styles from "./AdminLayout.module.scss";

export default function AdminLessons() {
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadLessons = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await getAdminLessons();
      setLessons(data);
    } catch (err) {
      setError("Nu s-au putut încărca lecțiile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, []);

  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(
      `Sigur vrei să ștergi lecția "${title}"?`
    );
    if (!confirmed) return;

    try {
      await deleteAdminLesson(id);
      await loadLessons();
    } catch (err) {
      setError(err.response?.data?.message || "Ștergerea a eșuat.");
    }
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Lecții</h2>

        <Link to="/admin/lessons/new" className={styles.primaryBtn}>
          Adaugă lecție
        </Link>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading && <p>Se încarcă lecțiile...</p>}

      {!loading && (
        <div className={styles.cardsGrid}>
          {lessons.map((lesson) => (
            <div className={styles.card} key={lesson._id}>
              <h3 className={styles.cardTitle}>{lesson.title}</h3>
              <p className={styles.cardText}>{lesson.subtitle}</p>
              <p className={styles.cardText}>
                Categorie: {lesson.categoryId?.name || "-"}
              </p>

              <div className={styles.infoRow}>
                <span className={styles.badge}>index: {lesson.index}</span>
                <span className={styles.badge}>
                  grupă: {lesson.targetAgeGroup || "all"}
                </span>
              </div>

              <div className={styles.cardActions}>
                <Link
                  to={`/admin/lessons/${lesson._id}/edit`}
                  className={styles.secondaryBtn}
                >
                  Vezi / Edit
                </Link>

                <button
                  className={styles.dangerBtn}
                  onClick={() => handleDelete(lesson._id, lesson.title)}
                >
                  Șterge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}