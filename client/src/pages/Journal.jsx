import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Journal.module.scss";

const CATEGORIES = [
  "Toate",
  "Lecții",
  "Jocuri",
  "Reușite",
  "Gânduri",
  "Creativitate",
  "Aventuri online",
];

const LIMIT = 10;

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

function resolveAvatarUrl(avatarPath) {
  if (!avatarPath) return "/img/usable/avatar.png";
  if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
    return avatarPath;
  }
  return `http://localhost:5000${avatarPath}`;
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
            className={styles.storyImage}
          />
        );
      }

      return null;
    });
}

export default function Journal() {
  const [stories, setStories] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toate");
  const [sortBy, setSortBy] = useState("newest");
  const [onlyWithImages, setOnlyWithImages] = useState(false);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    params.set("limit", LIMIT);
    params.set("search", search.trim());
    params.set("category", selectedCategory);
    params.set("sort", sortBy);
    params.set("onlyWithImages", String(onlyWithImages));

    return params;
  }, [search, selectedCategory, sortBy, onlyWithImages]);

  async function loadStories(nextPage = 1, mode = "replace") {
    try {
      if (mode === "replace") {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      setError("");

      const token = localStorage.getItem("token");

      const params = new URLSearchParams(queryParams);
      params.set("page", nextPage);

      const res = await fetch(
        `http://localhost:5000/api/stories/feed?${params.toString()}`,
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

      setStories((prev) =>
        mode === "append" ? [...prev, ...data.stories] : data.stories
      );

      setPage(data.page);
      setHasMore(data.hasMore);
      setTotal(data.total);
    } catch (err) {
      setError(err.message || "A apărut o eroare.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadStories(1, "replace");
    }, 350);

    return () => clearTimeout(timeout);
  }, [queryParams]);

  function handleLoadMore() {
    loadStories(page + 1, "append");
  }

  if (loading) {
    return (
      <div className={styles.journalPage}>
        <div className={styles.header}>
          <h1>Jurnal</h1>
          <p>Se încarcă poveștile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.journalPage}>
        <div className={styles.header}>
          <h1>Jurnal</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.journalPage}>
      <div className={styles.header}>
        <h1>Jurnal</h1>
        <p>
          Descoperă poveștile celorlalți utilizatori. Rezultate găsite: {total}
        </p>
      </div>

      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Caută după titlu, text sau categorie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={styles.sortSelect}
        >
          <option value="newest">Cele mai noi</option>
          <option value="oldest">Cele mai vechi</option>
        </select>
      </div>

      <div className={styles.filtersRow}>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            className={
              selectedCategory === category
                ? styles.activeFilterChip
                : styles.filterChip
            }
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}

        <button
          type="button"
          className={onlyWithImages ? styles.activeFilterChip : styles.filterChip}
          onClick={() => setOnlyWithImages((prev) => !prev)}
        >
          Cu poze
        </button>
      </div>

      <div className={styles.feed}>
        {stories.length === 0 ? (
          <div className={styles.emptyFeed}>
            Nu există povești care să se potrivească.
          </div>
        ) : (
          stories.map((story) => (
            <article key={story._id} className={styles.storyCard}>
              <Link
                to={`/app/profile/${story.author?.username}/realizari`}
                className={styles.authorBox}
              >
                <img
                  src={resolveAvatarUrl(story.author?.avatar)}
                  alt={story.author?.name || "user"}
                  className={styles.authorAvatar}
                />

                <div>
                  <div className={styles.authorName}>
                    {story.author?.name || "Utilizator"}
                  </div>

                  <div className={styles.authorUsername}>
                    @{story.author?.username || "user"} ·{" "}
                    {formatCreatedAt(story.createdAt)}
                  </div>
                </div>
              </Link>

              <div className={styles.storyMeta}>
                <span className={styles.categoryBadge}>{story.category}</span>
              </div>

              <div className={styles.storyContent}>
                <h3>{story.title}</h3>
                {renderBlocks(story.blocks)}
              </div>
            </article>
          ))
        )}
      </div>

      {hasMore && (
        <div className={styles.loadMoreWrap}>
          <button
            type="button"
            className={styles.loadMoreBtn}
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Se încarcă..." : "Încarcă mai multe"}
          </button>
        </div>
      )}
    </div>
  );
}