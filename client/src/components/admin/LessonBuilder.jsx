import LevelEditor from "./LevelEditor";

export default function LessonBuilder({ levels, onChange }) {
  const updateLevel = (levelIndex, nextLevel) => {
    const nextLevels = [...levels];
    nextLevels[levelIndex] = nextLevel;
    onChange(nextLevels);
  };

  return (
    <div>
      {levels.map((level, index) => (
        <LevelEditor
          key={level.level}
          level={level}
          levelIndex={index}
          onChange={(nextLevel) => updateLevel(index, nextLevel)}
        />
      ))}
    </div>
  );
}