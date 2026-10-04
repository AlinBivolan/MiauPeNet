import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import styles from "./Profile.module.scss";

const achievementColors = [
  "#ff4d4d",
  "#00e5ff",
  "#7ddc00",
  "#d16bff",
  "#ff9f1c",
  "#4dff88",
];

export default function ProfileMainTab() {
  const { username } = useOutletContext();

  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://localhost:5000/api/profile/${username}/achievements`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Nu s-au putut încărca realizările.");
        }

        const data = await res.json();
        setAchievements(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "A apărut o eroare.");
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return <div className={styles.emptyState}>Se încarcă realizările...</div>;
  }

  if (error) {
    return <div className={styles.emptyState}>{error}</div>;
  }

  return (
  <div className={styles.achievementsPanel}>
    {achievements.map((achievement, index) => {
      const color =
        achievement.color ||
        achievementColors[index % achievementColors.length];

      const progress = achievement.unlocked ? 100 : 0;

      return (
        <article
          key={achievement.key}
          className={`${styles.achievementLevelRow} ${
            !achievement.unlocked ? styles.lockedAchievementRow : ""
          }`}
          style={{
            border: `1px solid ${color}`,
          }}
        >
          <div
            className={styles.achievementBadgeBox}
            style={{
              background: `linear-gradient(
                180deg,
                ${color},
                ${color}CC
              )`,
            }}
          >
            <div className={styles.achievementBadgeIcon}>
              {achievement.icon}
            </div>

            <span>
              {achievement.unlocked ? "DEBLOCAT" : "BLOCAT"}
            </span>
          </div>

          <div className={styles.achievementLevelInfo}>
            <div className={styles.achievementTopLine}>
              <h3>{achievement.title}</h3>

              <strong>
                {achievement.unlocked ? "1/1" : "0/1"}
              </strong>
            </div>

            <p>{achievement.description}</p>

            <div className={styles.achievementProgressTrack}>
              <div
                className={styles.achievementProgressFill}
                style={{
                  width: `${progress}%`,
                  background: color,
                }}
              />
            </div>
          </div>
        </article>
      );
    })}
  </div>
);
}