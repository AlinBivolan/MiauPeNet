import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createAdminCategory,
  getAdminCategoryById,
  updateAdminCategory,
} from "../../api/adminCategoryApi";
import styles from "./AdminLayout.module.scss";

export default function AdminCategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    key: "",
    name: "",
    subtitle: "",
    color: "#50b9d4",
    order: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    const loadCategory = async () => {
      try {
        const { data } = await getAdminCategoryById(id);
        setForm({
          key: data.key || "",
          name: data.name || "",
          subtitle: data.subtitle || "",
          color: data.color || "#50b9d4",
          order: data.order || 1,
        });
      } catch (err) {
        setError("Nu s-a putut încărca categoria.");
      }
    };

    loadCategory();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "order" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (isEdit) {
        await updateAdminCategory(id, form);
      } else {
        await createAdminCategory(form);
      }

      navigate("/admin/categories");
    } catch (err) {
      setError(err.response?.data?.message || "Salvarea a eșuat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formCard}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          {isEdit ? "Editează categoria" : "Adaugă categorie"}
        </h2>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          name="key"
          placeholder="Key"
          value={form.key}
          onChange={handleChange}
        />

        <input
          className={styles.input}
          name="name"
          placeholder="Nume"
          value={form.name}
          onChange={handleChange}
        />

        <input
          className={styles.input}
          name="subtitle"
          placeholder="Subtitlu"
          value={form.subtitle}
          onChange={handleChange}
        />

        <input
          className={styles.input}
          name="color"
          type="color"
          value={form.color}
          onChange={handleChange}
        />

        <input
          className={styles.input}
          name="order"
          type="number"
          value={form.order}
          onChange={handleChange}
        />

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.primaryBtn} type="submit" disabled={loading}>
          {loading ? "Se salvează..." : "Salvează categoria"}
        </button>
      </form>
    </div>
  );
}