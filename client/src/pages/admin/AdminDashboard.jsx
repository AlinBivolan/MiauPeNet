import styles from "./AdminLayout.module.scss";

export default function AdminDashboard() {
  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Dashboard</h2>
      </div>

      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Categorii</h3>
          <p className={styles.cardText}>
            Creezi, editezi și ștergi categoriile aplicației.
          </p>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Lecții</h3>
          <p className={styles.cardText}>
            Adaugi lecții noi, alegi categoria și grupa de vârstă.
          </p>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Control conținut</h3>
          <p className={styles.cardText}>
            Poți organiza mai ușor conținutul fără seed script-uri.
          </p>
        </div>
      </div>
    </div>
  );
}