import styles from "./profile.module.scss";

export default function LevelProgressCard({ level }) {
  const percent = Math.round((level.current / level.total) * 100);

  return (
    <div className={`${styles.levelCard} ${styles[level.color]}`}>
      <div className={styles.icon}>{level.icon}</div>

      <div className={styles.info}>
        <div className={styles.row}>
          <h3>{level.title}</h3>
          <span>{level.current}/{level.total}</span>
        </div>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
