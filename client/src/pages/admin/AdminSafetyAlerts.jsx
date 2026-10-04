import { useEffect, useState } from "react";
import styles from "./AdminSafetyAlerts.module.scss";

const API_URL = "http://localhost:5000";

const TABS = [
  { key: "new", label: "Noi" },
  { key: "reviewed", label: "Verificate" },
];

function formatDate(dateString) {
  if (!dateString) return "";

  return new Date(dateString).toLocaleString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function readJsonResponse(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      "Serverul nu a întors JSON. Verifică dacă ruta backend /api/safety/alerts există."
    );
  }
}

export default function AdminSafetyAlerts() {
  const [status, setStatus] = useState("new");
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadAlerts(selectedStatus = status) {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/safety/alerts?status=${selectedStatus}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await readJsonResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Nu s-au putut încărca alertele.");
      }

      setAlerts(data);
    } catch (error) {
      alert(error.message || "Eroare la încărcarea alertelor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts(status);
  }, [status]);

  async function markReviewed(alertId) {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/safety/alerts/${alertId}/reviewed`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await readJsonResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Nu s-a putut marca alerta.");
      }

      setAlerts((prev) => prev.filter((alert) => alert._id !== alertId));
    } catch (error) {
      alert(error.message || "Eroare la actualizarea alertei.");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>Alerte siguranță</h2>
        <p>
          Aici apar textele sensibile detectate în timp ce utilizatorii compun o
          poveste, chiar dacă nu o postează.
        </p>
      </div>

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={status === tab.key ? styles.activeTab : styles.tab}
            onClick={() => setStatus(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.empty}>Se încarcă...</div>
      ) : alerts.length === 0 ? (
        <div className={styles.empty}>Nu există alerte aici.</div>
      ) : (
        <div className={styles.list}>
          {alerts.map((alert) => (
            <article key={alert._id} className={styles.card}>
              <div className={styles.cardTop}>
                <div>
                  <h3>
                    {alert.riskLevel === "high"
                      ? "Risc ridicat"
                      : "Risc mediu"}
                  </h3>

                  <p>
                    User: {alert.user?.name || "Utilizator"} (@
                    {alert.user?.username || "necunoscut"})
                  </p>

                  <p>Email: {alert.user?.email || "-"}</p>
                  <p>Detectat la: {formatDate(alert.createdAt)}</p>
                </div>

                <span
                  className={
                    alert.riskLevel === "high"
                      ? styles.highRisk
                      : styles.mediumRisk
                  }
                >
                  {alert.riskLevel}
                </span>
              </div>

              {alert.title && (
                <div className={styles.titleBox}>
                  <strong>Titlu:</strong> {alert.title}
                </div>
              )}

              <div className={styles.textBox}>
                <strong>Text detectat:</strong>
                <p>{alert.textPreview}</p>
              </div>

              {alert.flags?.length > 0 && (
                <div className={styles.flags}>
                  {alert.flags.map((flag) => (
                    <span key={flag}>{flag}</span>
                  ))}
                </div>
              )}

              {status === "new" && (
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.reviewBtn}
                    onClick={() => markReviewed(alert._id)}
                  >
                    Marchează ca verificată
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}