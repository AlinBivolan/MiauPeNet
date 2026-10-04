import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import styles from "./Register.module.scss";

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [ageGroup, setAgeGroup] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState(null);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const goToStep2 = (selectedAgeGroup) => {
    setAgeGroup(selectedAgeGroup);
    setError(null);
    setPasswordErrors([]);
    setStep(2);
  };

  const nextStep = () => {
    if (!name || !email) {
      setError("Numele și emailul sunt obligatorii");
      return;
    }

    setError(null);
    setPasswordErrors([]);
    setStep(3);
  };

  const submit = async (e) => {
    e.preventDefault();

    setError(null);
    setPasswordErrors([]);

    if (!ageGroup) {
      setError("Alege grupa de vârstă");
      setStep(1);
      return;
    }

    if (!name || !email) {
      setError("Numele și emailul sunt obligatorii");
      setStep(2);
      return;
    }

    if (!password || !confirmPassword) {
      setError("Completează parola și confirmarea parolei");
      return;
    }

    if (password !== confirmPassword) {
      setError("Parolele nu se potrivesc");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/auth/register", {
        name,
        email,
        password,
        ageGroup,
      });

      navigate("/login");
    } catch (err) {
      const data = err.response?.data;

      if (data?.errors && Array.isArray(data.errors)) {
        setError(data.message || "Parola nu respectă cerințele");
        setPasswordErrors(data.errors);
      } else {
        setError(data?.message || "Înregistrarea a eșuat");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className={`${styles.bubble} ${styles.bubbleBig}`}></div>
      <div className={`${styles.bubble} ${styles.bubbleLeftBottom}`}></div>
      <div className={`${styles.bubble} ${styles.bubbleSmallMiddle}`}></div>
      <div className={`${styles.bubble} ${styles.bubbleRightBottom}`}></div>

      <div className={styles.registerPanel}>
        <div className={styles.registerAvatar}>
          <div className={styles.avatarHead}></div>
          <div className={styles.avatarBody}></div>
        </div>

        {step === 1 && (
          <div className={styles.registerForm}>
            <h2 className={styles.stepTitle}>Alege grupa de vârstă</h2>

            <button
              type="button"
              className={styles.registerBtn}
              onClick={() => goToStep2("under_12")}
            >
              SUB 12 ANI
            </button>

            <button
              type="button"
              className={styles.registerBtn}
              onClick={() => goToStep2("over_or_equal_12")}
            >
              12 ANI SAU MAI MULT
            </button>

            {error && <p className={styles.registerError}>{error}</p>}

            <Link to="/" className={styles.backLink}>
              Înapoi
            </Link>
          </div>
        )}

        {step === 2 && (
          <div className={styles.registerForm}>
            <input
              className={styles.registerInput}
              type="text"
              placeholder="Nume"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className={styles.registerInput}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {error && <p className={styles.registerError}>{error}</p>}

            <button className={styles.registerBtn} onClick={nextStep}>
              NEXT
            </button>

            <button
              type="button"
              className={styles.backBtn}
              onClick={() => {
                setStep(1);
                setError(null);
                setPasswordErrors([]);
              }}
            >
              BACK
            </button>
          </div>
        )}

        {step === 3 && (
          <form className={styles.registerForm} onSubmit={submit}>
            <input
              className={styles.registerInput}
              type="password"
              placeholder="Parolă"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              className={styles.registerInput}
              type="password"
              placeholder="Confirmă parola"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && <p className={styles.registerError}>{error}</p>}

            {passwordErrors.length > 0 && (
              <ul className={styles.passwordErrorList}>
                {passwordErrors.map((err, index) => (
                  <li key={index} className={styles.passwordErrorItem}>
                    {err}
                  </li>
                ))}
              </ul>
            )}

            <button
              className={styles.registerBtn}
              type="submit"
              disabled={loading}
            >
              {loading ? "SE CREEAZĂ..." : "CREATE ACCOUNT"}
            </button>

            <button
              type="button"
              className={styles.backBtn}
              onClick={() => {
                setStep(2);
                setError(null);
                setPasswordErrors([]);
              }}
            >
              BACK
            </button>
          </form>
        )}
      </div>
    </div>
  );
}