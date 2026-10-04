import OptionEditor from "./OptionEditor";
import HotspotEditor from "./HotspotEditor";
import styles from "../../pages/admin/AdminLayout.module.scss";

const SCREEN_TYPES = [
  "text",
  "image",
  "text_image",
  "text_options",
  "text_image_options",
  "image_options",
  "image_hotspot",
];

function typeHasText(type) {
  return ["text", "text_image", "text_options", "text_image_options", "image_hotspot", "image_options"].includes(type);
}

function typeHasImage(type) {
  return ["image", "text_image", "text_image_options", "image_options", "image_hotspot"].includes(type);
}

function typeHasOptions(type) {
  return ["text_options", "text_image_options", "image_options"].includes(type);
}

function typeHasHotspots(type) {
  return type === "image_hotspot";
}

function createDefaultOption() {
  return {
    id: "",
    text: "",
    isCorrect: false,
    explainCorrect: "",
  };
}

function createDefaultHotspot() {
  return {
    id: "",
    shape: "rect",
    x: 0,
    y: 0,
    width: 20,
    height: 10,
    radius: 10,
    isCorrect: true,
    explainCorrect: "",
  };
}

function normalizeScreenByType(type, prevScreen = {}) {
  const base = {
    type,
    title: prevScreen.title || "",
    text: "",
    image: null,
    multiple: false,
    options: [],
    hotspots: [],
  };

  if (type === "text") {
    return {
      ...base,
      text: prevScreen.text || "",
    };
  }

  if (type === "image") {
    return {
      ...base,
      image: prevScreen.image || { src: "", alt: "" },
    };
  }

  if (type === "text_image") {
    return {
      ...base,
      text: prevScreen.text || "",
      image: prevScreen.image || { src: "", alt: "" },
    };
  }

  if (type === "text_options") {
    return {
      ...base,
      text: prevScreen.text || "",
      multiple: !!prevScreen.multiple,
      options: Array.isArray(prevScreen.options) ? prevScreen.options : [],
    };
  }

  if (type === "text_image_options") {
    return {
      ...base,
      text: prevScreen.text || "",
      image: prevScreen.image || { src: "", alt: "" },
      multiple: !!prevScreen.multiple,
      options: Array.isArray(prevScreen.options) ? prevScreen.options : [],
    };
  }

  if (type === "image_options") {
    return {
      ...base,
      text: prevScreen.text || "",
      image: prevScreen.image || { src: "", alt: "" },
      multiple: !!prevScreen.multiple,
      options: Array.isArray(prevScreen.options) ? prevScreen.options : [],
    };
  }

  if (type === "image_hotspot") {
    return {
      ...base,
      text: prevScreen.text || "",
      image: prevScreen.image || { src: "", alt: "" },
      hotspots: Array.isArray(prevScreen.hotspots) ? prevScreen.hotspots : [],
    };
  }

  return base;
}

