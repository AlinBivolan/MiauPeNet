import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { startLesson, submitQuiz, checkAnswer } from "../api/lessonApi";
import styles from "./LessonPlayer.module.scss";

function getOptionId(option) {
  return String(option?.id ?? option?.answerId ?? option?._id ?? "");
}

function flattenLessonScreens(levels = []) {
  return levels.flatMap((level) =>
    (level.screens || []).map((screen, screenIndexInLevel) => ({
      ...screen,
      levelNumber: Number(level.level),
      screenIndexInLevel: Number(screenIndexInLevel),
      flatKey: `${level.level}-${screenIndexInLevel}`,
    }))
  );
}

export default function LessonPlayer() {
  const { categoryId, index } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);

  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);

  const [phase, setPhase] = useState("main");
  const [reviewQueue, setReviewQueue] = useState([]);
  const [reviewPointer, setReviewPointer] = useState(0);

  const [answersMap, setAnswersMap] = useState({});
  const [completedScreens, setCompletedScreens] = useState({});
  const [wrongScreens, setWrongScreens] = useState({});

  const [currentLocked, setCurrentLocked] = useState(false);
  const [feedbackState, setFeedbackState] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    loadLesson();
  }, [categoryId, index]);

  async function loadLesson() {
    try {
      setLoading(true);
      setMessage("");

      const { data } = await startLesson(categoryId, index);

      setLesson(data.lesson);
      setProgress(data.progress);

      resetSessionState();
    } catch (error) {
      console.error("LessonPlayer load error:", error);
      setMessage(
        error?.response?.data?.message || "Nu s-a putut încărca lecția."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetSessionState() {
    setCurrentScreenIndex(0);
    setPhase("main");
    setReviewQueue([]);
    setReviewPointer(0);
    setAnswersMap({});
    setCompletedScreens({});
    setWrongScreens({});
    setCurrentLocked(false);
    setFeedbackState(null);
  }

  const allScreens = useMemo(() => {
    if (!lesson?.levels?.length) return [];
    return flattenLessonScreens(lesson.levels);
  }, [lesson]);

  const currentScreen = useMemo(() => {
    if (!allScreens.length) return null;

    if (phase === "review") {
      const reviewItem = reviewQueue[reviewPointer];
      if (!reviewItem) return null;
      return allScreens[reviewItem.flatIndex] || null;
    }

    return allScreens[currentScreenIndex] || null;
  }, [allScreens, phase, reviewQueue, reviewPointer, currentScreenIndex]);

  const currentFlatIndex = useMemo(() => {
    if (!currentScreen) return null;

    if (phase === "review") {
      return reviewQueue[reviewPointer]?.flatIndex ?? null;
    }

    return currentScreenIndex;
  }, [currentScreen, phase, reviewQueue, reviewPointer, currentScreenIndex]);

  const currentScreenKey = useMemo(() => {
    if (!currentScreen || currentFlatIndex === null) return null;
    return currentScreen.flatKey;
  }, [currentScreen, currentFlatIndex]);

  const isOptionsQuestion = !!currentScreen?.options?.length;
  const isHotspotQuestion = currentScreen?.type === "image_hotspot";
  const isQuestionScreen = isOptionsQuestion || isHotspotQuestion;

  const isImageFocusedScreen =
    currentScreen?.type === "image" || currentScreen?.type === "image_hotspot";

  const selectedAnswers = answersMap[currentScreenKey] || [];
  const selectedHotspotPoint =
    isHotspotQuestion && currentScreenKey ? answersMap[currentScreenKey] : null;

  const totalScreens = allScreens.length;

  const completedCount = useMemo(() => {
    return Object.values(completedScreens).filter(Boolean).length;
  }, [completedScreens]);

  const progressPercent = useMemo(() => {
    if (!totalScreens) return 0;
    return Math.round((completedCount / totalScreens) * 100);
  }, [completedCount, totalScreens]);

  const chapterTitle =
    lesson?.categoryName ||
    lesson?.chapterTitle ||
    lesson?.chapterName ||
    "CAPITOL";

  function clearAnswerForScreen(screenKey) {
    if (!screenKey) return;

    setAnswersMap((prev) => {
      const copy = { ...prev };
      delete copy[screenKey];
      return copy;
    });
  }

  function markScreenCompleted(screenKey) {
    setCompletedScreens((prev) => ({
      ...prev,
      [screenKey]: true,
    }));
  }

  function markWrongScreen(screen) {
    if (!screen?.flatKey) return;

    setWrongScreens((prev) => ({
      ...prev,
      [screen.flatKey]: {
        flatIndex: allScreens.findIndex((item) => item.flatKey === screen.flatKey),
        flatKey: screen.flatKey,
        levelNumber: screen.levelNumber,
        screenIndexInLevel: screen.screenIndexInLevel,
      },
    }));
  }

  function clearWrongScreen(screenKey) {
    setWrongScreens((prev) => {
      const copy = { ...prev };
      delete copy[screenKey];
      return copy;
    });
  }

  function startReviewPhase() {
    const pendingReview = Object.values(wrongScreens);

    if (pendingReview.length === 0) return false;

    const sortedReview = [...pendingReview].sort(
      (a, b) => a.flatIndex - b.flatIndex
    );

    setPhase("review");
    setReviewQueue(sortedReview);
    setReviewPointer(0);
    setCurrentLocked(false);
    setFeedbackState(null);

    clearAnswerForScreen(sortedReview[0]?.flatKey);

    return true;
  }

  async function moveToNextMainScreen() {
    const isLastScreen = currentScreenIndex >= allScreens.length - 1;

    if (!isLastScreen) {
      setCurrentScreenIndex((prev) => prev + 1);
      setCurrentLocked(false);
      setFeedbackState(null);
      return;
    }

    const startedReview = startReviewPhase();

    if (!startedReview) {
      await submitWholeLesson();
    }
  }

  async function moveToNextReviewScreen() {
    const isLastReview = reviewPointer >= reviewQueue.length - 1;

    if (!isLastReview) {
      const nextPointer = reviewPointer + 1;
      const nextItem = reviewQueue[nextPointer];

      setReviewPointer(nextPointer);
      setCurrentLocked(false);
      setFeedbackState(null);

      if (nextItem?.flatKey) {
        clearAnswerForScreen(nextItem.flatKey);
      }

      return;
    }

    await submitWholeLesson();
  }

  function handleSelectAnswer(optionId) {
    if (
      !currentScreen ||
      !isOptionsQuestion ||
      currentLocked ||
      !currentScreenKey
    ) {
      return;
    }

    setFeedbackState(null);

    if (currentScreen.multiple) {
      setAnswersMap((prev) => {
        const previous = prev[currentScreenKey] || [];
        const next = previous.includes(optionId)
          ? previous.filter((id) => id !== optionId)
          : [...previous, optionId];

        return {
          ...prev,
          [currentScreenKey]: next,
        };
      });

      return;
    }

    setAnswersMap((prev) => ({
      ...prev,
      [currentScreenKey]: [optionId],
    }));
  }

  function handleHotspotClick(e) {
    if (
      !currentScreen ||
      !isHotspotQuestion ||
      currentLocked ||
      !currentScreenKey
    ) {
      return;
    }

    setFeedbackState(null);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setAnswersMap((prev) => ({
      ...prev,
      [currentScreenKey]: {
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
      },
    }));
  }

  function applyAnswerResult(isCorrect, successText, failText) {
    if (!currentScreen || !currentScreenKey) return;

    if (phase === "main") {
      if (isCorrect) {
        markScreenCompleted(currentScreenKey);
        clearWrongScreen(currentScreenKey);
        setCurrentLocked(true);
        setFeedbackState({
          status: "correct",
          text: successText || "Răspuns corect.",
        });
      } else {
        markWrongScreen(currentScreen);
        setCurrentLocked(true);
        setFeedbackState({
          status: "wrong",
          text: failText || "Răspuns greșit. Întrebarea va reveni la final.",
        });
      }

      return;
    }

    if (isCorrect) {
      markScreenCompleted(currentScreenKey);
      clearWrongScreen(currentScreenKey);
      setCurrentLocked(true);
      setFeedbackState({
        status: "correct",
        text: successText || "Răspuns corect.",
      });
    } else {
      setCurrentLocked(false);
      setFeedbackState({
        status: "wrong",
        text: "Încă nu este corect. Mai încearcă o dată.",
      });
    }
  }

  async function checkCurrentAnswer() {
    if (!currentScreen || !currentScreenKey || checking) return;

    try {
      setChecking(true);

      const payload = {
        screenIndex: currentScreen.screenIndexInLevel,
      };

      if (isOptionsQuestion) {
        payload.selectedOptionIds = answersMap[currentScreenKey] || [];
      }

      if (isHotspotQuestion) {
        payload.point = answersMap[currentScreenKey];
      }

      const response = await checkAnswer(
        lesson._id,
        currentScreen.levelNumber,
        payload
      );

      applyAnswerResult(
        response.data.isCorrect,
        response.data.successText,
        response.data.failText
      );
    } catch (error) {
      console.error("check answer error:", error);
      setFeedbackState({
        status: "wrong",
        text:
          error?.response?.data?.message ||
          "Nu s-a putut verifica răspunsul.",
      });
    } finally {
      setChecking(false);
    }
  }

  async function handleContinue() {
    if (!currentScreen) return;

    setMessage("");

    if (!isQuestionScreen) {
      markScreenCompleted(currentScreenKey);
    }

    if (phase === "main") {
      await moveToNextMainScreen();
      return;
    }

    await moveToNextReviewScreen();
  }

  async function submitWholeLesson() {
    if (!lesson?.levels?.length) return;

    try {
      let finalResponse = null;

      for (const level of lesson.levels) {
        const answersPayload = (level.screens || [])
          .map((screen, screenIndex) => ({
            screen,
            screenIndex,
          }))
          .filter(
            ({ screen }) =>
              Array.isArray(screen.options) && screen.options.length > 0
          )
          .map(({ screenIndex }) => ({
            screenIndex: Number(screenIndex),
            selectedOptionIds: answersMap[`${level.level}-${screenIndex}`] || [],
          }));

        const response = await submitQuiz(lesson._id, level.level, {
          answers: answersPayload,
        });

        finalResponse = response.data;
      }

      if (!finalResponse) return;

      setMessage(`${finalResponse.message} Scor: ${finalResponse.scorePercent}%`);
      setProgress(finalResponse.progress);

      if (finalResponse.progress?.status === "completed") {
        navigate("/app/lessons");
      }
    } catch (error) {
      console.error("submit whole lesson error:", error);
      setMessage("A apărut o eroare la trimiterea rezultatului.");
    }
  }

  if (loading) {
    return <div className={styles.stateMessage}>Se încarcă lecția...</div>;
  }

  if (!lesson || !currentScreen) {
    return (
      <div className={styles.stateMessage}>
        {message || "Lecția nu a fost găsită."}
      </div>
    );
  }

  function renderImage(image) {
    if (!image?.src) return null;

    if (isHotspotQuestion) {
      return (
        <div className={styles.hotspotWrapper}>
          <div className={styles.hotspotImageBox} onClick={handleHotspotClick}>
            <img
              src={image.src}
              alt={image.alt || ""}
              className={`${styles.screenImage} ${styles.screenImageLarge}`}
            />

            {selectedHotspotPoint && (
              <div
                className={styles.hotspotMarker}
                style={{
                  left: `${selectedHotspotPoint.x}%`,
                  top: `${selectedHotspotPoint.y}%`,
                }}
              />
            )}
          </div>
        </div>
      );
    }

    const imageClass = isImageFocusedScreen
      ? `${styles.screenImage} ${styles.screenImageLarge}`
      : `${styles.screenImage} ${styles.screenImageNormal}`;

    return <img src={image.src} alt={image.alt || ""} className={imageClass} />;
  }

  const showVerifyButton = isQuestionScreen && !currentLocked;

  const canVerify = isOptionsQuestion
    ? selectedAnswers.length > 0
    : isHotspotQuestion
    ? !!selectedHotspotPoint
    : false;

  const showContinueButton = !isQuestionScreen || currentLocked;

  return (
    <div className={styles.lessonPlayer}>
      <div className={styles.topBar}>
        <div className={styles.progressOuter}>
          <div
            className={styles.progressInner}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className={styles.progressCount}>
          {completedCount} / {totalScreens}
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.chapterRow}>
          <p className={styles.chapterTitle}>{chapterTitle}</p>

          {phase === "review" && (
            <div className={styles.reviewBadge}>Recapitulare finală</div>
          )}
        </div>

        <div className={styles.contentCenter}>
          <div
            className={`${styles.screenBlock} ${
              isImageFocusedScreen ? styles.screenBlockImageFocused : ""
            }`}
          >
            {currentScreen.title && (
              <h1 className={styles.screenTitle}>{currentScreen.title}</h1>
            )}

            {currentScreen.text && (
              <p
                className={`${styles.screenText} ${
                  isImageFocusedScreen ? styles.screenTextCompact : ""
                }`}
              >
                {currentScreen.text}
              </p>
            )}

            {renderImage(currentScreen.image)}

            {isOptionsQuestion && (
              <div className={styles.answersList}>
                {currentScreen.options.map((option) => {
                  const optionId = getOptionId(option);
                  const isChecked = selectedAnswers.includes(optionId);

                  const answerClasses = [
                    styles.answerCard,
                    isChecked ? styles.answerCardChecked : "",
                    currentLocked ? styles.answerCardDisabled : "",
                  ].join(" ");

                  return (
                    <label key={optionId} className={answerClasses}>
                      <input
                        type={currentScreen.multiple ? "checkbox" : "radio"}
                        name={`screen-${currentScreenKey}`}
                        checked={isChecked}
                        onChange={() => handleSelectAnswer(optionId)}
                        disabled={currentLocked}
                      />

                      <span>{option.text}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {feedbackState && (
              <div
                className={
                  feedbackState.status === "correct"
                    ? styles.correctText
                    : styles.wrongText
                }
              >
                {feedbackState.text}
              </div>
            )}

            {message && <div className={styles.messageBar}>{message}</div>}
          </div>
        </div>

        <div className={styles.bottomArea}>
          <div className={styles.actionsRow}>
            {showVerifyButton && (
              <button
                onClick={checkCurrentAnswer}
                className={styles.primaryBtn}
                disabled={!canVerify || checking}
              >
                {checking ? "SE VERIFICĂ..." : "VERIFICĂ"}
              </button>
            )}

            {showContinueButton && (
              <button onClick={handleContinue} className={styles.primaryBtn}>
                {phase === "review"
                  ? reviewPointer === reviewQueue.length - 1
                    ? "FINALIZEAZĂ"
                    : "CONTINUĂ"
                  : "CONTINUĂ"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}