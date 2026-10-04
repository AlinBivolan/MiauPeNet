import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import styles from "./Profile.module.scss";

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));

    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file);
    }, "image/jpeg");
  });
}

export default function ProfileSettings() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [quote, setQuote] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropType, setCropType] = useState("avatar");
  const [tempImageSrc, setTempImageSrc] = useState("");

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Nu s-au putut încărca setările.");
        }

        const data = await res.json();

        setProfile(data);
        setName(data.name || "");
        setQuote(data.quote || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    return () => {
      if (tempImageSrc?.startsWith("blob:")) {
        URL.revokeObjectURL(tempImageSrc);
      }
    };
  }, [tempImageSrc]);

  const avatarPreview = useMemo(() => {
    if (avatarFile) {
      return URL.createObjectURL(avatarFile);
    }

    if (profile?.avatar) {
      return `http://localhost:5000${profile.avatar}`;
    }

    return "";
  }, [avatarFile, profile]);

  const coverPreview = useMemo(() => {
    if (coverFile) {
      return URL.createObjectURL(coverFile);
    }

    if (profile?.coverImage) {
      return `http://localhost:5000${profile.coverImage}`;
    }

    return "";
  }, [coverFile, profile]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user");
    navigate("/login");
  }

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  function openCropper(file, type) {
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);

    setCropType(type);
    setTempImageSrc(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropModalOpen(true);
  }

  async function confirmCrop() {
    if (!tempImageSrc || !croppedAreaPixels) return;

    const croppedBlob = await getCroppedImg(tempImageSrc, croppedAreaPixels);
    const croppedFile = new File(
      [croppedBlob],
      `${cropType}-${Date.now()}.jpg`,
      { type: "image/jpeg" }
    );

    if (cropType === "avatar") {
      setAvatarFile(croppedFile);
    } else {
      setCoverFile(croppedFile);
    }

    if (tempImageSrc?.startsWith("blob:")) {
      URL.revokeObjectURL(tempImageSrc);
    }

    setTempImageSrc("");
    setCropModalOpen(false);
  }

  function closeCropper() {
    if (tempImageSrc?.startsWith("blob:")) {
      URL.revokeObjectURL(tempImageSrc);
    }

    setTempImageSrc("");
    setCropModalOpen(false);
  }

  async function handleSaveProfile() {
    try {
      setSavingProfile(true);

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          quote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Nu s-au putut salva datele.");
      }

      setProfile((prev) => ({
        ...prev,
        name: data.name,
        quote: data.quote,
      }));

      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : {};

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...parsedUser,
          name: data.name,
        })
      );

      alert("Datele profilului au fost salvate.");
    } catch (error) {
      alert(error.message || "A apărut o eroare.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAvatarUpload() {
    if (!avatarFile) return;

    try {
      setAvatarUploading(true);

      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("avatar", avatarFile);

      const res = await fetch("http://localhost:5000/api/auth/profile/avatar", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Avatar upload failed");
      }

      setProfile((prev) => ({
        ...prev,
        avatar: data.avatar,
      }));

      setAvatarFile(null);
      alert("Poza de profil a fost actualizată.");
    } catch (error) {
      alert(error.message || "Eroare la upload avatar.");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleCoverUpload() {
    if (!coverFile) return;

    try {
      setCoverUploading(true);

      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("coverImage", coverFile);

      const res = await fetch("http://localhost:5000/api/auth/profile/cover", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Cover upload failed");
      }

      setProfile((prev) => ({
        ...prev,
        coverImage: data.coverImage,
      }));

      setCoverFile(null);
      alert("Imaginea de fundal a fost actualizată.");
    } catch (error) {
      alert(error.message || "Eroare la upload cover.");
    } finally {
      setCoverUploading(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.settingsPage}>
        <div className={styles.settingsCard}>
          Se încarcă setările...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.settingsPage}>
      <div className={`${styles.settingsCard} ${styles.profileSettingsCard}`}>
        <div className={styles.settingsHero}>
          <div>
            <h2 className={styles.settingsTitle}>Setări profil</h2>
            <p className={styles.settingsSubtitle}>
              Editează informațiile, poza de profil și fundalul contului tău.
            </p>
          </div>

          <button
            type="button"
            className={styles.settingsBackBtn}
            onClick={() => navigate(-1)}
          >
            Înapoi
          </button>
        </div>

        <div className={styles.settingsGrid}>
          <section className={`${styles.settingsBlock} ${styles.settingsInfoBlock}`}>
            <div className={styles.settingsBlockHeader}>
              <span className={styles.settingsBlockIcon}>✨</span>
              <div>
                <h3>Informații profil</h3>
                <p>Numele și descrierea care apar pe profil.</p>
              </div>
            </div>

            <label className={styles.formGroup}>
              <span>Nume afișat</span>
              <input
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Numele care se vede pe profil"
              />
            </label>

            <label className={styles.formGroup}>
              <span>Descriere</span>
              <textarea
                className={styles.textarea}
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Scrie ceva despre tine"
              />
            </label>

            <button
              type="button"
              className={styles.pinkActionBtn}
              onClick={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? "Se salvează..." : "Salvează informațiile"}
            </button>
          </section>

          <section className={`${styles.settingsBlock} ${styles.settingsMediaBlock}`}>
            <div className={styles.settingsBlockHeader}>
              <span className={styles.settingsBlockIcon}>🐱</span>
              <div>
                <h3>Poză de profil</h3>
                <p>Alege și decupează avatarul tău.</p>
              </div>
            </div>

            <div className={styles.avatarSettingsPreviewWrap}>
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className={styles.settingsAvatarPreview}
                />
              ) : (
                <div className={styles.noImageBox}>Nu există poză de profil</div>
              )}
            </div>

            <label className={styles.prettyFilePicker}>
              Alege imagine
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) =>
                  openCropper(e.target.files?.[0] || null, "avatar")
                }
              />
            </label>

            <button
              type="button"
              className={styles.pinkActionBtn}
              onClick={handleAvatarUpload}
              disabled={!avatarFile || avatarUploading}
            >
              {avatarUploading ? "Se salvează..." : "Salvează avatarul"}
            </button>
          </section>

          <section
            className={`${styles.settingsBlock} ${styles.settingsBlockWide} ${styles.settingsCoverBlock}`}
          >
            <div className={styles.settingsBlockHeader}>
              <span className={styles.settingsBlockIcon}>🌈</span>
              <div>
                <h3>Imagine de fundal</h3>
                <p>Imaginea mare care apare deasupra profilului.</p>
              </div>
            </div>

            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Cover preview"
                className={styles.settingsCoverPreview}
              />
            ) : (
              <div className={styles.noImageBox}>Nu există imagine de fundal</div>
            )}

            <label className={styles.prettyFilePicker}>
              Alege fundal
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) =>
                  openCropper(e.target.files?.[0] || null, "cover")
                }
              />
            </label>

            <button
              type="button"
              className={styles.pinkActionBtn}
              onClick={handleCoverUpload}
              disabled={!coverFile || coverUploading}
            >
              {coverUploading ? "Se salvează..." : "Salvează fundalul"}
            </button>
          </section>
        </div>

        <div className={styles.settingsActions}>
          <button
            type="button"
            className={styles.settingsBackBtn}
            onClick={() => navigate(-1)}
          >
            Înapoi
          </button>

          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {cropModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.cropModalCard} ${styles.prettyCropModal}`}>
            <div className={styles.modalHeader}>
              <div>
                <h3>
                  {cropType === "avatar"
                    ? "Decupează poza de profil"
                    : "Decupează imaginea de fundal"}
                </h3>
                <p className={styles.modalSubtitle}>
                  Mută imaginea și ajustează zoom-ul până arată perfect.
                </p>
              </div>

              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={closeCropper}
              >
                ✕
              </button>
            </div>

            <div className={styles.cropArea}>
              <Cropper
                image={tempImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={cropType === "avatar" ? 1 : 16 / 7}
                cropShape={cropType === "avatar" ? "round" : "rect"}
                showGrid={cropType !== "avatar"}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className={styles.cropControls}>
              <label className={styles.zoomLabel}>
                Zoom
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className={styles.zoomSlider}
                />
              </label>
            </div>

            <div className={styles.settingsActions}>
              <button
                type="button"
                className={styles.pinkActionBtn}
                onClick={confirmCrop}
              >
                Folosește imaginea
              </button>

              <button
                type="button"
                className={styles.logoutBtn}
                onClick={closeCropper}
              >
                Renunță
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}