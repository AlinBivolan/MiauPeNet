import { NavLink } from "react-router-dom";
import styles from "./AdminSidebar.module.scss";

export default function AdminSidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>Admin</div>

      <nav className={styles.nav}>
        <NavLink
          to="/admin/categories"
          className={({ isActive }) =>
            isActive ? styles.activeLink : styles.link
          }
        >
          Categorii
        </NavLink>

        <NavLink
          to="/admin/lessons"
          className={({ isActive }) =>
            isActive ? styles.activeLink : styles.link
          }
        >
          Lecții
        </NavLink>

        <NavLink
          to="/admin/games"
          className={({ isActive }) =>
            isActive ? styles.activeLink : styles.link
          }
        >
          Jocuri
        </NavLink>

        <NavLink
          to="/admin/stories-review"
          className={({ isActive }) =>
            isActive ? styles.activeLink : styles.link
          }
        >
          Review povești
        </NavLink>

        <NavLink
          to="/admin/safety-alerts"
          className={({ isActive }) =>
            isActive ? styles.activeLink : styles.link
          }
        >
          Alerte siguranță
        </NavLink>
      </nav>
    </aside>
  );
}