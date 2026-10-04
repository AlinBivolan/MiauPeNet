import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import styles from "./Profile.module.scss";

export default function Profile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { username } = useParams();

  const myUsername = useMemo(() => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    return localStorage.getItem("username") || parsedUser?.username || "";
  }, []);

  const isOwnProfile = username === myUsername;

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user");
    navigate("/login");
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    setLoading(true);
    setError("");

    fetch(`http://localhost:5000/api/users/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Nu s-a găsit profilul.");
        }

        const json = await res.json();
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Eroare la încărcarea profilului.");
        setLoading(false);
      });
  }, [username]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!data) return <div>Eroare la încărcare profil</div>;

  return (
    <div className={styles.profilePage}>
      <ProfileHeader user={data} isOwnProfile={isOwnProfile} />
      <ProfileTabs username={username} />

      <div className={styles.profileContent}>
        <Outlet
          context={{
            data,
            handleLogout,
            isOwnProfile,
            username,
          }}
        />
      </div>
    </div>
  );
}