import styles from "../../pages/admin/AdminLayout.module.scss";

export default function OptionEditor({
  option,
  optionIndex,
  onChange,
  onDelete,
}) {
  const handleFieldChange = (field, value) => {
    onChange({
      ...option,
      [field]: value,
    });
  };

  return (
    <div className={styles.nestedCard}>
      <div className={styles.builderCardHeader}>
        <h6 className={styles.builderMiniTitle}>Opțiunea {optionIndex + 1}</h6>

        <button type="button" className={styles.dangerBtn} onClick={onDelete}>
          Delete
        </button>
      </div>

      <div className={styles.builderGrid}>
        <input
          className={styles.input}
          placeholder="ID opțiune"
          value={option.id || ""}
          onChange={(e) => handleFieldChange("id", e.target.value)}
        />

        <input
          className={styles.input}
          placeholder="Text opțiune"
          value={option.text || ""}
          onChange={(e) => handleFieldChange("text", e.target.value)}
        />
      </div>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={!!option.isCorrect}
          onChange={(e) => handleFieldChange("isCorrect", e.target.checked)}
        />
        Răspuns corect
      </label>

      <textarea
        className={styles.textareaSmall}
        placeholder="Explicație pentru răspunsul corect"
        value={option.explainCorrect || ""}
        onChange={(e) => handleFieldChange("explainCorrect", e.target.value)}
      />
    </div>
  );
}