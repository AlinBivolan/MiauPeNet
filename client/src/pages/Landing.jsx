import { Link } from "react-router-dom";
import catAvatar from "/img/usable/landing-cat.png";
import styles from "./Landing.module.scss";

export default function Landing() {
  return (
    <div className={styles.landing}>
      <div className={styles.landingImageWrap}>
        <img
          className={styles.landingImage}
          src={catAvatar}
          alt="Pisica geometrica"
        />
      </div>

      <div className={styles.landingCard}>
        <p className={styles.landingText}>
          Învata sa recunosti riscurile din mediul online si sa navighezi in
          siguranta prin lectii interactive si exercitii educationale.
        </p>

        <div className={styles.landingButtons}>
          <Link to="/login">
            <button className={`${styles.btn} ${styles.loginBtn}`}>
              LOGIN
            </button>
          </Link>

          <Link to="/signin">
            <button className={`${styles.btn} ${styles.signupBtn}`}>
              SIGN UP
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}