import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import styles from "./Profile.module.scss";

export default function ProfileActivityTab() {
  const { username } = useOutletContext();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://localhost:5000/api/profile/${username}/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Nu s-au putut încărca statisticile.");
        }

        const data = await res.json();
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "A apărut o eroare.");
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return <div className={styles.emptyState}>Se încarcă statisticile...</div>;
  }

  if (error) {
    return <div className={styles.emptyState}>{error}</div>;
  }

  const statItems = [
    {
      label: "Povești publicate",
      value: stats?.storiesCount ?? 0,
      icon: "📖",
      color: "#ff4d4d",
      description: "Poveștile create în jurnal",
    },
    {
      label: "Realizări deblocate",
      value: stats?.achievementsCount ?? 0,
      icon: "🏆",
      color: "#00e5ff",
      description: "Badge-uri obținute",
    },
    {
      label: "Zile în aplicație",
      value: stats?.daysOnPlatform ?? 0,
      icon: "📅",
      color: "#7ddc00",
      description: "Timp petrecut în comunitate",
    },
    {
      label: "Profil completat",
      value: `${stats?.profileCompletion ?? 0}%`,
      icon: "✨",
      color: "#d16bff",
      description: "Cât de complet este profilul",
    },
  ];

  return (
    <div className={styles.statsGrid}>
      {statItems.map((item) => (
        <article
          key={item.label}
          className={styles.statCard}
          style={{ borderColor: item.color }}
        >
          <div
            className={styles.statIconBox}
            style={{
              background: `linear-gradient(180deg, ${item.color}, ${item.color}CC)`,
            }}
          >
            <span>{item.icon}</span>
          </div>

          <div className={styles.statContent}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}