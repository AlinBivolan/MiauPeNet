import ScreenEditor from "./ScreenEditor";
import styles from "../../pages/admin/AdminLayout.module.scss";

function createDefaultScreen() {
  return {
    type: "text",
    title: "",
    text: "",
    image: null,
    multiple: false,
    options: [],
    hotspots: [],
  };
}

export default function LevelEditor({ level, levelIndex, onChange }) {
  const handleFieldChange = (field, value) => {
    onChange({
      ...level,
      [field]: value,
    });
  };

  const addScreen = () => {
    onChange({
      ...level,
      screens: [...(level.screens || []), createDefaultScreen()],
    });
  };

  const updateScreen = (screenIndex, nextScreen) => {
    const nextScreens = [...(level.screens || [])];
    nextScreens[screenIndex] = nextScreen;

    onChange({
      ...level,
      screens: nextScreens,
    });
  };

  const deleteScreen = (screenIndex) => {
    const nextScreens = (level.screens || []).filter((_, i) => i !== screenIndex);

    onChange({
      ...level,
      screens: nextScreens,
    });
  };

  const moveScreen = (screenIndex, direction) => {
    const nextScreens = [...(level.screens || [])];
    const targetIndex = screenIndex + direction;

    if (targetIndex < 0 || targetIndex >= nextScreens.length) return;

    [nextScreens[screenIndex], nextScreens[targetIndex]] = [
      nextScreens[targetIndex],
      nextScreens[screenIndex],
    ];

    onChange({
      ...level,
      screens: nextScreens,
    });
  };

  return (
    <div className={styles.builderSection}>
      <div className={styles.builderHeader}>
        <h3 className={styles.builderTitle}>Nivel {level.level}</h3>
      </div>

      <div className={styles.builderGrid}>
        <input
          className={styles.input}
          placeholder="Titlu nivel"
          value={level.title || ""}
          onChange={(e) => handleFieldChange("title", e.target.value)}
        />

        <input
          className={styles.input}
          type="number"
          placeholder="Minute"
          value={level.estimatedMinutes ?? 5}
          onChange={(e) =>
            handleFieldChange("estimatedMinutes", Number(e.target.value))
          }
        />

        <input
          className={styles.input}
          type="number"
          placeholder="Pass %"
          value={level.passPercentage ?? 70}
          onChange={(e) =>
            handleFieldChange("passPercentage", Number(e.target.value))
          }
        />
      </div>

      <div className={styles.builderSubHeader}>
        <h4 className={styles.builderSubTitle}>Screen-uri</h4>

        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={addScreen}
        >
          + Add screen
        </button>
      </div>

      <div className={styles.builderList}>
        {(level.screens || []).map((screen, screenIndex) => (
          <ScreenEditor
            key={`${levelIndex}-${screenIndex}`}
            screen={screen}
            screenIndex={screenIndex}
            onChange={(nextScreen) => updateScreen(screenIndex, nextScreen)}
            onDelete={() => deleteScreen(screenIndex)}
            onMoveUp={() => moveScreen(screenIndex, -1)}
            onMoveDown={() => moveScreen(screenIndex, 1)}
            canMoveUp={screenIndex > 0}
            canMoveDown={screenIndex < (level.screens || []).length - 1}
          />
        ))}
      </div>
    </div>
  );
}