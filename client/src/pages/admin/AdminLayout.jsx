import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import styles from "./AdminLayout.module.scss";

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={styles.adminPage}>
      <AdminSidebar />

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <h1 className={styles.pageTitle}>Panou de administrare</h1>
            <p className={styles.pageSubtitle}>
              Gestionare categorii, lecții, jocuri și conținut de siguranță
            </p>
          </div>

          <div className={styles.topbarRight}>
            <span className={styles.userBadge}>
              {user?.name || "Admin"}
            </span>

            <button className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}