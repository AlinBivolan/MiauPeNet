import { NavLink, Outlet, useLocation } from "react-router-dom";
import styles from "./AppLayout.module.scss";
import avatar from "/img/usable/landing-cat.png";

export default function AppLayout() {
  const location = useLocation();

  const storedUser = localStorage.getItem("user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;

  const myUsername =
    localStorage.getItem("username") || parsedUser?.username || "alex2345";

  const isProfilePage = location.pathname.startsWith("/app/profile");

  return (
    <div className={styles.appLayout}>
      <aside className={styles.sidebar}>
        <nav className={styles.nav}>
          <NavLink
            to="/app/lessons"
            className={({ isActive }) =>
              isActive ? styles.activeLink : styles.link
            }
          >
            LECTII
          </NavLink>

          <NavLink
            to="/app/journal"
            className={({ isActive }) =>
              isActive ? styles.activeLink : styles.link
            }
          >
            JURNAL
          </NavLink>

          <NavLink
            to="/app/games"
            className={({ isActive }) =>
              isActive ? styles.activeLink : styles.link
            }
          >
            JOCURI
          </NavLink>

          <NavLink
            to={`/app/profile/${myUsername}/realizari`}
            className={() =>
              isProfilePage ? styles.activeLink : styles.link
            }
          >
            PROFIL
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userBox}>
            <img src={avatar} alt="avatar" className={styles.userAvatar} />
            <span className={styles.userName}>Miau pe Net</span>
          </div>
        </div>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}