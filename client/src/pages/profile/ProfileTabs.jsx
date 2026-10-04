import { NavLink } from "react-router-dom";
import styles from "./Profile.module.scss";

export default function ProfileTabs({ username }) {
  return (
    <div className={styles.tabs}>
      <NavLink
        to={`/app/profile/${username}/realizari`}
        className={({ isActive }) =>
          isActive ? styles.activeTabButton : styles.tabButton
        }
      >
        REALIZĂRI
      </NavLink>

      <NavLink
        to={`/app/profile/${username}/statistici`}
        className={({ isActive }) =>
          isActive ? styles.activeTabButton : styles.tabButton
        }
      >
        STATISTICI
      </NavLink>

      <NavLink
        to={`/app/profile/${username}/jurnal`}
        className={({ isActive }) =>
          isActive ? styles.activeTabButton : styles.tabButton
        }
      >
        JURNALUL TĂU
      </NavLink>
    </div>
  );
}