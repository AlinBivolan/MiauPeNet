import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAdminCategories } from "../../api/adminCategoryApi";
import {
  createAdminLesson,
  getAdminLessonById,
  updateAdminLesson,
} from "../../api/adminLessonApi";
import LessonBuilder from "../../components/admin/LessonBuilder";
import styles from "./AdminLayout.module.scss";

const defaultLevels = [
  {
    level: 1,
    title: "Nivel 1",
    estimatedMinutes: 5,
    passPercentage: 70,
    screens: [],
  },
  {
    level: 2,
    title: "Nivel 2",
    estimatedMinutes: 6,
    passPercentage: 75,
    screens: [],
  },
  {
    level: 3,
    title: "Nivel 3",
    estimatedMinutes: 7,
    passPercentage: 80,
    screens: [],
  },
];

export default function AdminLessonForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    categoryId: "",
    index: 1,
    title: "",
    subtitle: "",
    targetAgeGroup: "all",
    levels: defaultLevels,
  });

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await getAdminCategories();
        setCategories(data);
      } catch {
        setError("Nu s-au putut încărca categoriile.");
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (!isEdit) return;

    const loadLesson = async () => {
      try {
        setPageLoading(true);
        const { data } = await getAdminLessonById(id);

        setForm({
          categoryId: data.categoryId?._id || data.categoryId || "",
          index: data.index || 1,
          title: data.title || "",
          subtitle: data.subtitle || "",
          targetAgeGroup: data.targetAgeGroup || "all",
          levels: Array.isArray(data.levels) && data.levels.length === 3
            ? data.levels
            : defaultLevels,
        });
      } catch {
        setError("Nu s-a putut încărca lecția.");
      } finally {
        setPageLoading(false);
      }
    };

    loadLesson();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "index" ? Number(value) : value,
    }));
  };

  const handleLevelsChange = (nextLevels) => {
    setForm((prev) => ({
      ...prev,
      levels: nextLevels,
    }));
  };

  const validateBeforeSubmit = () => {
    if (!form.categoryId) return "Alege categoria.";
    if (!form.title.trim()) return "Titlul lecției este obligatoriu.";
    if (!Array.isArray(form.levels) || form.levels.length !== 3) {
      return "Lecția trebuie să aibă exact 3 niveluri.";
    }

    for (const level of form.levels) {
      if (!level.title?.trim()) {
        return `Titlul pentru nivelul ${level.level} este obligatoriu.`;
      }

      for (const screen of level.screens || []) {
        if (!screen.type) {
          return `Există un screen fără tip în nivelul ${level.level}.`;
        }

        if ((screen.type.includes("image") || screen.type === "image") && !screen.image?.src) {
          return `Există un screen cu imagine fără image.src în nivelul ${level.level}.`;
        }

        if (screen.type.includes("options") && (!Array.isArray(screen.options) || screen.options.length === 0)) {
          return `Există un screen cu opțiuni fără opțiuni în nivelul ${level.level}.`;
        }

        if (screen.type === "image_hotspot" && (!Array.isArray(screen.hotspots) || screen.hotspots.length === 0)) {
          return `Există un screen hotspot fără hotspot-uri în nivelul ${level.level}.`;
        }
      }
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateBeforeSubmit();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        categoryId: form.categoryId,
        index: Number(form.index),
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        targetAgeGroup: form.targetAgeGroup,
        levels: form.levels,
      };

      if (isEdit) {
        await updateAdminLesson(id, payload);
      } else {
        await createAdminLesson(payload);
      }

      navigate("/admin/lessons");
    } catch (err) {
      setError(err.response?.data?.message || "Salvarea a eșuat.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <p>Se încarcă lecția...</p>;
  }

  return (
    <div className={styles.formCard}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          {isEdit ? "Vezi / Editează lecția" : "Adaugă lecție"}
        </h2>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <select
          className={styles.select}
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
        >
          <option value="">Alege categoria</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          className={styles.input}
          name="index"
          type="number"
          value={form.index}
          onChange={handleChange}
        />

        <input
          className={styles.input}
          name="title"
          placeholder="Titlu lecție"
          value={form.title}
          onChange={handleChange}
        />

        <input
          className={styles.input}
          name="subtitle"
          placeholder="Subtitlu"
          value={form.subtitle}
          onChange={handleChange}
        />

        <select
          className={styles.select}
          name="targetAgeGroup"
          value={form.targetAgeGroup}
          onChange={handleChange}
        >
          <option value="all">Toți</option>
          <option value="under_12">Sub 12 ani</option>
          <option value="over_or_equal_12">12 ani sau mai mult</option>
        </select>

        <LessonBuilder
          levels={form.levels}
          onChange={handleLevelsChange}
        />

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.primaryBtn} type="submit" disabled={loading}>
          {loading ? "Se salvează..." : "Salvează lecția"}
        </button>
      </form>
    </div>
  );
}