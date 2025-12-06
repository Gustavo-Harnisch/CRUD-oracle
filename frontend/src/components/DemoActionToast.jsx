// src/components/DemoActionToast.jsx
import { useEffect, useRef, useState } from "react";

const outcomes = [
  { state: "success", message: "Acción realizada con éxito", color: "success" },
  { state: "error", message: "Acción rechazada", color: "danger" },
  { state: "warning", message: "Acción con errores", color: "warning" },
];

const defaultMessages = {
  success: "Acción realizada con éxito",
  error: "Acción rechazada",
  warning: "Acción con errores",
};

const normalizeOutcome = (payload) => {
  if (!payload || !payload.state) return null;
  const state = String(payload.state).toLowerCase();
  const colorMap = { success: "success", error: "danger", warning: "warning" };
  return {
    state,
    message: payload.message || defaultMessages[state] || defaultMessages.success,
    color: payload.color || colorMap[state] || "primary",
  };
};

const DemoActionToast = ({ actionKey, actionLabel = "Acción", onClose, result }) => {
  const [status, setStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const timers = useRef([]);
  const progressTimer = useRef(null);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  }, []);

  useEffect(() => {
    if (!actionKey) return;

    setStatus({ state: "loading", message: `${actionLabel} en progreso...` });
    setIsVisible(true);
    setProgress(100);

    const resultTimer = setTimeout(() => {
      const normalized = normalizeOutcome(result);
      const outcome = normalized || outcomes[Math.floor(Math.random() * outcomes.length)];

      setStatus(outcome);
      setProgress(100);

      const start = Date.now();
      progressTimer.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const pct = Math.max(0, 100 - (elapsed / 3000) * 100);
        setProgress(pct);
        if (pct <= 0) {
          clearInterval(progressTimer.current);
          progressTimer.current = null;
        }
      }, 50);

      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        const cleanupTimer = setTimeout(() => {
          setStatus(null);
          onClose?.();
        }, 250);
        timers.current.push(cleanupTimer);
      }, 3000);
      timers.current.push(hideTimer);
    }, 900);

    timers.current.push(resultTimer);

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
        progressTimer.current = null;
      }
    };
  }, [actionKey, actionLabel, onClose]);

  if (!status) return null;

  const colorClass =
    status.state === "loading"
      ? "bg-primary text-white"
      : status.color === "success"
        ? "bg-success text-white"
        : status.color === "danger"
          ? "bg-danger text-white"
          : "bg-warning text-dark";

  return (
    <div
      className="position-fixed start-50 translate-middle-x"
      style={{
        top: "10px",
        zIndex: 2000,
        transform: `translate(-50%, ${isVisible ? "0" : "-160%"})`,
        opacity: isVisible ? 1 : 0,
        transition: "transform 0.35s ease, opacity 0.35s ease",
      }}
    >
      <div className={`d-flex flex-column gap-2 px-4 py-3 rounded-3 shadow ${colorClass}`}>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            {status.state === "loading" ? (
              <div className="spinner-border spinner-border-sm text-light" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            ) : (
              <span className="fw-bold">•</span>
            )}
            <span className="fw-semibold text-uppercase small">{status.message}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-light ms-auto"
            onClick={() => {
              timers.current.forEach(clearTimeout);
              timers.current = [];
              if (progressTimer.current) {
                clearInterval(progressTimer.current);
                progressTimer.current = null;
              }
              setIsVisible(false);
              const cleanupTimer = setTimeout(() => {
                setStatus(null);
                onClose?.();
              }, 200);
              timers.current.push(cleanupTimer);
            }}
          >
            ×
          </button>
        </div>
        {status.state !== "loading" && (
          <div className="progress" style={{ height: "6px" }}>
            <div
              className="progress-bar bg-light"
              role="progressbar"
              style={{ width: `${progress}%`, transition: "width 0.05s linear" }}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoActionToast;
