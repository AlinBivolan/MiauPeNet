import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.scss";
import logo from "../../assets/test.jpg";

export default function ProfileHeader({ user, isOwnProfile }) {
  const navigate = useNavigate();

  const avatarSrc = user.avatar
    ? `http://localhost:5000${user.avatar}`
    : logo;

  const coverStyle = user.coverImage
    ? {
        backgroundImage: `url(http://localhost:5000${user.coverImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  return (
    <div className={styles.header}>
      <div className={styles.cover} style={coverStyle} />

      <div className={styles.headerContent}>
        {isOwnProfile && (
          <button
            className={styles.settingsBtn}
            onClick={() => navigate("/app/profile/settings")}
            type="button"
          >
            ⚙
          </button>
        )}

        <img className={styles.avatar} src={avatarSrc} alt="avatar" />

        <h2>{user.name}</h2>
        <div className={styles.username}>@{user.username}</div>

        <p className={styles.quote}>
          “{user.quote || "Nu ai adăugat încă o descriere."}”
        </p>
      </div>
    </div>
  );
}