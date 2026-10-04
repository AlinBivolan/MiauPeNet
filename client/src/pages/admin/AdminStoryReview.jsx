import { useEffect, useState } from "react";
import styles from "./AdminStoryReview.module.scss";

const STATUS_TABS = [
  { key: "pending", label: "În așteptare" },
  { key: "flagged", label: "Flag-uite" },
  { key: "approved", label: "Aprobate" },
  { key: "rejected", label: "Respinse" },
];

function resolveImageUrl(imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return `http://localhost:5000${imagePath}`;
}

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function renderBlocks(blocks) {
  return [...(blocks || [])]
    .sort((a, b) => a.order - b.order)
    .map((block, index) => {
      if (block.type === "text") {
        return (
          <p key={`${block.type}-${index}`} className={styles.storyText}>
            {block.content}
          </p>
        );
      }

      if (block.type === "image") {
        return (
          <img
            key={`${block.type}-${index}`}
            src={resolveImageUrl(block.imageUrl)}
            alt="story"
            className={styles.storyImage}
          />
        );
      }

      return null;
    });
}

export default function AdminStoryReview() {
  const [status, setStatus] = useState("pending");
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");

  async function loadStories(selectedStatus = status) {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/admin/stories?status=${selectedStatus}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Nu s-au putut încărca poveștile.");
      }

      setStories(data);
    } catch (error) {
      alert(error.message || "Eroare la încărcare.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStories(status);
  }, [status]);

  async function approveStory(storyId) {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/admin/stories/${storyId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Nu s-a putut aproba povestea.");
      }

      setStories((prev) => prev.filter((story) => story._id !== storyId));
    } catch (error) {
      alert(error.message || "Eroare la aprobare.");
    }
  }

  async function rejectStory(storyId) {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/admin/stories/${storyId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reason:
              rejectReason ||
              "Povestea nu respectă regulile comunității.",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Nu s-a putut respinge povestea.");
      }

      setStories((prev) => prev.filter((story) => story._id !== storyId));
      setRejectReason("");
    } catch (error) {
      alert(error.message || "Eroare la respingere.");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>Review povești</h2>
        <p>Aprobă, respinge sau verifică poveștile flag-uite automat.</p>
      </div>

      <div className={styles.tabs}>
        {STATUS_TABS.map((tab) => (
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
      ) : stories.length === 0 ? (
        <div className={styles.empty}>Nu există povești în această categorie.</div>
      ) : (
        <div className={styles.list}>
          {stories.map((story) => (
            <article key={story._id} className={styles.card}>
              <div className={styles.cardTop}>
                <div>
                  <h3>{story.title}</h3>
                  <p>
                    Autor: {story.author?.name || "Utilizator"} (@
                    {story.author?.username})
                  </p>
                  <p>
                    Categorie: <strong>{story.category}</strong> ·{" "}
                    {formatDate(story.createdAt)}
                  </p>
                </div>

                <div className={styles.statusBox}>
                  <span>{story.status}</span>
                  <small>Risc: {story.safetyCheck?.riskLevel || "none"}</small>
                </div>
              </div>

              {story.safetyCheck?.flags?.length > 0 && (
                <div className={styles.flags}>
                  {story.safetyCheck.flags.map((flag) => (
                    <span key={flag}>{flag}</span>
                  ))}
                </div>
              )}

              {story.moderationReason && (
                <div className={styles.reason}>{story.moderationReason}</div>
              )}

              <div className={styles.storyBody}>{renderBlocks(story.blocks)}</div>

              {(status === "pending" || status === "flagged") && (
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.approveBtn}
                    onClick={() => approveStory(story._id)}
                  >
                    Aprobă
                  </button>

                  <input
                    type="text"
                    placeholder="Motiv respingere"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className={styles.reasonInput}
                  />

                  <button
                    type="button"
                    className={styles.rejectBtn}
                    onClick={() => rejectStory(story._id)}
                  >
                    Respinge
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