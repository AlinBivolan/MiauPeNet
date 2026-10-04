import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createAdminGame,
  getAdminGameById,
  updateAdminGame,
} from "../../api/adminGameApi";

const EMPTY_FORM = {
  key: "",
  title: "",
  subtitle: "",
  type: "caesar",
  difficulty: "Ușor",
  estimatedMinutes: 5,
  icon: "🎮",
  order: 1,
  story: "",
  explanation: "",
  encodedLabel: "Mesaj",
  encodedMessage: "",
  hint: "",
  task: "",
  helperTableText: "",
  correctAnswer: "",
  acceptedAnswersText: "",
  successText: "Corect!",
  failText: "Răspuns greșit. Mai încearcă.",
  isActive: true,
};

function helperTableToText(helperTable = []) {
  return helperTable
    .map((item) => `${item.code}=${item.letter}`)
    .join("\n");
}

function textToHelperTable(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [code, ...rest] = line.split("=");
      return {
        code: String(code || "").trim(),
        letter: rest.join("=").trim(),
      };
    })
    .filter((item) => item.code && item.letter);
}

function textToAcceptedAnswers(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function AdminGameForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const title = useMemo(
    () => (isEdit ? "Editează joc" : "Adaugă joc"),
    [isEdit]
  );

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function loadGame() {
    try {
      setLoading(true);
      setError("");

      const res = await getAdminGameById(id);
      const game = res.data;

      setForm({
        key: game.key || "",
        title: game.title || "",
        subtitle: game.subtitle || "",
        type: game.type || "caesar",
        difficulty: game.difficulty || "Ușor",
        estimatedMinutes: game.estimatedMinutes || 5,
        icon: game.icon || "🎮",
        order: game.order || 1,
        story: game.story || "",
        explanation: game.explanation || "",
        encodedLabel: game.encodedLabel || "Mesaj",
        encodedMessage: game.encodedMessage || "",
        hint: game.hint || "",
        task: game.task || "",
        helperTableText: helperTableToText(game.helperTable || []),
        correctAnswer: game.correctAnswer || "",
        acceptedAnswersText: (game.acceptedAnswers || []).join("\n"),
        successText: game.successText || "Corect!",
        failText: game.failText || "Răspuns greșit. Mai încearcă.",
        isActive: game.isActive !== false,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut încărca jocul.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        key: form.key,
        title: form.title,
        subtitle: form.subtitle,
        type: form.type,
        difficulty: form.difficulty,
        estimatedMinutes: Number(form.estimatedMinutes),
        icon: form.icon,
        order: Number(form.order),
        story: form.story,
        explanation: form.explanation,
        encodedLabel: form.encodedLabel,
        encodedMessage: form.encodedMessage,
        hint: form.hint,
        task: form.task,
        helperTable: textToHelperTable(form.helperTableText),
        correctAnswer: form.correctAnswer,
        acceptedAnswers: textToAcceptedAnswers(form.acceptedAnswersText),
        successText: form.successText,
        failText: form.failText,
        isActive: form.isActive,
      };

      if (isEdit) {
        await updateAdminGame(id, payload);
      } else {
        await createAdminGame(payload);
      }

      navigate("/admin/games");
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut salva jocul.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (isEdit) {
      loadGame();
    }
  }, [id]);

  if (loading) return <div>Se încarcă jocul...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1>{title}</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Key</label>
        <input
          value={form.key}
          onChange={(e) => updateField("key", e.target.value)}
          placeholder="caesar"
          required
        />

        <label>Titlu</label>
        <input
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          required
        />

        <label>Subtitlu</label>
        <input
          value={form.subtitle}
          onChange={(e) => updateField("subtitle", e.target.value)}
        />

        <label>Tip joc</label>
        <select
          value={form.type}
          onChange={(e) => updateField("type", e.target.value)}
        >
          <option value="caesar">Cifrul lui Cezar</option>
          <option value="morse">Cod Morse</option>
          <option value="binary">Cod binar</option>
        </select>

        <label>Dificultate</label>
        <select
          value={form.difficulty}
          onChange={(e) => updateField("difficulty", e.target.value)}
        >
          <option value="Ușor">Ușor</option>
          <option value="Mediu">Mediu</option>
          <option value="Greu">Greu</option>
        </select>

        <label>Minute estimate</label>
        <input
          type="number"
          value={form.estimatedMinutes}
          onChange={(e) => updateField("estimatedMinutes", e.target.value)}
        />

        <label>Icon</label>
        <input
          value={form.icon}
          onChange={(e) => updateField("icon", e.target.value)}
        />

        <label>Ordine</label>
        <input
          type="number"
          value={form.order}
          onChange={(e) => updateField("order", e.target.value)}
          required
        />

        <label>Poveste / Informații</label>
        <textarea
          value={form.story}
          onChange={(e) => updateField("story", e.target.value)}
          required
        />

        <label>Explicații</label>
        <textarea
          value={form.explanation}
          onChange={(e) => updateField("explanation", e.target.value)}
          required
        />

        <label>Etichetă mesaj</label>
        <input
          value={form.encodedLabel}
          onChange={(e) => updateField("encodedLabel", e.target.value)}
        />

        <label>Mesaj codificat</label>
        <textarea
          value={form.encodedMessage}
          onChange={(e) => updateField("encodedMessage", e.target.value)}
          required
        />

        <label>Indiciu</label>
        <textarea
          value={form.hint}
          onChange={(e) => updateField("hint", e.target.value)}
        />

        <label>Cerință</label>
        <textarea
          value={form.task}
          onChange={(e) => updateField("task", e.target.value)}
          required
        />

        <label>Tabel ajutor</label>
        <textarea
          value={form.helperTableText}
          onChange={(e) => updateField("helperTableText", e.target.value)}
          placeholder={".-=A\n-...=B"}
        />

        <label>Răspuns corect</label>
        <input
          value={form.correctAnswer}
          onChange={(e) => updateField("correctAnswer", e.target.value)}
          required
        />

        <label>Răspunsuri acceptate, unul pe linie</label>
        <textarea
          value={form.acceptedAnswersText}
          onChange={(e) => updateField("acceptedAnswersText", e.target.value)}
        />

        <label>Feedback corect</label>
        <textarea
          value={form.successText}
          onChange={(e) => updateField("successText", e.target.value)}
        />

        <label>Feedback greșit</label>
        <textarea
          value={form.failText}
          onChange={(e) => updateField("failText", e.target.value)}
        />

        <label>
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => updateField("isActive", e.target.checked)}
          />
          Activ
        </label>

        <div style={{ marginTop: 20 }}>
          <button type="submit" disabled={saving}>
            {saving ? "Se salvează..." : "Salvează"}
          </button>{" "}
          <button
            type="button"
            onClick={() => navigate("/admin/games")}
          >
            Anulează
          </button>
        </div>
      </form>

      <style>{`
        form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        input, textarea, select {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 14px;
        }

        textarea {
          min-height: 90px;
        }

        label {
          font-weight: 700;
          margin-top: 10px;
        }

        button {
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #ccc;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}