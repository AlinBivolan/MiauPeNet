import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteAdminCategory,
  getAdminCategories,
} from "../../api/adminCategoryApi";
import styles from "./AdminLayout.module.scss";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  const loadCategories = async () => {
    try {
      setError("");
      const { data } = await getAdminCategories();
      setCategories(data);
    } catch (err) {
      setError("Nu s-au putut încărca categoriile.");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Sigur vrei să ștergi categoria?");
    if (!confirmed) return;

    try {
      await deleteAdminCategory(id);
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Ștergerea a eșuat.");
    }
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Categorii</h2>

        <Link to="/admin/categories/new" className={styles.primaryBtn}>
          Adaugă categorie
        </Link>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.cardsGrid}>
        {categories.map((category) => (
          <div className={styles.card} key={category._id}>
            <h3 className={styles.cardTitle}>{category.name}</h3>
            <p className={styles.cardText}>{category.subtitle}</p>

            <div className={styles.infoRow}>
              <span className={styles.badge}>key: {category.key}</span>
              <span className={styles.badge}>order: {category.order}</span>
            </div>

            <div className={styles.cardActions}>
              <Link
                to={`/admin/categories/${category._id}/edit`}
                className={styles.secondaryBtn}
              >
                Edit
              </Link>

              <button
                className={styles.dangerBtn}
                onClick={() => handleDelete(category._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}