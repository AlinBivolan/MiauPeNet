import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import styles from "./Profile.module.scss";
import { analyzeText } from "../../api/safetyCheck";

const CATEGORIES = [
  "Lecții",
  "Jocuri",
  "Reușite",
  "Gânduri",
  "Creativitate",
  "Aventuri online",
];

function formatCreatedAt(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function resolveImageUrl(imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return `http://localhost:5000${imagePath}`;
}

function createEmptyTextBlock(order) {
  return {
    type: "text",
    content: "",
    order,
  };
}

function extractFullText(title, blocks) {
  const blockText = blocks
    .filter((block) => block.type === "text")
    .map((block) => block.content || "")
    .join(" ");

  return `${title || ""} ${blockText}`.trim();
}

export default function ProfileJournalTab() {
  const { username, isOwnProfile } = useOutletContext();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState(null);

  const [safety, setSafety] = useState({
    risk: "none",
    flags: [],
  });

  const [formData, setFormData] = useState({
    title: "",
    category: CATEGORIES[0],
    blocks: [createEmptyTextBlock(0)],
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    setLoading(true);
    setError("");

    fetch(`http://localhost:5000/api/stories/user/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Nu s-au putut încărca poveștile.");
        }

        const json = await res.json();
        setStories(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "A apărut o eroare.");
        setLoading(false);
      });
  }, [username]);

  useEffect(() => {
    const fullText = extractFullText(formData.title, formData.blocks);
    const result = analyzeText(fullText);
    setSafety(result);
  }, [formData.title, formData.blocks]);

  useEffect(() => {
    if (!isModalOpen) return;

    const fullText = extractFullText(formData.title, formData.blocks);
    if (!fullText || fullText.length < 8) return;

    const timeout = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");

        await fetch("http://localhost:5000/api/safety/draft-check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: formData.title,
            blocks: formData.blocks,
          }),
        });
      } catch {
        // Nu blocăm utilizatorul dacă alerta nu poate fi salvată.
      }
    }, 1200);

    return () => clearTimeout(timeout);
  }, [isModalOpen, formData.title, formData.blocks]);

  const imageCount = useMemo(
    () => formData.blocks.filter((block) => block.type === "image").length,
    [formData.blocks]
  );

  function openCreateModal() {
    setEditingStoryId(null);
    setSafety({ risk: "none", flags: [] });
    setFormData({
      title: "",
      category: CATEGORIES[0],
      blocks: [createEmptyTextBlock(0)],
    });
    setIsModalOpen(true);
  }

  function openEditModal(story) {
    setEditingStoryId(story._id);
    setSafety({ risk: "none", flags: [] });
    setFormData({
      title: story.title,
      category: story.category,
      blocks: [...(story.blocks || [])].sort((a, b) => a.order - b.order),
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingStoryId(null);
    setSafety({ risk: "none", flags: [] });
    setFormData({
      title: "",
      category: CATEGORIES[0],
      blocks: [createEmptyTextBlock(0)],
    });
  }

  function updateBlock(index, field, value) {
    setFormData((prev) => {
      const nextBlocks = [...prev.blocks];
      nextBlocks[index] = {
        ...nextBlocks[index],
        [field]: value,
      };

      return {
        ...prev,
        blocks: nextBlocks,
      };
    });
  }

  function addTextBlock() {
    setFormData((prev) => ({
      ...prev,
      blocks: [...prev.blocks, createEmptyTextBlock(prev.blocks.length)],
    }));
  }

  function addImagePlaceholder() {
    if (imageCount >= 5) {
      alert("Poți adăuga maximum 5 imagini.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      blocks: [
        ...prev.blocks,
        {
          type: "image",
          imageUrl: "",
          order: prev.blocks.length,
        },
      ],
    }));
  }

  function removeBlock(index) {
    setFormData((prev) => {
      const nextBlocks = prev.blocks
        .filter((_, i) => i !== index)
        .map((block, i) => ({
          ...block,
          order: i,
        }));

      return {
        ...prev,
        blocks: nextBlocks.length > 0 ? nextBlocks : [createEmptyTextBlock(0)],
      };
    });
  }

  function moveBlock(index, direction) {
    setFormData((prev) => {
      const nextBlocks = [...prev.blocks];
      const newIndex = index + direction;

      if (newIndex < 0 || newIndex >= nextBlocks.length) {
        return prev;
      }

      [nextBlocks[index], nextBlocks[newIndex]] = [
        nextBlocks[newIndex],
        nextBlocks[index],
      ];

      return {
        ...prev,
        blocks: nextBlocks.map((block, i) => ({
          ...block,
          order: i,
        })),
      };
    });
  }

  async function handleImageUpload(file, index) {
    if (!file) return;

    try {
      setUploadingImage(true);

      const token = localStorage.getItem("token");
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);

      const res = await fetch("http://localhost:5000/api/stories/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Imaginea nu a putut fi urcată.");
      }

      updateBlock(index, "imageUrl", data.imageUrl);
    } catch (err) {
      alert(err.message || "A apărut o eroare la upload.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSaveStory(e) {
    e.preventDefault();

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      const payload = {
        title: formData.title,
        category: formData.category,
        blocks: formData.blocks
          .map((block, index) => ({
            ...block,
            order: index,
          }))
          .filter((block) => {
            if (block.type === "text") return block.content?.trim();
            if (block.type === "image") return block.imageUrl?.trim();
            return false;
          }),
        safetyCheck: safety,
      };

      const url = editingStoryId
        ? `http://localhost:5000/api/stories/${editingStoryId}`
        : "http://localhost:5000/api/stories";

      const method = editingStoryId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Povestea nu a putut fi salvată.");
      }

      const savedStory = data.story || data;

      if (editingStoryId) {
        setStories((prev) =>
          prev.map((story) =>
            story._id === editingStoryId ? savedStory : story
          )
        );
      } else {
        setStories((prev) => [savedStory, ...prev]);
      }

      alert(data.message || "Povestea a fost trimisă spre verificare.");
      closeModal();
    } catch (err) {
      alert(err.message || "A apărut o eroare la salvare.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteStory(storyId) {
    const confirmed = window.confirm("Sigur vrei să ștergi această poveste?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/stories/${storyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Povestea nu a putut fi ștearsă.");
      }

      setStories((prev) => prev.filter((story) => story._id !== storyId));
    } catch (err) {
      alert(err.message || "A apărut o eroare la ștergere.");
    }
  }

  function getStatusLabel(status) {
    if (status === "approved") return "Aprobată";
    if (status === "pending") return "În verificare";
    if (status === "flagged") return "Verificare prioritară";
    if (status === "rejected") return "Respinsă";
    return "În verificare";
  }

  function getStatusClass(status) {
    if (status === "approved") return styles.statusApproved;
    if (status === "pending") return styles.statusPending;
    if (status === "flagged") return styles.statusFlagged;
    if (status === "rejected") return styles.statusRejected;
    return styles.statusPending;
  }

  function renderBlocks(blocks) {
    return [...(blocks || [])]
      .sort((a, b) => a.order - b.order)
      .map((block, index) => {
        if (block.type === "text") {
          return (
            <p key={`${block.type}-${index}`} className={styles.storyParagraph}>
              {block.content}
            </p>
          );
        }

        if (block.type === "image") {
          return (
            <img
              key={`${block.type}-${index}`}
              src={resolveImageUrl(block.imageUrl)}
              alt="story visual"
              className={styles.userStoryImage}
            />
          );
        }

        return null;
      });
  }

  return (
    <div className={styles.journalTabPage}>
      {isOwnProfile && (
        <div className={styles.journalActions}>
          <button
            type="button"
            className={styles.addStoryBtn}
            onClick={openCreateModal}
          >
            Adaugă poveste
          </button>
        </div>
      )}

      {loading ? (
        <div className={styles.emptyStories}>Se încarcă poveștile...</div>
      ) : error ? (
        <div className={styles.emptyStories}>{error}</div>
      ) : (
        <div className={styles.userStories}>
          {stories.length === 0 ? (
            <div className={styles.emptyStories}>Nu există povești încă.</div>
          ) : (
            stories.map((story) => (
              <article key={story._id} className={styles.userStoryCard}>
                <div className={styles.storyCategoryLine}>
                  <div className={styles.storyBadges}>
                    <span className={styles.categoryBadge}>{story.category}</span>

                    {isOwnProfile && (
                      <span
                        className={`${styles.storyStatusBadge} ${getStatusClass(
                          story.status
                        )}`}
                      >
                        {getStatusLabel(story.status)}
                      </span>
                    )}
                  </div>

                  {isOwnProfile && (
                    <div className={styles.storyActionsInline}>
                      <button
                        type="button"
                        className={styles.smallActionBtn}
                        onClick={() => openEditModal(story)}
                      >
                        Editează
                      </button>

                      <button
                        type="button"
                        className={styles.smallDeleteBtn}
                        onClick={() => handleDeleteStory(story._id)}
                      >
                        Șterge
                      </button>
                    </div>
                  )}
                </div>

                {isOwnProfile && story.moderationReason ? (
                  <div className={styles.storyModerationReason}>
                    {story.moderationReason}
                  </div>
                ) : null}

                <div className={styles.userStoryContent}>
                  <h3>{story.title}</h3>
                  <span>{formatCreatedAt(story.createdAt)}</span>
                  <div className={styles.storyBlocks}>
                    {renderBlocks(story.blocks)}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalCard} ${styles.storyModalCard}`}>
            <div className={styles.modalHeader}>
              <div>
                <h3>{editingStoryId ? "Editează povestea" : "Adaugă o poveste"}</h3>
                <p className={styles.modalSubtitle}>
                  Creează o poveste cu text, imagini și multă creativitate.
                </p>
              </div>

              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={closeModal}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStory} className={styles.storyForm}>
              <label className={styles.formGroup}>
                <span>Titlu</span>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className={styles.input}
                  required
                />
              </label>

              <label className={styles.formGroup}>
                <span>Categorie</span>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className={styles.input}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <div className={styles.builderActions}>
                <button
                  type="button"
                  className={styles.storyBuilderBtn}
                  onClick={addTextBlock}
                >
                  + Text
                </button>

                <button
                  type="button"
                  className={styles.storyBuilderBtn}
                  onClick={addImagePlaceholder}
                >
                  + Imagine
                </button>
              </div>

              <div className={styles.blocksList}>
                {formData.blocks.map((block, index) => (
                  <div key={`${block.type}-${index}`} className={styles.blockEditor}>
                    <div className={styles.blockTop}>
                      <strong>
                        {block.type === "text" ? "Bloc text" : "Bloc imagine"}
                      </strong>

                      <div className={styles.blockControls}>
                        <button
                          type="button"
                          className={styles.storyMiniBtn}
                          onClick={() => moveBlock(index, -1)}
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          className={styles.storyMiniBtn}
                          onClick={() => moveBlock(index, 1)}
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          className={styles.storyMiniDeleteBtn}
                          onClick={() => removeBlock(index)}
                        >
                          Șterge
                        </button>
                      </div>
                    </div>

                    {block.type === "text" ? (
                      <textarea
                        className={styles.textarea}
                        value={block.content || ""}
                        onChange={(e) => updateBlock(index, "content", e.target.value)}
                        placeholder="Scrie textul acestui bloc"
                      />
                    ) : (
                      <div className={styles.imageBlockEditor}>
                        {block.imageUrl ? (
                          <img
                            src={resolveImageUrl(block.imageUrl)}
                            alt="preview"
                            className={styles.builderImagePreview}
                          />
                        ) : (
                          <div className={styles.noImageBox}>
                            Nu ai selectat încă o imagine
                          </div>
                        )}

                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          className={styles.fileInput}
                          onChange={(e) =>
                            handleImageUpload(e.target.files?.[0] || null, index)
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.formHint}>
                Poți avea maximum 5 imagini. Acum ai: {imageCount}/5
              </div>

              {safety.risk === "medium" && (
                <div className={styles.safetyWarning}>
                  ⚠️ Observăm că povestea ta exprimă emoții dificile. Povestea va
                  fi verificată cu atenție înainte să apară public.
                </div>
              )}

              {safety.risk === "high" && (
                <div className={styles.safetyDanger}>
                  ❤️ Nu ești singur/ă. Dacă treci printr-un moment greu, vorbește
                  cu cineva de încredere sau cu un adult. Povestea va fi trimisă
                  către verificare prioritară și nu va apărea public automat.
                </div>
              )}

              <button
                type="submit"
                className={styles.storySubmitBtn}
                disabled={submitting || uploadingImage}
              >
                {submitting
                  ? "Se salvează..."
                  : editingStoryId
                  ? "Trimite modificările spre verificare"
                  : "Trimite spre verificare"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}