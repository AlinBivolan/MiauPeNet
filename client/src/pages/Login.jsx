import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, loadMe } from "../features/auth/authSlice";
import styles from "./Login.module.scss";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const loginResult = await dispatch(login({ email, password })).unwrap();

      if (loginResult?.token) {
        localStorage.setItem("token", loginResult.token);
      }

      let user = loginResult?.user || null;

      if (!user) {
        try {
          user = await dispatch(loadMe()).unwrap();
        } catch {
          user = null;
        }
      }

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));

        if (user.username) {
          localStorage.setItem("username", user.username);
        }
      }

      if (user?.role === "admin") {
        navigate("/admin", { replace: true });
        return;
      }

      navigate("/app/lessons", { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={`${styles.bubble} ${styles.bubbleBig}`}></div>
      <div className={`${styles.bubble} ${styles.bubbleLeftBottom}`}></div>
      <div className={`${styles.bubble} ${styles.bubbleSmallMiddle}`}></div>
      <div className={`${styles.bubble} ${styles.bubbleRightBottom}`}></div>

      <div className={styles.loginPanel}>
        <div className={styles.loginAvatar}>
          <div className={styles.avatarHead}></div>
          <div className={styles.avatarBody}></div>
        </div>

        <form className={styles.loginForm} onSubmit={onSubmit}>
          <input
            className={styles.loginInput}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className={styles.loginInput}
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className={styles.loginBtn}
            disabled={status === "loading"}
            type="submit"
          >
            {status === "loading" ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        <Link to="/" className={styles.backLink}>
          Go Back
        </Link>

        {error && <p className={styles.loginError}>{error}</p>}
      </div>
    </div>
  );
}