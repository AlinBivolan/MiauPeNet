import { useEffect, useState } from "react";
import {
  checkGameAnswer,
  getGameById,
  getGames,
} from "../api/gamesApi";
import styles from "./Games.module.scss";

export default function Games() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameLoading, setGameLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  async function loadGames() {
    try {
      setLoading(true);
      setError("");

      const res = await getGames();
      setGames(res.data.games || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Nu s-au putut încărca jocurile."
      );
    } finally {
      setLoading(false);
    }
  }

  async function openGame(gameId) {
    try {
      setGameLoading(true);
      setError("");
      setAnswer("");
      setFeedback("");
      setIsCorrect(null);

      const res = await getGameById(gameId);
      setSelectedGame(res.data.game);
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut încărca jocul.");
    } finally {
      setGameLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!selectedGame || !answer.trim()) {
      setFeedback("Scrie un răspuns înainte de verificare.");
      setIsCorrect(false);
      return;
    }

    try {
      setChecking(true);
      setFeedback("");

      const res = await checkGameAnswer(selectedGame.id, {
        answer,
      });

      setIsCorrect(res.data.isCorrect);
      setFeedback(res.data.feedback);

      if (res.data.isCorrect) {
        setSelectedGame((prev) =>
          prev ? { ...prev, completed: true } : prev
        );

        setGames((prev) =>
          prev.map((game) =>
            game.id === selectedGame.id
              ? { ...game, completed: true }
              : game
          )
        );
      }
    } catch (err) {
      setIsCorrect(false);
      setFeedback(
        err.response?.data?.message || "Nu s-a putut verifica răspunsul."
      );
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    loadGames();
  }, []);

  if (loading) {
    return (
      <div className={styles.gamesPage}>
        <h1>Jocuri</h1>
        <p>Se încarcă jocurile...</p>
      </div>
    );
  }

  return (
    <div className={styles.gamesPage}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Misiuni Cyber</p>
          <h1>Jocuri pentru detectivi digitali</h1>
          <p>
            Descifrează mesaje, rezolvă coduri și învață reguli importante
            pentru siguranța online.
          </p>
        </div>
      </header>

      {error && <div className={styles.errorBox}>{error}</div>}

<section className={styles.cardsGrid}>
  {games.map((game) => (
    <button
      key={game.id}
      type="button"
      className={game.completed ? styles.completedCard : styles.gameCard}
      onClick={() => openGame(game.id)}
    >
      <div className={styles.cardIcon}>{game.icon}</div>

      <div className={styles.cardContent}>
        <h2>{game.title}</h2>

        <span className={game.completed ? styles.solvedBadge : styles.unsolvedBadge}>
          {game.completed ? "Rezolvat corect" : "Nerezolvat"}
        </span>
      </div>
    </button>
  ))}
</section>

      <section className={styles.playArea}>
        {!selectedGame && (
          <div className={styles.emptyState}>
            <h2>Alege o misiune</h2>
            <p>
              Apasă pe unul dintre carduri pentru a începe jocul. Toate
              misiunile sunt deblocate.
            </p>
          </div>
        )}

        {gameLoading && (
          <div className={styles.emptyState}>
            <h2>Se încarcă misiunea...</h2>
          </div>
        )}

        {selectedGame && !gameLoading && (
          <article className={styles.gamePanel}>
            <div className={styles.gamePanelHeader}>
              <div>
                <span className={styles.status}>
                  {selectedGame.completed ? "Completat" : "În desfășurare"}
                </span>
                <h2>{selectedGame.title}</h2>
                <p>{selectedGame.subtitle}</p>
              </div>

              <div className={styles.bigIcon}>{selectedGame.icon}</div>
            </div>

            <div className={styles.infoBlock}>
              <h3>Informații</h3>
              <p>{selectedGame.story}</p>
            </div>

            <div className={styles.infoBlock}>
              <h3>Explicații</h3>
              <p>{selectedGame.explanation}</p>
            </div>

            <div className={styles.encodedBox}>
              <span>{selectedGame.encodedLabel}</span>
              <strong>{selectedGame.encodedMessage}</strong>
            </div>

            {selectedGame.helperTable?.length > 0 && (
              <div className={styles.helperTable}>
                {selectedGame.helperTable.map((item) => (
                  <div key={`${item.code}-${item.letter}`}>
                    <strong>{item.code}</strong>
                    <span>{item.letter}</span>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.hintBox}>
              <strong>Indiciu:</strong> {selectedGame.hint}
            </div>

            <form onSubmit={handleSubmit} className={styles.answerForm}>
              <label htmlFor="game-answer">Cerință</label>
              <p>{selectedGame.task}</p>

              <input
                id="game-answer"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Scrie răspunsul aici..."
                autoComplete="off"
              />

              <button type="submit" disabled={checking}>
                {checking ? "Se verifică..." : "Verifică răspunsul"}
              </button>
            </form>

{feedback && (
  <div
    className={
      isCorrect ? styles.successFeedback : styles.failFeedback
    }
  >
    <strong>
      {isCorrect ? "✅ Răspuns corect! Joc rezolvat." : "❌ Răspuns greșit."}
    </strong>
    <p>{feedback}</p>
  </div>
)}
          </article>
        )}
      </section>
    </div>
  );
}