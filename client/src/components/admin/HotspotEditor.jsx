import styles from "../../pages/admin/AdminLayout.module.scss";

export default function HotspotEditor({
  hotspot,
  hotspotIndex,
  onChange,
  onDelete,
}) {
  const handleFieldChange = (field, value) => {
    onChange({
      ...hotspot,
      [field]: value,
    });
  };

  const isCircle = hotspot.shape === "circle";

  return (
    <div className={styles.nestedCard}>
      <div className={styles.builderCardHeader}>
        <h6 className={styles.builderMiniTitle}>Hotspot {hotspotIndex + 1}</h6>

        <button type="button" className={styles.dangerBtn} onClick={onDelete}>
          Delete
        </button>
      </div>

      <div className={styles.builderGrid}>
        <input
          className={styles.input}
          placeholder="ID hotspot"
          value={hotspot.id || ""}
          onChange={(e) => handleFieldChange("id", e.target.value)}
        />

        <select
          className={styles.select}
          value={hotspot.shape || "rect"}
          onChange={(e) => handleFieldChange("shape", e.target.value)}
        >
          <option value="rect">rect</option>
          <option value="circle">circle</option>
        </select>

        <input
          className={styles.input}
          type="number"
          placeholder="x"
          value={hotspot.x ?? 0}
          onChange={(e) => handleFieldChange("x", Number(e.target.value))}
        />

        <input
          className={styles.input}
          type="number"
          placeholder="y"
          value={hotspot.y ?? 0}
          onChange={(e) => handleFieldChange("y", Number(e.target.value))}
        />

        {!isCircle && (
          <>
            <input
              className={styles.input}
              type="number"
              placeholder="width"
              value={hotspot.width ?? 0}
              onChange={(e) =>
                handleFieldChange("width", Number(e.target.value))
              }
            />

            <input
              className={styles.input}
              type="number"
              placeholder="height"
              value={hotspot.height ?? 0}
              onChange={(e) =>
                handleFieldChange("height", Number(e.target.value))
              }
            />
          </>
        )}

        {isCircle && (
          <input
            className={styles.input}
            type="number"
            placeholder="radius"
            value={hotspot.radius ?? 0}
            onChange={(e) =>
              handleFieldChange("radius", Number(e.target.value))
            }
          />
        )}
      </div>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={!!hotspot.isCorrect}
          onChange={(e) => handleFieldChange("isCorrect", e.target.checked)}
        />
        Hotspot corect
      </label>

      <textarea
        className={styles.textareaSmall}
        placeholder="Explicație"
        value={hotspot.explainCorrect || ""}
        onChange={(e) => handleFieldChange("explainCorrect", e.target.value)}
      />
    </div>
  );
}