export default function ScreenEditor({
  screen,
  screenIndex,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) {
  const handleFieldChange = (field, value) => {
    onChange({
      ...screen,
      [field]: value,
    });
  };

  const handleTypeChange = (nextType) => {
    onChange(normalizeScreenByType(nextType, screen));
  };

  const handleImageFieldChange = (field, value) => {
    onChange({
      ...screen,
      image: {
        src: screen.image?.src || "",
        alt: screen.image?.alt || "",
        [field]: value,
      },
    });
  };

  const addOption = () => {
    onChange({
      ...screen,
      options: [...(screen.options || []), createDefaultOption()],
    });
  };

  const updateOption = (optionIndex, nextOption) => {
    let nextOptions = [...(screen.options || [])];
    nextOptions[optionIndex] = nextOption;

    if (!screen.multiple && nextOption.isCorrect) {
      nextOptions = nextOptions.map((option, index) => ({
        ...option,
        isCorrect: index === optionIndex,
      }));
    }

    onChange({
      ...screen,
      options: nextOptions,
    });
  };

  const deleteOption = (optionIndex) => {
    onChange({
      ...screen,
      options: (screen.options || []).filter((_, i) => i !== optionIndex),
    });
  };

  const addHotspot = () => {
    onChange({
      ...screen,
      hotspots: [...(screen.hotspots || []), createDefaultHotspot()],
    });
  };

  const updateHotspot = (hotspotIndex, nextHotspot) => {
    const nextHotspots = [...(screen.hotspots || [])];
    nextHotspots[hotspotIndex] = nextHotspot;

    onChange({
      ...screen,
      hotspots: nextHotspots,
    });
  };

  const deleteHotspot = (hotspotIndex) => {
    onChange({
      ...screen,
      hotspots: (screen.hotspots || []).filter((_, i) => i !== hotspotIndex),
    });
  };

  return (
    <div className={styles.builderCard}>
      <div className={styles.builderCardHeader}>
        <h5 className={styles.builderCardTitle}>Screen {screenIndex + 1}</h5>

        <div className={styles.builderActions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onMoveUp}
            disabled={!canMoveUp}
          >
            ↑
          </button>

          <button
            type="button"
            className={styles.iconBtn}
            onClick={onMoveDown}
            disabled={!canMoveDown}
          >
            ↓
          </button>

          <button
            type="button"
            className={styles.dangerBtn}
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>

      <div className={styles.builderGrid}>
        <select
          className={styles.select}
          value={screen.type}
          onChange={(e) => handleTypeChange(e.target.value)}
        >
          {SCREEN_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <input
          className={styles.input}
          placeholder="Titlu screen"
          value={screen.title || ""}
          onChange={(e) => handleFieldChange("title", e.target.value)}
        />
      </div>

      {typeHasText(screen.type) && (
        <textarea
          className={styles.textareaSmall}
          placeholder="Text"
          value={screen.text || ""}
          onChange={(e) => handleFieldChange("text", e.target.value)}
        />
      )}

      {typeHasImage(screen.type) && (
        <div className={styles.builderGrid}>
          <input
            className={styles.input}
            placeholder="Image src"
            value={screen.image?.src || ""}
            onChange={(e) => handleImageFieldChange("src", e.target.value)}
          />

          <input
            className={styles.input}
            placeholder="Image alt"
            value={screen.image?.alt || ""}
            onChange={(e) => handleImageFieldChange("alt", e.target.value)}
          />
        </div>
      )}

      {typeHasOptions(screen.type) && (
        <div className={styles.subSection}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={!!screen.multiple}
              onChange={(e) => handleFieldChange("multiple", e.target.checked)}
            />
            Întrebare cu mai multe răspunsuri corecte
          </label>

          <div className={styles.builderSubHeader}>
            <h6 className={styles.builderMiniTitle}>Opțiuni</h6>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={addOption}
            >
              + Add option
            </button>
          </div>

          {(screen.options || []).map((option, optionIndex) => (
            <OptionEditor
              key={optionIndex}
              option={option}
              optionIndex={optionIndex}
              onChange={(nextOption) => updateOption(optionIndex, nextOption)}
              onDelete={() => deleteOption(optionIndex)}
            />
          ))}
        </div>
      )}

      {typeHasHotspots(screen.type) && (
        <div className={styles.subSection}>
          <div className={styles.builderSubHeader}>
            <h6 className={styles.builderMiniTitle}>Hotspot-uri</h6>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={addHotspot}
            >
              + Add hotspot
            </button>
          </div>

          {(screen.hotspots || []).map((hotspot, hotspotIndex) => (
            <HotspotEditor
              key={hotspotIndex}
              hotspot={hotspot}
              hotspotIndex={hotspotIndex}
              onChange={(nextHotspot) =>
                updateHotspot(hotspotIndex, nextHotspot)
              }
              onDelete={() => deleteHotspot(hotspotIndex)}
            />
          ))}
        </div>
      )}
    </div>
  );
}