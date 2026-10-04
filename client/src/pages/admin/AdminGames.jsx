import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteAdminGame, getAdminGames } from "../../api/adminGameApi";
import styles from "./AdminGames.module.scss";

export default function AdminGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadGames() {
    try {
      setLoading(true);
      setError("");

      const res = await getAdminGames();
      setGames(res.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Nu s-au putut încărca jocurile."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Sigur vrei să ștergi acest joc?");
    if (!confirmed) return;

    try {
      await deleteAdminGame(id);
      setGames((prev) => prev.filter((game) => game._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Nu s-a putut șterge jocul.");
    }
  }

  useEffect(() => {
    loadGames();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Se încarcă jocurile...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h1>Jocuri</h1>
          <p>Administrează jocurile cyber din aplicație.</p>
        </div>

        <Link to="/admin/games/new" className={styles.addLink}>
          <button type="button" className={styles.addButton}>
            Adaugă joc
          </button>
        </Link>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.gamesTable}>
            <thead>
              <tr>
                <th>Ordine</th>
                <th>Titlu</th>
                <th>Key</th>
                <th>Tip</th>
                <th>Dificultate</th>
                <th>Activ</th>
                <th>Acțiuni</th>
              </tr>
            </thead>

            <tbody>
              {games.map((game) => (
                <tr key={game._id}>
                  <td>{game.order}</td>
                  <td>
                    <div className={styles.titleCell}>
                      <span className={styles.iconBadge}>{game.icon}</span>
                      <span>{game.title}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.keyBadge}>{game.key}</span>
                  </td>
                  <td>{game.type}</td>
                  <td>{game.difficulty}</td>
                  <td>
                    <span
                      className={
                        game.isActive ? styles.activeBadge : styles.inactiveBadge
                      }
                    >
                      {game.isActive ? "Da" : "Nu"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link to={`/admin/games/${game._id}/edit`}>
                        <button type="button" className={styles.editButton}>
                          Editează
                        </button>
                      </Link>

                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => handleDelete(game._id)}
                      >
                        Șterge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {games.length === 0 && (
          <div className={styles.emptyState}>Nu există jocuri încă.</div>
        )}
      </div>
    </div>
  );
}